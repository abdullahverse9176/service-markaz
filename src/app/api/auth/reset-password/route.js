import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { hashPassword } from "@/lib/utils/hash";
import User from "@/models/User";
import { connectDB } from "@/lib/db/connect";

export async function POST(request) {
    try {
        const body = await request.json();
        const { resetToken, newPassword } = body;

        if (!resetToken || !newPassword) {
            return NextResponse.json(
                { success: false, message: "Reset token and new password are required" },
                { status: 400 }
            );
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                { success: false, message: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        // Verify reset token
        let payload;
        try {
            payload = jwt.verify(resetToken, process.env.JWT_SECRET);
        } catch {
            return NextResponse.json(
                { success: false, message: "Reset link has expired or is invalid. Please try again." },
                { status: 401 }
            );
        }

        if (payload.purpose !== "reset") {
            return NextResponse.json(
                { success: false, message: "Invalid reset token" },
                { status: 401 }
            );
        }

        await connectDB();

        const hashedPassword = await hashPassword(newPassword);

        await User.findByIdAndUpdate(payload.id, { password: hashedPassword });

        return NextResponse.json(
            { success: true, message: "Password reset successfully. You can now sign in." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            { success: false, message: "Something went wrong" },
            { status: 500 }
        );
    }
}
