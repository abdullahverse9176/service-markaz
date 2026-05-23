import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Business from "@/models/Business";
import Category from "@/models/Category";
import "@/models/User"; // register User model so .populate("owner") works in isolated serverless bundles

// Sort options map
const SORT_MAP = {
  rating: { rating: -1, createdAt: -1 },
  newest: { createdAt: -1 },
  experience: { experience: -1, rating: -1 },
};

// GET /api/businesses — Fetch active businesses for customers
// Query params: category, city, search, lat, lng, page, limit
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category")?.trim() || "";
    const city = searchParams.get("city")?.trim() || "";
    const search = searchParams.get("search")?.trim() || "";
    const sort = searchParams.get("sort")?.trim() || "rating";
    const available = searchParams.get("available") === "1";
    const verified = searchParams.get("verified") === "1";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const lat = parseFloat(searchParams.get("lat") || "");
    const lng = parseFloat(searchParams.get("lng") || "");
    const useGeo = !isNaN(lat) && !isNaN(lng);

    await connectDB();

    // Base match — only active businesses
    const matchStage = { status: "active" };

    if (search) matchStage.$text = { $search: search };
    if (category) {
      // Businesses store category by display name; URL params use the slug — resolve it
      const catDoc = await Category.findOne({ slug: category }).lean();
      matchStage.category = catDoc ? catDoc.name : category;
    }
    if (city) matchStage.city = { $regex: new RegExp(`^${city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") };
    if (available) matchStage.availability = "Available";
    if (verified) matchStage.verification = true;

    let businesses;
    let total;

    if (useGeo) {
      // ── $geoNear aggregation — sorts by distance automatically ──────────────
      const pipeline = [
        {
          $geoNear: {
            near: { type: "Point", coordinates: [lng, lat] },
            distanceField: "distanceMeters",
            spherical: true,
            maxDistance: 50 * 1000, // 50 km — only show nearby providers
            query: matchStage,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [{ $project: { name: 1, phone: 1 } }],
          },
        },
        { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ];

      const countPipeline = [
        {
          $geoNear: {
            near: { type: "Point", coordinates: [lng, lat] },
            distanceField: "distanceMeters",
            spherical: true,
            maxDistance: 50 * 1000, // 50 km — mirror main pipeline filter
            query: matchStage,
          },
        },
        { $count: "total" },
      ];

      const [rows, countResult] = await Promise.all([
        Business.aggregate(pipeline),
        Business.aggregate(countPipeline),
      ]);

      businesses = rows.map((b) => ({
        ...b,
        id: b._id?.toString(),
        distanceKm: b.distanceMeters != null ? +(b.distanceMeters / 1000).toFixed(2) : null,
      }));
      total = countResult[0]?.total ?? 0;
    } else {
      // ── Standard find + sort ─────────────────────────────────────────────────
      const sortQuery = SORT_MAP[sort] || SORT_MAP.rating;

      const [rows, count] = await Promise.all([
        Business.find(matchStage)
          .populate("owner", "name phone")
          .sort(sortQuery)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Business.countDocuments(matchStage),
      ]);

      businesses = rows;
      total = count;
    }

    return NextResponse.json({
      success: true,
      data: {
        businesses,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/businesses error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong", error: error?.message },
      { status: 500 }
    );
  }
}
