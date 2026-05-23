import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import Verification from "@/models/Verification";
import "@/models/Business"; // Register Business model for populate
import "@/models/User"; // Register User model for populate
import { generatePresignedUrls } from "@/lib/s3/presigned-url";

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

/**
 * GET /api/admin/verifications
 * List all verification requests with filters and pagination.
 * Generates pre-signed URLs for viewing documents.
 */
export async function GET(request) {
  const payload = verifyAdmin(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

    await connectDB();

    // Build filter query
    const query = {};
    if (status) query.status = status;

    const [verifications, total, statusCounts] = await Promise.all([
      Verification.find(query)
        .populate({
          path: "business",
          select: "name email phone category city owner",
          populate: {
            path: "owner",
            select: "name email phone",
          },
        })
        .populate("reviewedBy", "name email")
        .sort({ submittedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Verification.countDocuments(query),
      // Aggregate status counts
      Verification.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);

    // Generate pre-signed URLs for all documents
    const verificationsWithUrls = await Promise.all(
      verifications.map(async (v) => {
        try {
          // Collect all document keys
          const keys = [
            v.documents.cnicFront,
            v.documents.cnicBack,
            ...v.documents.businessProof,
            v.documents.utilityBill,
          ];

          // Generate pre-signed URLs (1 hour expiry)
          const urls = await generatePresignedUrls(keys, 3600);

          return {
            ...v,
            documentUrls: {
              cnicFront: urls[0],
              cnicBack: urls[1],
              businessProof: urls.slice(2, 2 + v.documents.businessProof.length),
              utilityBill: urls[urls.length - 1],
            },
          };
        } catch (error) {
          console.error("Error generating URLs for verification:", v._id, error);
          return {
            ...v,
            documentUrls: null,
            urlError: "Failed to generate document URLs",
          };
        }
      })
    );

    const statusMap = {};
    statusCounts.forEach((s) => { statusMap[s._id] = s.count; });

    return NextResponse.json({
      success: true,
      data: {
        verifications: verificationsWithUrls,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        summary: {
          pending: statusMap.pending ?? 0,
          approved: statusMap.approved ?? 0,
          rejected: statusMap.rejected ?? 0,
          resubmission_required: statusMap.resubmission_required ?? 0,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/admin/verifications error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
