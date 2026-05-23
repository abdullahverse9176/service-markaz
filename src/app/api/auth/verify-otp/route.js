import { NextResponse } from "next/server";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";

function verifyToken(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// POST /api/auth/verify-otp — verify the 6-digit OTP and mark email as verified
export async function POST(request) {
  const payload = verifyToken(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 });
  }

  const { otp } = body;
  if (!otp || typeof otp !== "string" || !/^\d{6}$/.test(otp.trim())) {
    return NextResponse.json({ success: false, message: "Enter a valid 6-digit OTP" }, { status: 400 });
  }

  await connectDB();

  const user = await User.findById(payload.id).select("+emailOtp +emailOtpExpiry");
  if (!user) {
    return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
  }

  if (user.isEmailVerified) {
    return NextResponse.json({ success: false, message: "Email is already verified" }, { status: 400 });
  }

  if (!user.emailOtp || !user.emailOtpExpiry) {
    return NextResponse.json(
      { success: false, message: "No OTP found. Please request a new one." },
      { status: 400 }
    );
  }

  if (new Date() > user.emailOtpExpiry) {
    return NextResponse.json(
      { success: false, message: "OTP has expired. Please request a new one." },
      { status: 400 }
    );
  }

  const submittedHash = crypto.createHash("sha256").update(otp.trim()).digest("hex");
  if (submittedHash !== user.emailOtp) {
    return NextResponse.json({ success: false, message: "Invalid OTP. Please try again." }, { status: 400 });
  }

  // Mark verified and clear OTP fields
  user.isEmailVerified = true;
  user.emailOtp = null;
  user.emailOtpExpiry = null;
  await user.save();

  return NextResponse.json({
    success: true,
    message: "Email verified successfully!",
    data: { isEmailVerified: true },
  });
}
