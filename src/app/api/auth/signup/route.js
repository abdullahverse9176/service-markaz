import { NextResponse } from "next/server";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { hashPassword } from "@/lib/utils/hash";
import User     from "@/models/User";
import Referral from "@/models/Referral";
import { connectDB } from "@/lib/db/connect";
import { sendEmail, otpEmailTemplate } from "@/lib/email/mailer";

export async function POST(request) {
    try {
        const body = await request.json();

        const { firstName, lastName, email, phone, whatsapp, password, referralCode } = body;
        const name = `${firstName ?? ""} ${lastName ?? ""}`.trim();

        // ---------- Validation ----------
        if (!firstName || !lastName || !email || !phone || !password) {
            return NextResponse.json(
                { success: false, message: "All fields are required" },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, message: "Invalid email format" },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { success: false, message: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        await connectDB();

        // Run duplicate-checks and referral lookup in parallel to save DB round trips
        const normalizedReferralCode = referralCode ? referralCode.toUpperCase().trim() : null;
        const [existingUser, phoneUser, referrer] = await Promise.all([
            User.findOne({ email }).select("_id").lean(),
            phone ? User.findOne({ phone }).select("_id").lean() : null,
            normalizedReferralCode
                ? User.findOne({ referralCode: normalizedReferralCode }).select("_id").lean()
                : null,
        ]);

        if (existingUser) {
            return NextResponse.json(
                { success: false, message: "Email already exists" },
                { status: 409 }
            );
        }

        if (phoneUser) {
            return NextResponse.json(
                { success: false, message: "Phone number already registered" },
                { status: 409 }
            );
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await User.create({
            name,
            email,
            phone,
            whatsapp: whatsapp || null,
            password: hashedPassword,
            referredBy: referrer?._id ?? null,
        });

        // Create a pending Referral document if a valid referrer was found
        if (referrer) {
            await Referral.create({
                referrer: referrer._id,
                referee:  newUser._id,
                code:     normalizedReferralCode,
                status:   "pending",
            });
        }

        // Send OTP email (best-effort — don't block signup on failure)
        try {
            const otp = String(crypto.randomInt(100000, 999999));
            const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
            const expiry = new Date(Date.now() + 5 * 60 * 1000);
            await User.findByIdAndUpdate(newUser._id, { emailOtp: otpHash, emailOtpExpiry: expiry });
            await sendEmail({
                to: newUser.email,
                subject: "Your Service Markaz Verification Code",
                html: otpEmailTemplate({ name: newUser.name, otp }),
            });
        } catch (otpErr) {
            console.error("OTP send error on signup:", otpErr);
        }

        const token = jwt.sign(
            { id: newUser._id, email: newUser.email, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return NextResponse.json(
            {
                success: true,
                message: "User created successfully",
                token,
                data: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    phone: newUser.phone,
                    role: newUser.role,
                    isEmailVerified: false,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Signup error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 500 }
        );
    }
}

