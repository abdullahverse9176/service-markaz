import { NextResponse } from "next/server";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { connectDB } from "@/lib/db/connect";

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, otp } = body;

        if (!email || !otp) {
            return NextResponse.json(
                { success: false, message: "Email and OTP are required" },
                { status: 400 }
            );
        }

        if (typeof otp !== "string" || !/^\d{6}$/.test(otp.trim())) {
            return NextResponse.json(
                { success: false, message: "Enter a valid 6-digit OTP" },
                { status: 400 }
            );
        }

        await connectDB();

        const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+resetOtp +resetOtpExpiry");

        console.log("[verify-otp] received:", { email: email.toLowerCase().trim(), otp });
        console.log("[verify-otp] user found:", !!user);
        if (user) console.log("[verify-otp] resetOtp:", user.resetOtp, "| resetOtpExpiry:", user.resetOtpExpiry);

        const invalidMsg = "Invalid or expired OTP";

        if (!user || !user.resetOtp || !user.resetOtpExpiry) {
            return NextResponse.json(
                { success: false, message: invalidMsg },
                { status: 400 }
            );
        }

        if (new Date() > user.resetOtpExpiry) {
            return NextResponse.json(
                { success: false, message: "OTP has expired. Please request a new one." },
                { status: 400 }
            );
        }

        const submittedHash = crypto.createHash("sha256").update(otp.trim()).digest("hex");
        if (submittedHash !== user.resetOtp) {
            return NextResponse.json(
                { success: false, message: invalidMsg },
                { status: 400 }
            );
        }

        // Clear the OTP now that it's been verified
        await User.findByIdAndUpdate(user._id, { $set: { resetOtp: null, resetOtpExpiry: null } });

        // Issue a short-lived reset token (15 minutes)
        const resetToken = jwt.sign(
            { id: user._id, purpose: "reset" },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        return NextResponse.json(
            {
                success: true,
                message: "OTP verified. You can now reset your password.",
                resetToken,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Forgot password verify-otp error:", error);
        return NextResponse.json(
            { success: false, message: "Something went wrong" },
            { status: 500 }
        );
    }
}
