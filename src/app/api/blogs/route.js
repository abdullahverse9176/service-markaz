import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Blog from "@/models/Blog";

// GET /api/blogs — Fetch published blogs (paginated, filterable)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category")?.trim() || "";
    const featured = searchParams.get("featured");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "6", 10)));

    await connectDB();

    const query = { status: "published" };
    if (category && category !== "All") query.category = category;
    if (featured === "true") query.featured = true;

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-content") // Exclude heavy content from list view
        .lean(),
      Blog.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: { blogs, total, page, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET /api/blogs error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
