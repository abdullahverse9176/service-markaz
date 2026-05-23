import { NextResponse } from "next/server";
import crypto from "crypto";
import User from "@/models/User";
import { connectDB } from "@/lib/db/connect";
import { sendEmail, passwordResetOtpTemplate } from "@/lib/email/mailer";

export async function POST(request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { success: false, message: "Email is required" },
                { status: 400 }
            );
        }

        await connectDB();

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        // Always return success to avoid exposing whether email exists
        if (!user) {
            return NextResponse.json(
                { success: true, message: "If this email is registered, an OTP has been sent." },
                { status: 200 }
            );
        }

        // Rate-limit: block resend if OTP was sent less than 60 seconds ago
        if (user.resetOtpExpiry) {
            const sentAt = user.resetOtpExpiry.getTime() - 5 * 60 * 1000;
            const secondsSinceSent = Math.floor((Date.now() - sentAt) / 1000);
            if (secondsSinceSent < 60) {
                return NextResponse.json(
                    { success: false, message: `Please wait ${60 - secondsSinceSent}s before requesting a new OTP` },
                    { status: 429 }
                );
            }
        }

        // Generate a cryptographically secure 6-digit OTP
        const otp = String(crypto.randomInt(100000, 999999));
        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
        const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        const updateResult = await User.findByIdAndUpdate(
            user._id,
            { $set: { resetOtp: otpHash, resetOtpExpiry: expiry } },
            { new: true, strict: false }
        );
        console.log("[forgot-password] OTP saved:", {
            userId: user._id,
            resetOtp: updateResult?.resetOtp,
            resetOtpExpiry: updateResult?.resetOtpExpiry,
        });

        try {
            await sendEmail({
                to: user.email,
                subject: "Your Password Reset Code — Service Markaz",
                html: passwordResetOtpTemplate({ name: user.name, otp }),
            });
        } catch (err) {
            console.error("Password reset OTP email error:", err);
            return NextResponse.json(
                { success: false, message: "Failed to send OTP email. Please try again." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, message: "OTP sent to your registered email address." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { success: false, message: "Something went wrong" },
            { status: 500 }
        );
    }
}
