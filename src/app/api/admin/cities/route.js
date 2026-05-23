import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import City from "@/models/City";
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

// GET /api/admin/cities
export async function GET(request) {
  const payload = verifyAdmin(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

    await connectDB();

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (status) query.status = status;

    // Single parallel batch — replaces 4 sequential awaits
    const [cities, total, cityStatusCounts, totalBusinesses] = await Promise.all([
      City.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      City.countDocuments(query),
      // Single aggregation replaces 2 separate countDocuments for status
      City.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Business.countDocuments(),
    ]);

    const cityStatusMap = {};
    cityStatusCounts.forEach((s) => { cityStatusMap[s._id] = s.count; });

    return NextResponse.json({
      success: true,
      data: {
        cities,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        summary: {
          total,
          active:    cityStatusMap.active  ?? 0,
          blocked:   cityStatusMap.blocked ?? 0,
          businesses: totalBusinesses,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/admin/cities error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}

// POST /api/admin/cities — Create a new city
export async function POST(request) {
  const payload = verifyAdmin(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, image } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "City name is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");

    // Check if city already exists
    const existing = await City.findOne({
      $or: [{ name: { $regex: `^${name}$`, $options: "i" } }, { slug }],
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "City with this name already exists" },
        { status: 409 }
      );
    }

    const city = await City.create({
      name: name.trim(),
      slug,
      description: description?.trim() || "",
      image: image?.trim() || "",
      status: "active",
    });

    revalidatePath("/");
    revalidatePath("/cities");

    return NextResponse.json({ success: true, data: city }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/cities error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}

// PATCH /api/admin/cities — Update a city
export async function PATCH(request) {
  const payload = verifyAdmin(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { cityId, name, description, image, status } = body;

    if (!cityId) {
      return NextResponse.json({ success: false, message: "cityId is required" }, { status: 400 });
    }

    if (status && !["active", "blocked"].includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
    }

    await connectDB();

    const updateData = {};
    if (name !== undefined) {
      updateData.name = name.trim();
      // Regenerate slug if name changed
      updateData.slug = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");
    }
    if (description !== undefined) updateData.description = description.trim();
    if (image !== undefined) updateData.image = image.trim();
    if (status !== undefined) updateData.status = status;

    const city = await City.findByIdAndUpdate(cityId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!city) {
      return NextResponse.json({ success: false, message: "City not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/cities");

    return NextResponse.json({ success: true, data: city });
  } catch (error) {
    console.error("PATCH /api/admin/cities error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}

// DELETE /api/admin/cities/:id
export async function DELETE(request) {
  const payload = verifyAdmin(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get("id");

    if (!cityId) {
      return NextResponse.json({ success: false, message: "City ID is required" }, { status: 400 });
    }

    await connectDB();

    // Check if city has businesses
    const businessCount = await Business.countDocuments({ city: cityId });
    if (businessCount > 0) {
      return NextResponse.json(
        { success: false, message: `Cannot delete city with ${businessCount} active businesses` },
        { status: 409 }
      );
    }

    const city = await City.findByIdAndDelete(cityId);

    if (!city) {
      return NextResponse.json({ success: false, message: "City not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/cities");

    return NextResponse.json({ success: true, message: "City deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/cities error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
