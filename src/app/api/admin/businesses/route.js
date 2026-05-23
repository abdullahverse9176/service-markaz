import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import Business from "@/models/Business";
import "@/models/User"; // register User model so .populate("owner") works in isolated serverless bundles

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

// GET /api/admin/businesses
export async function GET(request) {
  const payload = verifyAdmin(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const city = searchParams.get("city") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

    await connectDB();

    // Build filter query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    if (status) query.status = status;
    if (category) query.category = category;
    if (city) query.city = city;

    const [businesses, total, statusCounts] = await Promise.all([
      Business.find(query)
        .populate("owner", "name email phone role")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Business.countDocuments(query),
      // Single aggregation replaces 3 separate countDocuments calls
      Business.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);

    const statusMap = {};
    statusCounts.forEach((s) => { statusMap[s._id] = s.count; });

    return NextResponse.json({
      success: true,
      data: {
        businesses,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        summary: {
          active:  statusMap.active  ?? 0,
          pending: statusMap.pending ?? 0,
          blocked: statusMap.blocked ?? 0,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/admin/businesses error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}

// PATCH /api/admin/businesses — update status or featured flag of a business
export async function PATCH(request) {
  const payload = verifyAdmin(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { businessId, status, featured } = body;

    if (!businessId) {
      return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
    }

    const updateData = {};
    if (status !== undefined) {
      if (!["active", "blocked", "pending"].includes(status)) {
        return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
      }
      updateData.status = status;
    }
    if (featured !== undefined) {
      updateData.featured = Boolean(featured);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, message: "Nothing to update" }, { status: 400 });
    }

    await connectDB();

    const business = await Business.findByIdAndUpdate(
      businessId,
      updateData,
      { new: true }
    ).populate("owner", "name email phone role");

    if (!business) {
      return NextResponse.json({ success: false, message: "Business not found" }, { status: 404 });
    }

    // If the featured flag changed, purge the home page cache so the
    // Featured Providers section reflects the new state immediately.
    if (featured !== undefined) {
      revalidatePath("/");
    }

    return NextResponse.json({ success: true, message: "Business updated", data: business });
  } catch (error) {
    console.error("PATCH /api/admin/businesses error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
