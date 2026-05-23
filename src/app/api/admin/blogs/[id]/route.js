import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import Blog from "@/models/Blog";
import { generateSlug } from "@/utils/slug";

// ── Auth helper ────────────────────────────────────────────────────────────────
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

// ── Read-time calculator ───────────────────────────────────────────────────────
function estimateReadTime(htmlContent) {
  const text = htmlContent.replace(/<[^>]+>/g, "");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

// ── GET /api/admin/blogs/[id] ─────────────────────────────────────────────────
export async function GET(request, { params }) {
  const payload = verifyAdmin(request);
  if (!payload)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await connectDB();

    const blog = await Blog.findById(id).lean();
    if (!blog)
      return NextResponse.json({ success: false, message: "Blog not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: blog });
  } catch (error) {
    console.error("GET /api/admin/blogs/[id] error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}

// ── PATCH /api/admin/blogs/[id] ───────────────────────────────────────────────
export async function PATCH(request, { params }) {
  const payload = verifyAdmin(request);
  if (!payload)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    await connectDB();

    const blog = await Blog.findById(id);
    if (!blog)
      return NextResponse.json({ success: false, message: "Blog not found" }, { status: 404 });

    const {
      title,
      slug: rawSlug,
      excerpt,
      content,
      category,
      tags,
      coverIconName,
      coverGradient,
      image,
      featured,
      status,
      author,
    } = body;

    // Update fields selectively
    if (title !== undefined) blog.title = title;
    if (excerpt !== undefined) blog.excerpt = excerpt;
    if (content !== undefined) {
      blog.content = content;
      blog.readTime = estimateReadTime(content);
    }
    if (category !== undefined) blog.category = category;
    if (tags !== undefined) blog.tags = tags.filter(Boolean);
    if (coverIconName !== undefined) blog.coverIconName = coverIconName;
    if (coverGradient !== undefined) blog.coverGradient = coverGradient;
    if (image !== undefined) blog.image = image;
    if (featured !== undefined) blog.featured = featured;
    if (author !== undefined) blog.author = author;

    // Handle slug update (ensure uniqueness)
    if (rawSlug !== undefined) {
      const newSlug = generateSlug(rawSlug);
      if (newSlug !== blog.slug) {
        const conflict = await Blog.findOne({ slug: newSlug, _id: { $ne: id } }).lean();
        blog.slug = conflict ? `${newSlug}-${Date.now()}` : newSlug;
      }
    } else if (title !== undefined && !rawSlug) {
      // Auto-update slug when title changes (only if slug wasn't manually set)
      const newSlug = generateSlug(title);
      if (newSlug !== blog.slug) {
        const conflict = await Blog.findOne({ slug: newSlug, _id: { $ne: id } }).lean();
        blog.slug = conflict ? `${newSlug}-${Date.now()}` : newSlug;
      }
    }

    // Handle status change
    if (status !== undefined) {
      if (status === "published" && blog.status !== "published") {
        blog.publishedAt = new Date();
      }
      blog.status = status;
    }

    await blog.save();

    return NextResponse.json({ success: true, data: blog });
  } catch (error) {
    console.error("PATCH /api/admin/blogs/[id] error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}

// ── DELETE /api/admin/blogs/[id] ──────────────────────────────────────────────
export async function DELETE(request, { params }) {
  const payload = verifyAdmin(request);
  if (!payload)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await connectDB();

    const blog = await Blog.findByIdAndDelete(id);
    if (!blog)
      return NextResponse.json({ success: false, message: "Blog not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/blogs/[id] error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
