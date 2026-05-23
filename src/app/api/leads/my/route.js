import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import Lead from "@/models/Lead";

function verifyToken(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// GET /api/leads/my — returns all leads created by the current customer
export async function GET(request) {
  const payload = verifyToken(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const leads = await Lead.find({ customer: payload.id })
    .populate("business", "name category city area profileImage")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ success: true, data: leads });
}
