import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Referral from "@/models/Referral";

/**
 * GET /api/referrals/leaderboard
 * Returns the top 10 referrers by approved referral count.
 * Public endpoint — no auth required (names are shown, no PII).
 */
export async function GET() {
    await connectDB();

    const leaders = await Referral.aggregate([
        { $match: { status: "approved" } },
        { $group: { _id: "$referrer", approvedCount: { $sum: 1 } } },
        { $sort: { approvedCount: -1 } },
        { $limit: 10 },
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
                _id: 0,
                name: "$user.name",
                badges: "$user.badges",
                approvedCount: 1,
            },
        },
    ]);

    return NextResponse.json({ success: true, data: leaders });
}
