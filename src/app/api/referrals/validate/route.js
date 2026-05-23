import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";

/**
 * GET /api/referrals/validate?code=XXXXXXXX
 * Checks whether a referral code is valid (belongs to a real user).
 * Called client-side on the sign-up page to show the referrer's name.
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code")?.toUpperCase().trim();

    if (!code) {
        return NextResponse.json(
            { success: false, message: "code is required" },
            { status: 400 }
        );
    }

    await connectDB();

    const user = await User.findOne({ referralCode: code }).select("name");
    if (!user) {
        return NextResponse.json(
            { success: false, message: "Invalid referral code" },
            { status: 404 }
        );
    }

    return NextResponse.json({ success: true, data: { name: user.name } });
}
