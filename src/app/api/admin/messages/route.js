import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import ContactMessage from "@/models/ContactMessage";

function verifyAdmin(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const payload = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
    return payload.role === "admin" ? payload : null;
  } catch {
    return null;
  }
}

// GET /api/admin/messages
export async function GET(request) {
  const payload = verifyAdmin(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || ""; // "read" | "unread" | ""
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

    await connectDB();

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }
    if (status === "read" || status === "unread") query.status = status;

    const [messages, total, msgStatusCounts] = await Promise.all([
      ContactMessage.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ContactMessage.countDocuments(query),
      // Single aggregation replaces 2 separate countDocuments calls
      ContactMessage.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);

    const msgCountMap = {};
    msgStatusCounts.forEach((s) => { msgCountMap[s._id] = s.count; });
    const totalUnread = msgCountMap.unread ?? 0;
    const totalRead   = msgCountMap.read   ?? 0;

    return NextResponse.json({
      success: true,
      data: {
        messages,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        summary: { total: totalUnread + totalRead, unread: totalUnread, read: totalRead },
      },
    });
  } catch (error) {
    console.error("GET /api/admin/messages error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
