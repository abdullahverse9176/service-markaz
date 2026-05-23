import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import Business from "@/models/Business";
import User from "@/models/User";
import Review from "@/models/Review";
import City from "@/models/City";
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

// GET /api/admin/dashboard
export async function GET(request) {
  const payload = verifyAdmin(request);
  if (!payload)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();

    // ── Single parallel batch — all queries fire simultaneously ─────────────
    const [
      totalUsers,
      totalBusinesses,
      pendingCount,
      activeProviders,
      totalReviews,
      citiesCovered,
      totalLeads,
      confirmedLeads,
      pendingBusinesses,
      recentUsers,
      byCategory,
      byCity,
      recentBusinesses,
      recentReviews,
      leadSourceBreakdown,
      topProviders,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: "admin" } }),
      Business.countDocuments(),
      Business.countDocuments({ status: "pending" }),
      Business.countDocuments({ status: "active" }),
      Review.countDocuments(),
      City.countDocuments({ status: "active" }),
      Lead.countDocuments(),
      Lead.countDocuments({ status: "confirmed" }),
      // ── Pending businesses (up to 5) ──────────────────────────────────────
      Business.find({ status: "pending" })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name category city createdAt")
        .lean(),
      // ── Recent users (up to 5) — also reused for activity feed ───────────
      User.find({ role: { $ne: "admin" } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email role status createdAt")
        .lean(),
      // ── Businesses by category ────────────────────────────────────────────
      Business.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
        { $project: { _id: 0, name: "$_id", count: 1 } },
      ]),
      // ── Businesses by city ────────────────────────────────────────────────
      Business.aggregate([
        { $group: { _id: "$city", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
        { $project: { _id: 0, city: "$_id", count: 1 } },
      ]),
      // ── Recent activity: businesses ───────────────────────────────────────
      Business.find()
        .sort({ createdAt: -1 })
        .limit(4)
        .select("name status createdAt")
        .lean(),
      // ── Recent activity: reviews ──────────────────────────────────────────
      Review.aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 3 },
        {
          $lookup: {
            from: "businesses",
            localField: "business",
            foreignField: "_id",
            as: "biz",
            pipeline: [{ $project: { name: 1 } }],
          },
        },
        {
          $project: {
            rating: 1,
            createdAt: 1,
            businessName: { $ifNull: [{ $arrayElemAt: ["$biz.name", 0] }, "Unknown"] },
          },
        },
      ]),
      // ── Lead source breakdown ─────────────────────────────────────────────
      Lead.aggregate([
        { $group: { _id: "$source", count: { $sum: 1 } } },
        { $project: { _id: 0, source: "$_id", count: 1 } },
      ]),
      // ── Top providers by conversion rate (min 5 leads) ────────────────────
      Lead.aggregate([
        {
          $group: {
            _id: "$business",
            total: { $sum: 1 },
            confirmed: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } },
          },
        },
        { $match: { total: { $gte: 5 } } },
        {
          $addFields: {
            conversionRate: {
              $round: [{ $multiply: [{ $divide: ["$confirmed", "$total"] }, 100] }, 0],
            },
          },
        },
        { $sort: { conversionRate: -1, confirmed: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "businesses",
            localField: "_id",
            foreignField: "_id",
            as: "biz",
            pipeline: [{ $project: { name: 1, category: 1, city: 1 } }],
          },
        },
        {
          $project: {
            _id: 0,
            businessId: "$_id",
            name: { $ifNull: [{ $arrayElemAt: ["$biz.name", 0] }, "Unknown"] },
            category: { $ifNull: [{ $arrayElemAt: ["$biz.category", 0] }, "—"] },
            city: { $ifNull: [{ $arrayElemAt: ["$biz.city", 0] }, "—"] },
            total: 1,
            confirmed: 1,
            conversionRate: 1,
          },
        },
      ]),
    ]);

    // ── Merge + sort activity ─────────────────────────────────────────────────
    // recentUsers is reused here (first 3 entries) to avoid a duplicate query
    const activity = [
      ...recentBusinesses.map((b) => ({
        type: b.status === "active" ? "approved" : "new_business",
        text:
          b.status === "active"
            ? `${b.name} was approved`
            : `${b.name} submitted a listing`,
        createdAt: b.createdAt,
        dot: b.status === "active" ? "bg-green-500" : "bg-blue-500",
      })),
      ...recentUsers.slice(0, 3).map((u) => ({
        type: "new_user",
        text: `${u.name} registered as a ${u.role}`,
        createdAt: u.createdAt,
        dot: "bg-purple-500",
      })),
      ...recentReviews.map((r) => ({
        type: "review",
        text: `New ${r.rating}★ review on ${r.businessName}`,
        createdAt: r.createdAt,
        dot: "bg-yellow-500",
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);

    // Normalize source breakdown into a flat object
    const sourceMap = { call: 0, whatsapp: 0, form: 0 };
    leadSourceBreakdown.forEach((s) => {
      if (s.source in sourceMap) sourceMap[s.source] = s.count;
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalBusinesses,
          pendingCount,
          activeProviders,
          totalReviews,
          citiesCovered,
          totalLeads,
          confirmedLeads,
          leadConversionRate: totalLeads > 0 ? Math.round((confirmedLeads / totalLeads) * 100) : 0,
        },
        pendingBusinesses: pendingBusinesses.map((b) => ({
          id: b._id.toString(),
          name: b.name,
          category: b.category,
          city: b.city,
          submitted: new Date(b.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          avatar: b.name.charAt(0).toUpperCase(),
        })),
        recentUsers: recentUsers.map((u) => ({
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.status,
          joined: new Date(u.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        })),
        byCategory,
        byCity,
        activity: activity.map((a) => ({
          type: a.type,
          text: a.text,
          dot: a.dot,
          time: timeAgo(a.createdAt),
        })),
        leadSources: sourceMap,
        topProviders,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/dashboard error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}
