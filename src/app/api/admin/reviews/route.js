import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import Review from "@/models/Review";
import Business from "@/models/Business";

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

/** Recalculate Business.rating and Business.reviewsCount from published reviews only */
async function recalcBusinessRating(businessId) {
  const [result] = await Review.aggregate([
    {
      $match: {
        business: new mongoose.Types.ObjectId(String(businessId)),
        status: "published",
      },
    },
    {
      $group: {
        _id: null,
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);
  await Business.findByIdAndUpdate(businessId, {
    rating: result ? Math.round(result.avg * 10) / 10 : 0,
    reviewsCount: result ? result.count : 0,
  });
}

// GET /api/admin/reviews
export async function GET(request) {
  const payload = verifyAdmin(request);
  if (!payload)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const rating = searchParams.get("rating") || "";
    const status = searchParams.get("status") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

    await connectDB();

    // Build match stage
    const match = {};
    if (rating) match.rating = parseInt(rating, 10);
    if (status) match.status = status;

    // Build base pipeline stages (before search filter)
    const basePipeline = [
      { $match: match },
      {
        $lookup: {
          from: "businesses",
          localField: "business",
          foreignField: "_id",
          as: "businessData",
          pipeline: [{ $project: { name: 1 } }],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userData",
          pipeline: [{ $project: { name: 1 } }],
        },
      },
      {
        $addFields: {
          businessName: { $ifNull: [{ $arrayElemAt: ["$businessData.name", 0] }, "Unknown"] },
          reviewerName: { $ifNull: [{ $arrayElemAt: ["$userData.name", 0] }, "Unknown"] },
        },
      },
    ];

    if (search) {
      basePipeline.push({
        $match: {
          $or: [
            { businessName: { $regex: search, $options: "i" } },
            { reviewerName: { $regex: search, $options: "i" } },
            { comment: { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    // Single aggregation with $facet: get paginated data + filtered count + global summary
    const [facetResult] = await Review.aggregate([
      ...basePipeline,
      {
        $facet: {
          // Paginated review list
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                rating: 1,
                comment: 1,
                status: 1,
                createdAt: 1,
                businessName: 1,
                reviewerName: 1,
              },
            },
          ],
          // Filtered total count
          filteredCount: [{ $count: "total" }],
          // Global summary stats (ignores current filters)
          globalSummary: [
            {
              $group: {
                _id: null,
                totalAll: { $sum: 1 },
                fiveStars: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
                flagged: { $sum: { $cond: [{ $eq: ["$status", "flagged"] }, 1, 0] } },
                avgRating: { $avg: "$rating" },
              },
            },
          ],
        },
      },
    ]);

    const reviews = facetResult?.data ?? [];
    const total = facetResult?.filteredCount?.[0]?.total ?? 0;
    const gs = facetResult?.globalSummary?.[0] ?? {};
    const totalAll = gs.totalAll ?? 0;
    const fiveStars = gs.fiveStars ?? 0;
    const flaggedCount = gs.flagged ?? 0;
    const avgRating = gs.avgRating ? gs.avgRating.toFixed(1) : "0.0";

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        summary: {
          total: totalAll,
          fiveStars,
          flagged: flaggedCount,
          avgRating,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/admin/reviews error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}

// PATCH /api/admin/reviews — toggle status (published <-> flagged)
export async function PATCH(request) {
  const payload = verifyAdmin(request);
  if (!payload)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  try {
    const { reviewId, status } = await request.json();
    if (!reviewId || !["published", "flagged"].includes(status))
      return NextResponse.json({ success: false, message: "Invalid data" }, { status: 400 });

    await connectDB();
    const review = await Review.findByIdAndUpdate(reviewId, { status }, { new: true });

    // Recalc rating since published count changed
    if (review) {
      await recalcBusinessRating(review.business);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/admin/reviews error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}

// DELETE /api/admin/reviews
export async function DELETE(request) {
  const payload = verifyAdmin(request);
  if (!payload)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

    await connectDB();
    const review = await Review.findByIdAndDelete(id);

    // Recalc rating since a review was removed
    if (review) {
      await recalcBusinessRating(review.business);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/reviews error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
