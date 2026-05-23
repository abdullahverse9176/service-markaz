import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import Category from "@/models/Category";

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

// GET /api/admin/categories
export async function GET(request) {
  const payload = verifyAdmin(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const isActive = searchParams.get("isActive");
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
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const [categories, total, activeCount, inactiveCount] = await Promise.all([
      Category.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Category.countDocuments(query),
      Category.countDocuments({ isActive: true }),
      Category.countDocuments({ isActive: false }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        categories,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        summary: {
          total: total,
          active: activeCount,
          inactive: inactiveCount,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/admin/categories error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}

// POST /api/admin/categories — Create a new category
export async function POST(request) {
  const payload = verifyAdmin(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, icon, color, bar } = body;

    if (!name || !icon || !color || !bar) {
      return NextResponse.json(
        { success: false, message: "Required fields: name, icon, color, bar" },
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

    // Check if category already exists
    const existing = await Category.findOne({
      $or: [{ name: { $regex: `^${name}$`, $options: "i" } }, { slug }],
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Category with this name already exists" },
        { status: 409 }
      );
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      description: description?.trim() || "",
      icon,
      color,
      bar,
      isActive: true,
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/categories error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}

// PATCH /api/admin/categories — Update a category
export async function PATCH(request) {
  const payload = verifyAdmin(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { categoryId, name, description, icon, color, bar, isActive } = body;

    if (!categoryId) {
      return NextResponse.json({ success: false, message: "categoryId is required" }, { status: 400 });
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
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (bar !== undefined) updateData.bar = bar;
    if (isActive !== undefined) updateData.isActive = isActive;

    const category = await Category.findByIdAndUpdate(categoryId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("PATCH /api/admin/categories error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}

// DELETE /api/admin/categories/:id
export async function DELETE(request) {
  const payload = verifyAdmin(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("id");

    if (!categoryId) {
      return NextResponse.json({ success: false, message: "Category ID is required" }, { status: 400 });
    }

    await connectDB();

    // Check if category has businesses
    const businessCount = await Business.countDocuments({ category: categoryId });
    if (businessCount > 0) {
      return NextResponse.json(
        { success: false, message: `Cannot delete category with ${businessCount} active businesses` },
        { status: 409 }
      );
    }

    const category = await Category.findByIdAndDelete(categoryId);

    if (!category) {
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/categories error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
