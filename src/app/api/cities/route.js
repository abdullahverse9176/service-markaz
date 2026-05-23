import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import City from "@/models/City";

// GET /api/cities — Public endpoint to fetch all active cities
export async function GET(request) {
  try {
    await connectDB();

    const cities = await City.find({ status: "active" })
      .sort({ createdAt: 1 })
      .select("name slug description businessCount image")
      .lean();

    return NextResponse.json({
      success: true,
      data: cities,
    });
  } catch (error) {
    console.error("GET /api/cities error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
