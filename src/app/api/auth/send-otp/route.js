import { NextResponse } from "next/server";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import { sendEmail, otpEmailTemplate } from "@/lib/email/mailer";

function verifyToken(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// POST /api/auth/send-otp — send (or resend) a 6-digit OTP to the user's email
export async function POST(request) {
  const payload = verifyToken(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const user = await User.findById(payload.id).select("+emailOtp +emailOtpExpiry");
  if (!user) {
    return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
  }

  if (user.isEmailVerified) {
    return NextResponse.json({ success: false, message: "Email is already verified" }, { status: 400 });
  }

  // Rate-limit: block resend if the OTP was sent less than 60 seconds ago.
  // OTP expiry = sentAt + 5min, so "sent less than 60s ago" means: now < expiry - 4min
  if (user.emailOtp && user.emailOtpExpiry) {
    const sentAt = user.emailOtpExpiry.getTime() - 5 * 60 * 1000;
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

  user.emailOtp = otpHash;
  user.emailOtpExpiry = expiry;
  await user.save();

  try {
    await sendEmail({
      to: user.email,
      subject: "Your Service Markaz Verification Code",
      html: otpEmailTemplate({ name: user.name, otp }),
    });
  } catch (err) {
    console.error("OTP email error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to send OTP email. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, message: "OTP sent to your email" });
}
