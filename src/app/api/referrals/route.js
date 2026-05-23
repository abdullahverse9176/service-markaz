import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import User     from "@/models/User";
import Referral from "@/models/Referral";
import { getReferralProgress } from "@/lib/utils/referralRewards";

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

/** GET /api/referrals
 *  Returns the authenticated provider's referral code, invite link,
 *  referral list, and milestone progress. */
export async function GET(request) {
    const decoded = getUserFromRequest(request);
    if (!decoded) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();

        const user = await User.findById(decoded.id).select(
            "name referralCode badges subscription lifetimeEligible"
        );
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        // Back-fill referral code for users created before this feature
        if (!user.referralCode) {
            const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            let code;
            let attempts = 0;
            do {
                code = Array.from({ length: 8 }, () =>
                    chars[Math.floor(Math.random() * chars.length)]
                ).join("");
                // eslint-disable-next-line no-await-in-loop
                const exists = await User.exists({ referralCode: code });
                if (!exists) break;
                attempts++;
            } while (attempts < 10);
            // Use updateOne to avoid triggering the pre-save hook again
            await User.updateOne({ _id: user._id }, { $set: { referralCode: code } });
            user.referralCode = code;
        }

        const [referrals, progress] = await Promise.all([
            Referral.find({ referrer: user._id })
                .sort({ createdAt: -1 })
                .populate("referee", "name email createdAt")
                .lean(),
            getReferralProgress(user._id),
        ]);

        const reqUrl  = new URL(request.url);
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
            ?? `${reqUrl.protocol}//${reqUrl.host}`;
        const inviteLink = `${baseUrl}/sign-up?ref=${user.referralCode}`;

        return NextResponse.json({
            success: true,
            data: {
                referralCode: user.referralCode,
                inviteLink,
                badges: user.badges ?? [],
                subscription: user.subscription ?? { plan: "free", expiresAt: null, source: "free" },
                lifetimeEligible: user.lifetimeEligible ?? false,
                referrals,
                progress,
            },
        });
    } catch (err) {
        console.error("GET /api/referrals error:", err);
        return NextResponse.json(
            { success: false, message: err.message || "Internal server error" },
            { status: 500 }
        );
    }
}
