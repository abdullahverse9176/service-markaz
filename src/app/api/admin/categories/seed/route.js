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

const SEED_CATEGORIES = [
  {
    name: "Electricians",
    icon: "Zap",
    description: "Electrical work and installations",
    color: "bg-yellow-100 text-yellow-700",
    bar: "bg-yellow-400",
  },
  {
    name: "Plumbers",
    icon: "Wrench",
    description: "Plumbing and water system services",
    color: "bg-blue-100 text-blue-700",
    bar: "bg-blue-400",
  },
  {
    name: "AC Repair",
    icon: "Snowflake",
    description: "Air conditioning and cooling services",
    color: "bg-cyan-100 text-cyan-700",
    bar: "bg-cyan-400",
  },
  {
    name: "Carpenters",
    icon: "Hammer",
    description: "Carpentry and wood work",
    color: "bg-orange-100 text-orange-700",
    bar: "bg-orange-400",
  },
  {
    name: "Home Cleaning",
    icon: "Brush",
    description: "Home and office cleaning services",
    color: "bg-green-100 text-green-700",
    bar: "bg-green-400",
  },
  {
    name: "Tutors",
    icon: "BookOpen",
    description: "Educational tutoring services",
    color: "bg-purple-100 text-purple-700",
    bar: "bg-purple-400",
  },
  {
    name: "Tailors",
    icon: "Scissors",
    description: "Tailoring and clothing repair",
    color: "bg-pink-100 text-pink-700",
    bar: "bg-pink-400",
  },
];

// POST /api/admin/categories/seed — Initialize categories from seed data (admin only)
export async function POST(request) {
  const payload = verifyAdmin(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    // Check if categories already exist
    const existingCount = await Category.countDocuments();
    if (existingCount > 0) {
      return NextResponse.json(
        { success: false, message: "Categories already initialized" },
        { status: 409 }
      );
    }

    // Create categories from seed data
    const created = [];
    for (const cat of SEED_CATEGORIES) {
      const slug = cat.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

      const category = await Category.create({
        name: cat.name,
        slug,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        bar: cat.bar,
        isActive: true,
      });
      created.push(category);
    }

    return NextResponse.json({
      success: true,
      message: `Initialized ${created.length} categories`,
      data: created,
    });
  } catch (error) {
    console.error("POST /api/admin/categories/seed error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
