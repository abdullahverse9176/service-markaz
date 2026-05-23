import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import City from "@/models/City";

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

const SEED_CITIES = [
  { name: "Rawalpindi", description: "City in Punjab, Pakistan" },
  { name: "Islamabad", description: "Capital city of Pakistan" },
  { name: "Lahore", description: "Major city in Punjab, Pakistan" },
  { name: "Karachi", description: "Largest city in Pakistan" },
  { name: "Faisalabad", description: "City in Punjab, Pakistan" },
  { name: "Multan", description: "Historic city in Punjab, Pakistan" },
  { name: "Peshawar", description: "Capital of Khyber Pakhtunkhwa" },
  { name: "Quetta", description: "Capital of Balochistan province" },
];

// POST /api/admin/cities/seed — Initialize cities from seed data (admin only)
export async function POST(request) {
  const payload = verifyAdmin(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    // Check if cities already exist
    const existingCount = await City.countDocuments();
    if (existingCount > 0) {
      return NextResponse.json(
        { success: false, message: "Cities already initialized" },
        { status: 409 }
      );
    }

    // Create cities from seed data
    const created = [];
    for (const city of SEED_CITIES) {
      const slug = city.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

      const c = await City.create({
        name: city.name,
        slug,
        description: city.description,
        status: "active",
      });
      created.push(c);
    }

    return NextResponse.json({
      success: true,
      message: `Initialized ${created.length} cities`,
      data: created,
    });
  } catch (error) {
    console.error("POST /api/admin/cities/seed error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
