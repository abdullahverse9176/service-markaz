import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { comparePassword } from "@/lib/utils/hash";
import User from "@/models/User";
import { connectDB } from "@/lib/db/connect";

export async function POST(request) {
    try {
        const body = await request.json();

        const { email, password } = body;

        // ---------- Validation ----------
        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: "Email and password are required" },
                { status: 400 }
            );
        }

        await connectDB();

        // select: false on password field — must explicitly include it
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Invalid email or password" },
                { status: 401 }
            );
        }

        const isMatch = await comparePassword(password, user.password);

        if (!isMatch) {
            return NextResponse.json(
                { success: false, message: "Invalid email or password" },
                { status: 401 }
            );
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return NextResponse.json(
            {
                success: true,
                message: "Signed in successfully",
                data: {
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        whatsapp: user.whatsapp,
                        role: user.role,
                        isEmailVerified: user.isEmailVerified ?? false,
                    },
                    token,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Signin error:", error);

        return NextResponse.json(
            { success: false, message: "Something went wrong" },
            { status: 500 }
        );
    }
}
