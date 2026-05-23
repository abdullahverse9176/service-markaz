import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import Lead from "@/models/Lead";
import Business from "@/models/Business";

function verifyToken(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// GET /api/leads/received — provider fetches leads for their business (paginated)
export async function GET(request) {
  const payload = verifyToken(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

  await connectDB();

  const business = await Business.findOne({ owner: payload.id }).select("_id").lean();
  if (!business) {
    return NextResponse.json({ success: false, message: "No business found" }, { status: 404 });
  }

  const [leads, total] = await Promise.all([
    Lead.find({ business: business._id })
      .populate("customer", "name phone")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Lead.countDocuments({ business: business._id }),
  ]);

  return NextResponse.json({
    success: true,
    data: leads,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
