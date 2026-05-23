import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import Referral from "@/models/Referral";
import { applyReferralRewards } from "@/lib/utils/referralRewards";

function getUserFromRequest(request) {
    const auth = request.headers.get("authorization") ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return null;
    }
}

/**
 * POST /api/referrals/activate
 *
 * Called internally (server-to-server or from the leads/business creation flow)
 * when a referred provider becomes "active" — defined as:
 *   • Their business profile is complete (handled in add-business route)
 *   • They receive their first confirmed lead  ← trigger point
 *
 * Body: { refereeId: string }   (or auto-derived from JWT if caller is the referee)
 *
 * This endpoint is also protected so it can only be called by the referee
 * themselves or by an admin.
 */
export async function POST(request) {
    const decoded = getUserFromRequest(request);
    if (!decoded) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Determine referee: admins can pass an explicit refereeId in body
    let refereeId = decoded.id;
    if (decoded.role === "admin") {
        const body = await request.json().catch(() => ({}));
        if (body.refereeId) refereeId = body.refereeId;
    }

    const referral = await Referral.findOne({ referee: refereeId });

    if (!referral) {
        // User was not referred — nothing to do
        return NextResponse.json({ success: true, message: "No referral found for this user" });
    }

    if (referral.status === "approved") {
        return NextResponse.json({ success: true, message: "Referral already approved" });
    }

    if (referral.status === "revoked") {
        return NextResponse.json(
            { success: false, message: "Referral has been revoked" },
            { status: 409 }
        );
    }

    // Approve and trigger the reward engine
    referral.status     = "approved";
    referral.approvedAt = new Date();
    await referral.save();

    await applyReferralRewards(referral.referrer);

    return NextResponse.json({ success: true, message: "Referral approved and rewards applied" });
}
