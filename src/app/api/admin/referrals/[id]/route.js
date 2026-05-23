import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import Referral from "@/models/Referral";
import User     from "@/models/User";
import { applyReferralRewards } from "@/lib/utils/referralRewards";

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
 * PATCH /api/admin/referrals/[id]
 * Actions: "approve" | "revoke" | "approve_lifetime"
 *
 * Body: { action: string, reason?: string, note?: string }
 */
export async function PATCH(request, { params }) {
    if (!getAdmin(request)) {
        return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { action, reason = "", note = "" } = body;

    if (!["approve", "revoke", "approve_lifetime"].includes(action)) {
        return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
    }

    await connectDB();

    const referral = await Referral.findById(id);
    if (!referral) {
        return NextResponse.json({ success: false, message: "Referral not found" }, { status: 404 });
    }

    if (action === "approve") {
        if (referral.status === "approved") {
            return NextResponse.json({ success: true, message: "Already approved" });
        }
        referral.status     = "approved";
        referral.approvedAt = new Date();
        if (note) referral.adminNote = note;
        await referral.save();
        await applyReferralRewards(referral.referrer);
    }

    if (action === "revoke") {
        referral.status        = "revoked";
        referral.revokedAt     = new Date();
        referral.revokedReason = reason || "Admin revoked";
        if (note) referral.adminNote = note;
        await referral.save();
        // Reward is NOT automatically reversed — admin can manually adjust subscription
    }

    if (action === "approve_lifetime") {
        // Grant lifetime subscription to the referrer manually
        const referrer = await User.findById(referral.referrer);
        if (!referrer) {
            return NextResponse.json({ success: false, message: "Referrer not found" }, { status: 404 });
        }
        referrer.subscription.plan      = "lifetime";
        referrer.subscription.expiresAt = null; // never expires
        referrer.subscription.source    = "referral_lifetime";
        referrer.lifetimeEligible       = true;
        if (note) referral.adminNote = note;
        await Promise.all([referrer.save(), referral.save()]);
    }

    return NextResponse.json({ success: true, message: `Referral ${action} successful` });
}
