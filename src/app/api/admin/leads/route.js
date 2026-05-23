import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import Lead from "@/models/Lead";

function verifyAdmin(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const payload = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
    return payload.role === "admin" ? payload : null;
  } catch {
    return null;
  }
}

function isValidObjectId(id) {
  return /^[a-f\d]{24}$/i.test(id);
}

/**
 * GET /api/admin/leads
 * Query params:
 *   page, limit       — pagination
 *   status            — filter by lead status
 *   source            — filter by source (call/whatsapp/form)
 *   businessId        — filter by specific provider
 *   search            — search customer name (via populate)
 *   view=per_provider — returns aggregated stats per provider instead of lead list
 */
export async function GET(request) {
  const payload = verifyAdmin(request);
  if (!payload)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const view       = searchParams.get("view") || "list";
  const status     = searchParams.get("status") || "";
  const source     = searchParams.get("source") || "";
  const businessId = searchParams.get("businessId") || "";
  const search     = searchParams.get("search")?.trim() || "";
  const page       = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit      = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "15", 10)));

  await connectDB();

  // Helper: derive summary object from a raw aggregation result
  function buildSummary(leadStatusCounts) {
    const m = {};
    leadStatusCounts.forEach((s) => { m[s._id] = s.count; });
    const totalLeads     = Object.values(m).reduce((a, b) => a + b, 0);
    const totalConfirmed = m.confirmed ?? 0;
    const totalPending   = (m.pending ?? 0) + (m.awaiting_response ?? 0);
    const totalDisputed  = m.disputed ?? 0;
    const totalRejected  = m.rejected ?? 0;
    return {
      totalLeads,
      totalConfirmed,
      totalPending,
      totalDisputed,
      totalRejected,
      conversionRate: totalLeads > 0 ? Math.round((totalConfirmed / totalLeads) * 100) : 0,
    };
  }

  // ── Per-provider analytics view ──────────────────────────────────────────
  if (view === "per_provider") {
    const pipeline = [
      {
        $group: {
          _id: "$business",
          totalLeads:    { $sum: 1 },
          confirmed:     { $sum: { $cond: [{ $eq: ["$status", "confirmed"] },    1, 0] } },
          pending:       { $sum: { $cond: [{ $in:  ["$status", ["pending", "awaiting_response"]] }, 1, 0] } },
          rejected:      { $sum: { $cond: [{ $eq: ["$status", "rejected"] },     1, 0] } },
          disputed:      { $sum: { $cond: [{ $eq: ["$status", "disputed"] },     1, 0] } },
          lastLeadAt:    { $max: "$createdAt" },
        },
      },
      {
        $lookup: {
          from: "businesses",
          localField: "_id",
          foreignField: "_id",
          as: "business",
        },
      },
      { $unwind: { path: "$business", preserveNullAndEmpty: true } },
      {
        $addFields: {
          providerName:     { $ifNull: ["$business.name",     "Unknown"] },
          providerCategory: { $ifNull: ["$business.category", "—"] },
          providerCity:     { $ifNull: ["$business.city",     "—"] },
          conversionRate: {
            $cond: [
              { $gt: ["$totalLeads", 0] },
              { $multiply: [{ $divide: ["$confirmed", "$totalLeads"] }, 100] },
              0,
            ],
          },
        },
      },
      { $sort: { totalLeads: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          business: 0,
          _id: 0,
          businessId: "$_id",
          providerName: 1,
          providerCategory: 1,
          providerCity: 1,
          totalLeads: 1,
          confirmed: 1,
          pending: 1,
          rejected: 1,
          disputed: 1,
          conversionRate: { $round: ["$conversionRate", 0] },
          lastLeadAt: 1,
        },
      },
    ];

    // Summary runs in parallel with both provider queries — saves 1 round trip
    const [leadStatusCounts, providers, totalProviders] = await Promise.all([
      Lead.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Lead.aggregate(pipeline),
      Lead.aggregate([{ $group: { _id: "$business" } }, { $count: "n" }]),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        summary: buildSummary(leadStatusCounts),
        providers,
        total: totalProviders[0]?.n ?? 0,
        page,
        totalPages: Math.ceil((totalProviders[0]?.n ?? 0) / limit),
      },
    });
  }

  // ── Lead list view (default) ─────────────────────────────────────────────
  const matchStage = {};
  if (status) matchStage.status = status;
  if (source) matchStage.source = source;
  if (businessId && isValidObjectId(businessId)) matchStage.business = new mongoose.Types.ObjectId(businessId);

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "customer",
        foreignField: "_id",
        as: "customerData",
      },
    },
    {
      $lookup: {
        from: "businesses",
        localField: "business",
        foreignField: "_id",
        as: "businessData",
      },
    },
    {
      $addFields: {
        customerName: { $ifNull: [{ $arrayElemAt: ["$customerData.name",  0] }, "Unknown"] },
        customerPhone:{ $ifNull: [{ $arrayElemAt: ["$customerData.phone", 0] }, "—"] },
        businessName: { $ifNull: [{ $arrayElemAt: ["$businessData.name",  0] }, "Unknown"] },
        businessCity: { $ifNull: [{ $arrayElemAt: ["$businessData.city",  0] }, "—"] },
        businessCategory: { $ifNull: [{ $arrayElemAt: ["$businessData.category", 0] }, "—"] },
      },
    },
    ...(search
      ? [{ $match: { $or: [
          { customerName: { $regex: search, $options: "i" } },
          { businessName: { $regex: search, $options: "i" } },
        ]}}]
      : []),
    { $sort: { createdAt: -1 } },
  ];

  // Summary runs in parallel with both lead queries — saves 1 round trip
  const [leadStatusCounts, leads, countResult] = await Promise.all([
    Lead.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Lead.aggregate([
      ...pipeline,
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          customerData: 0, businessData: 0,
        },
      },
    ]),
    Lead.aggregate([...pipeline, { $count: "n" }]),
  ]);

  const total = countResult[0]?.n ?? 0;

  return NextResponse.json({
    success: true,
    data: {
      summary: buildSummary(leadStatusCounts),
      leads,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  });
}
