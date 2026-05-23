import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Blog from "@/models/Blog";

// GET /api/blogs/[slug] — Fetch a single published blog by slug
export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    await connectDB();

    const blog = await Blog.findOne({ slug, status: "published" }).lean();
    if (!blog) {
      return NextResponse.json(
        { success: false, message: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: blog });
  } catch (error) {
    console.error("GET /api/blogs/[slug] error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
