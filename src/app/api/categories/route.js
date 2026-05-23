import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Category from "@/models/Category";

// GET /api/categories — Public endpoint to fetch all active categories
export async function GET(request) {
  try {
    await connectDB();

    const categories = await Category.find({ isActive: true })
      .sort({ createdAt: 1 })
      .select("name slug description icon color bar businessCount")
      .lean();

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
