import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import Review from "@/models/Review";
import Business from "@/models/Business";
import Lead from "@/models/Lead";
import User from "@/models/User";

function verifyToken(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

function isValidObjectId(id) {
  return /^[a-f\d]{24}$/i.test(id);
}

// GET /api/businesses/[id]/reviews — public, paginated
export async function GET(request, { params }) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ success: false, message: "Invalid business ID" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

  await connectDB();

  // Build aggregation pipeline that excludes reviews from blocked users.
  // The $lookup subpipeline fetches only the fields we need from users,
  // reducing the data transferred from the users collection.
  const objectId = new mongoose.Types.ObjectId(id);
  const basePipeline = [
    { $match: { business: objectId, status: "published" } },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userDoc",
        pipeline: [{ $project: { _id: 1, name: 1, status: 1 } }],
      },
    },
    { $unwind: "$userDoc" },
    { $match: { "userDoc.status": { $ne: "blocked" } } },
  ];

  const [countResult, reviews] = await Promise.all([
    Review.aggregate([...basePipeline, { $count: "total" }]),
    Review.aggregate([
      ...basePipeline,
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          business: 1,
          rating: 1,
          comment: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          user: { _id: "$userDoc._id", name: "$userDoc.name" },
        },
      },
    ]),
  ]);

  const total = countResult[0]?.total ?? 0;

  return NextResponse.json({
    success: true,
    data: { reviews, total, page, totalPages: Math.ceil(total / limit) },
  });
}

// POST /api/businesses/[id]/reviews — authenticated users only
export async function POST(request, { params }) {
  const payload = verifyToken(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ success: false, message: "Invalid business ID" }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 });
  }

  const { rating, comment } = body;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ success: false, message: "Rating must be a whole number between 1 and 5" }, { status: 400 });
  }

  const trimmedComment = (comment || "").trim();
  if (trimmedComment.length < 10) {
    return NextResponse.json({ success: false, message: "Comment must be at least 10 characters" }, { status: 400 });
  }
  if (trimmedComment.length > 500) {
    return NextResponse.json({ success: false, message: "Comment must be 500 characters or less" }, { status: 400 });
  }

  await connectDB();

  // Run all three prerequisite checks in parallel to save 2 DB round trips
  const [reviewer, business, existingLead] = await Promise.all([
    User.findById(payload.id).select("isEmailVerified").lean(),
    Business.findById(id).select("owner").lean(),
    Lead.findOne({ customer: payload.id, business: id })
      .select("customerConfirmed status lastContactedAt createdAt")
      .lean(),
  ]);

  // Verified email is required to leave reviews
  if (!reviewer?.isEmailVerified) {
    return NextResponse.json(
      { success: false, message: "Please verify your email before submitting a review." },
      { status: 403 }
    );
  }

  if (!business) {
    return NextResponse.json({ success: false, message: "Business not found" }, { status: 404 });
  }

  // Owners cannot review their own business
  if (business.owner.toString() === payload.id) {
    return NextResponse.json(
      { success: false, message: "You cannot review your own business" },
      { status: 403 }
    );
  }

  // Only customers who have contacted this provider can leave a review
  if (!existingLead) {
    return NextResponse.json(
      { success: false, message: "You can only review a provider you have contacted" },
      { status: 403 }
    );
  }

  // Customer must have confirmed the deal
  const dealConfirmed =
    existingLead.customerConfirmed === "yes" ||
    existingLead.status === "confirmed" ||
    existingLead.status === "disputed";

  if (!dealConfirmed) {
    return NextResponse.json(
      { success: false, message: "Please confirm the deal before leaving a review." },
      { status: 403 }
    );
  }

  // Enforce 30-minute gap between contact and review submission
  const REVIEW_DELAY_MS = 30 * 60 * 1000;
  const contactedAt = existingLead.lastContactedAt || existingLead.createdAt;
  const timeSinceContact = contactedAt ? Date.now() - new Date(contactedAt).getTime() : 0;

  if (timeSinceContact < REVIEW_DELAY_MS) {
    return NextResponse.json(
      { success: false, message: "You can add a review 30 minutes after contacting the provider." },
      { status: 403 }
    );
  }

  let review;
  try {
    review = await Review.create({
      business: id,
      user: payload.id,
      rating,
      comment: trimmedComment,
    });
  } catch (err) {
    if (err.code === 11000) {
      return NextResponse.json(
        { success: false, message: "You have already reviewed this business" },
        { status: 409 }
      );
    }
    throw err;
  }

  // Recalculate denormalized rating + count on the Business document
  const [stats] = await Review.aggregate([
    { $match: { business: review.business, status: "published" } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  if (stats) {
    await Business.findByIdAndUpdate(id, {
      rating: Math.round(stats.avg * 10) / 10,
      reviewsCount: stats.count,
    });
  }

  await review.populate("user", "name");

  return NextResponse.json({ success: true, data: review }, { status: 201 });
}
