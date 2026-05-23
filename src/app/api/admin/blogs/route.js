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

// ── GET /api/admin/blogs ───────────────────────────────────────────────────────
export async function GET(request) {
  const payload = verifyAdmin(request);
  if (!payload)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

    await connectDB();

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
      ];
    }
    if (status) query.status = status;
    if (category) query.category = category;

    const [blogs, total, publishedCount, draftCount, featuredCount] = await Promise.all([
      Blog.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-content") // Exclude heavy content from list
        .lean(),
      Blog.countDocuments(query),
      Blog.countDocuments({ status: "published" }),
      Blog.countDocuments({ status: "draft" }),
      Blog.countDocuments({ featured: true }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        blogs,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        summary: {
          total: publishedCount + draftCount, // derived — no extra query needed
          published: publishedCount,
          drafts: draftCount,
          featured: featuredCount,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/admin/blogs error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}

// ── POST /api/admin/blogs ─────────────────────────────────────────────────────
export async function POST(request) {
  const payload = verifyAdmin(request);
  if (!payload)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const {
      title,
      slug: rawSlug,
      excerpt,
      content,
      category,
      tags = [],
      coverIconName = "BookOpen",
      coverGradient = "from-blue-500 to-indigo-600",
      image = "",
      featured = false,
      status = "draft",
      author = "Service Markaz Team",
    } = body;

    if (!title || !excerpt || !content || !category) {
      return NextResponse.json(
        { success: false, message: "title, excerpt, content, and category are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Generate a unique slug
    let slug = rawSlug ? generateSlug(rawSlug) : generateSlug(title);
    const existing = await Blog.findOne({ slug }).lean();
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const readTime = estimateReadTime(content);
    const publishedAt = status === "published" ? new Date() : undefined;

    const blog = await Blog.create({
      title,
      slug,
      excerpt,
      content,
      category,
      tags: tags.filter(Boolean),
      coverIconName,
      coverGradient,
      image,
      featured,
      status,
      readTime,
      author,
      publishedAt,
    });

    return NextResponse.json({ success: true, data: blog }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/blogs error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
