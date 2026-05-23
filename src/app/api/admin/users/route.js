import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import Business from "@/models/Business";

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

// GET /api/admin/users
export async function GET(request) {
  const payload = verifyAdmin(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

    await connectDB();

    // Build filter query (non-admin users only)
    const query = { role: { $ne: "admin" } };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    if (role && role !== "admin") query.role = role;
    if (status) query.status = status;

    const [rawUsers, total, roleCounts] = await Promise.all([
      User.find(query)
        .select("-password -favoriteGame")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
      // Single aggregation replaces 3 separate countDocuments calls
      User.aggregate([
        { $match: { role: { $ne: "admin" } } },
        { $group: { _id: { role: "$role", status: "$status" }, count: { $sum: 1 } } },
      ]),
    ]);

    // Derive summary counters from the aggregation result
    let totalProviders = 0, totalCustomers = 0, totalBlocked = 0;
    roleCounts.forEach(({ _id, count }) => {
      if (_id.role === "provider") totalProviders += count;
      if (_id.role === "customer") totalCustomers += count;
      if (_id.status === "blocked") totalBlocked += count;
    });

    // Attach businessId to provider rows so the admin can link to the provider profile
    const providerIds = rawUsers
      .filter((u) => u.role === "provider")
      .map((u) => u._id);

    const businessMap = {};
    if (providerIds.length > 0) {
      const businesses = await Business.find({ owner: { $in: providerIds } })
        .select("owner")
        .lean();
      businesses.forEach((b) => {
        businessMap[b.owner.toString()] = b._id.toString();
      });
    }

    const users = rawUsers.map((u) =>
      u.role === "provider"
        ? { ...u, businessId: businessMap[u._id.toString()] ?? null }
        : u
    );

    return NextResponse.json({
      success: true,
      data: {
        users,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        summary: {
          providers: totalProviders,
          customers: totalCustomers,
          blocked: totalBlocked,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}

// PATCH /api/admin/users — update status of a user
export async function PATCH(request) {
  const payload = verifyAdmin(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, status } = body;

    if (!userId || !["active", "blocked", "pending"].includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOneAndUpdate(
      { _id: userId, role: { $ne: "admin" } },
      { status },
      { new: true }
    ).select("-password -favoriteGame");

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // If the user is a provider, sync their business status:
    // blocked → block the business; active/pending → restore to active
    if (user.role === "provider") {
      const businessStatus = status === "blocked" ? "blocked" : "active";
      await Business.updateOne({ owner: user._id }, { status: businessStatus });
    }

    return NextResponse.json({ success: true, message: "User updated", data: user });
  } catch (error) {
    console.error("PATCH /api/admin/users error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
