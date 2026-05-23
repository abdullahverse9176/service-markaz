import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import Referral from "@/models/Referral";

function getAdmin(request) {
    const auth = request.headers.get("authorization") ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.role === "admin" ? decoded : null;
    } catch {
        return null;
    }
}

/**
 * GET /api/admin/referrals
 * Query params: status, page, limit, search (referee/referrer name or email)
 *
 * Also returns top-10 referrers summary via ?view=leaderboard
 */
export async function GET(request) {
    if (!getAdmin(request)) {
        return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const view   = searchParams.get("view");
    const status = searchParams.get("status") ?? "";
    const page   = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit  = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));
    const skip   = (page - 1) * limit;

    if (view === "leaderboard") {
        const leaders = await Referral.aggregate([
            { $match: { status: "approved" } },
            { $group: { _id: "$referrer", approvedCount: { $sum: 1 } } },
            { $sort: { approvedCount: -1 } },
            { $limit: 20 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: "$user" },
            {
                $project: {
                    userId: "$_id",
                    name: "$user.name",
                    email: "$user.email",
                    badges: "$user.badges",
                    lifetimeEligible: "$user.lifetimeEligible",
                    approvedCount: 1,
                },
            },
        ]);
        return NextResponse.json({ success: true, data: leaders });
    }

    const filter = {};
    if (status) filter.status = status;

    // Summary aggregation runs in parallel with the main query — saves 1 round trip
    const [referrals, total, summaryResult] = await Promise.all([
        Referral.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("referrer", "name email referralCode")
            .populate("referee", "name email createdAt")
            .lean(),
        Referral.countDocuments(filter),
        Referral.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);

    const summaryMap = Object.fromEntries(summaryResult.map((s) => [s._id, s.count]));

    return NextResponse.json({
        success: true,
        data: {
            referrals,
            total,
            pages: Math.ceil(total / limit),
            page,
            summary: {
                pending:  summaryMap.pending  ?? 0,
                approved: summaryMap.approved ?? 0,
                revoked:  summaryMap.revoked  ?? 0,
            },
        },
    });
}
