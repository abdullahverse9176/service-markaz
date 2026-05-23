import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import Business from "@/models/Business";
import Lead from "@/models/Lead";

function verifyToken(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// GET /api/business/analytics
// Returns analytics for the authenticated provider's business.
export async function GET(request) {
  const payload = verifyToken(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    // Find the provider's business
    const business = await Business.findOne({ owner: payload.id })
      .select("_id viewCount weeklyViews monthlyViews rating reviewsCount")
      .lean();

    if (!business) {
      return NextResponse.json(
        { success: false, message: "No business found" },
        { status: 404 }
      );
    }

    // Aggregate lead stats for this business
    const [leadStats] = await Lead.aggregate([
      { $match: { business: business._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          confirmed: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          awaiting: { $sum: { $cond: [{ $eq: ["$status", "awaiting_response"] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
          disputed: { $sum: { $cond: [{ $eq: ["$status", "disputed"] }, 1, 0] } },
          callLeads: { $sum: { $cond: [{ $eq: ["$source", "call"] }, 1, 0] } },
          whatsappLeads: { $sum: { $cond: [{ $eq: ["$source", "whatsapp"] }, 1, 0] } },
          formLeads: { $sum: { $cond: [{ $eq: ["$source", "form"] }, 1, 0] } },
        },
      },
    ]);

    // Recent 5 leads for the quick list
    const recentLeads = await Lead.find({ business: business._id })
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("source status createdAt customer")
      .lean();

    const total = leadStats?.total ?? 0;
    const confirmed = leadStats?.confirmed ?? 0;

    return NextResponse.json({
      success: true,
      data: {
        views: {
          total: business.viewCount ?? 0,
          weekly: business.weeklyViews ?? 0,
          monthly: business.monthlyViews ?? 0,
        },
        leads: {
          total,
          confirmed,
          pending: (leadStats?.pending ?? 0) + (leadStats?.awaiting ?? 0),
          rejected: leadStats?.rejected ?? 0,
          disputed: leadStats?.disputed ?? 0,
          conversionRate: total > 0 ? Math.round((confirmed / total) * 100) : 0,
          bySource: {
            call: leadStats?.callLeads ?? 0,
            whatsapp: leadStats?.whatsappLeads ?? 0,
            form: leadStats?.formLeads ?? 0,
          },
        },
        reviews: {
          rating: business.rating ?? 0,
          count: business.reviewsCount ?? 0,
        },
        recentLeads: recentLeads.map((l) => ({
          _id: l._id,
          customerName: l.customer?.name ?? "Unknown",
          source: l.source,
          status: l.status,
          createdAt: l.createdAt,
        })),
      },
    });
  } catch (err) {
    console.error("GET /api/business/analytics error:", err);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
