import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import Verification from "@/models/Verification";
import Business from "@/models/Business";
import User from "@/models/User";
import { 
  sendEmail, 
  verificationSubmittedTemplate,
  verificationApprovedTemplate,
  verificationRejectedTemplate,
  verificationResubmissionTemplate
} from "@/lib/email/mailer";

function verifyToken(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

function verifyAdmin(request) {
  const payload = verifyToken(request);
  return payload?.role === "admin" ? payload : null;
}

/**
 * POST /api/verification
 * Submit a new verification request with documents.
 * Provider must have a business listing to submit verification.
 */
export async function POST(request) {
  const payload = verifyToken(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const { cnicFront, cnicBack, businessProof, utilityBill } = body;

  // Validate required documents
  if (!cnicFront || !cnicBack || !businessProof || !utilityBill) {
    return NextResponse.json(
      { success: false, message: "All documents are required" },
      { status: 400 }
    );
  }

  // Validate businessProof is an array with at least one file
  if (!Array.isArray(businessProof) || businessProof.length === 0) {
    return NextResponse.json(
      { success: false, message: "At least one business proof document is required" },
      { status: 400 }
    );
  }

  await connectDB();

  // Find user's business with owner details
  const business = await Business.findOne({ owner: payload.id })
    .select("_id name verification")
    .populate("owner", "name email");
  if (!business) {
    return NextResponse.json(
      { success: false, message: "No business listing found. Please create a business first." },
      { status: 404 }
    );
  }

  // Check if already verified
  if (business.verification) {
    return NextResponse.json(
      { success: false, message: "Your business is already verified" },
      { status: 400 }
    );
  }

  // Check if verification request already exists
  const existingVerification = await Verification.findOne({ business: business._id });

  if (existingVerification) {
    // Allow resubmission only if rejected or resubmission required
    if (existingVerification.status === "pending") {
      return NextResponse.json(
        { success: false, message: "Verification request is already pending review" },
        { status: 400 }
      );
    }
    if (existingVerification.status === "approved") {
      return NextResponse.json(
        { success: false, message: "Your business is already verified" },
        { status: 400 }
      );
    }

    // Update existing verification (resubmission)
    existingVerification.documents = {
      cnicFront,
      cnicBack,
      businessProof,
      utilityBill,
    };
    existingVerification.status = "pending";
    existingVerification.submittedAt = new Date();
    existingVerification.reviewedBy = null;
    existingVerification.reviewedAt = null;
    existingVerification.rejectionReason = "";
    existingVerification.adminNotes = "";

    await existingVerification.save();

    // Send email notification
    try {
      await sendEmail({
        to: business.owner.email,
        subject: "Verification Resubmitted - Service Markaz",
        html: verificationSubmittedTemplate({
          name: business.owner.name,
          businessName: business.name,
        }),
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Verification request resubmitted successfully",
      data: existingVerification,
    });
  }

  // Create new verification request
  const verification = await Verification.create({
    business: business._id,
    status: "pending",
    documents: {
      cnicFront,
      cnicBack,
      businessProof,
      utilityBill,
    },
  });

  // Send email notification
  try {
    await sendEmail({
      to: business.owner.email,
      subject: "Verification Submitted - Service Markaz",
      html: verificationSubmittedTemplate({
        name: business.owner.name,
        businessName: business.name,
      }),
    });
  } catch (emailError) {
    console.error("Failed to send verification email:", emailError);
    // Don't fail the request if email fails
  }

  return NextResponse.json({
    success: true,
    message: "Verification request submitted successfully",
    data: verification,
  }, { status: 201 });
}

/**
 * GET /api/verification
 * Get verification status for logged-in provider's business.
 */
export async function GET(request) {
  const payload = verifyToken(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  // Find user's business
  const business = await Business.findOne({ owner: payload.id }).select("_id verification");
  if (!business) {
    return NextResponse.json(
      { success: false, message: "No business listing found" },
      { status: 404 }
    );
  }

  // Find verification request
  const verification = await Verification.findOne({ business: business._id })
    .populate("reviewedBy", "name email")
    .lean();

  if (!verification) {
    return NextResponse.json({
      success: true,
      data: {
        hasVerification: false,
        isVerified: business.verification,
      },
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      hasVerification: true,
      isVerified: business.verification,
      verification,
    },
  });
}

/**
 * PATCH /api/verification
 * Admin action: Approve or reject a verification request.
 */
export async function PATCH(request) {
  const payload = verifyAdmin(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const { verificationId, action, rejectionReason, adminNotes } = body;

  if (!verificationId || !action) {
    return NextResponse.json(
      { success: false, message: "Verification ID and action are required" },
      { status: 400 }
    );
  }

  if (!["approve", "reject", "request_resubmission"].includes(action)) {
    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    );
  }

  if (action === "reject" && !rejectionReason) {
    return NextResponse.json(
      { success: false, message: "Rejection reason is required" },
      { status: 400 }
    );
  }

  await connectDB();

  const verification = await Verification.findById(verificationId)
    .populate({
      path: "business",
      select: "name owner",
      populate: {
        path: "owner",
        select: "name email",
      },
    });
  if (!verification) {
    return NextResponse.json(
      { success: false, message: "Verification request not found" },
      { status: 404 }
    );
  }

  if (verification.status !== "pending") {
    return NextResponse.json(
      { success: false, message: "This verification request has already been reviewed" },
      { status: 400 }
    );
  }

  // Update verification based on action
  if (action === "approve") {
    verification.status = "approved";
    verification.reviewedBy = payload.id;
    verification.reviewedAt = new Date();
    verification.adminNotes = adminNotes || "";

    await verification.save();

    // Update business verification status
    await Business.findByIdAndUpdate(verification.business._id, {
      verification: true,
    });

    // Add "verified" badge to user
    await User.findByIdAndUpdate(verification.business.owner._id, {
      $addToSet: { badges: "verified" }, // $addToSet prevents duplicates
    });

    // Send approval email
    try {
      await sendEmail({
        to: verification.business.owner.email,
        subject: "🎉 Verification Approved - Service Markaz",
        html: verificationApprovedTemplate({
          name: verification.business.owner.name,
          businessName: verification.business.name,
        }),
      });
    } catch (emailError) {
      console.error("Failed to send approval email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Verification approved successfully",
      data: verification,
    });
  }

  if (action === "reject") {
    verification.status = "rejected";
    verification.reviewedBy = payload.id;
    verification.reviewedAt = new Date();
    verification.rejectionReason = rejectionReason;
    verification.adminNotes = adminNotes || "";

    await verification.save();

    // Send rejection email
    try {
      await sendEmail({
        to: verification.business.owner.email,
        subject: "Verification Rejected - Service Markaz",
        html: verificationRejectedTemplate({
          name: verification.business.owner.name,
          businessName: verification.business.name,
          reason: rejectionReason,
        }),
      });
    } catch (emailError) {
      console.error("Failed to send rejection email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Verification rejected",
      data: verification,
    });
  }

  if (action === "request_resubmission") {
    verification.status = "resubmission_required";
    verification.reviewedBy = payload.id;
    verification.reviewedAt = new Date();
    verification.rejectionReason = rejectionReason || "Please resubmit with correct documents";
    verification.adminNotes = adminNotes || "";

    await verification.save();

    // Send resubmission email
    try {
      await sendEmail({
        to: verification.business.owner.email,
        subject: "Resubmission Required - Service Markaz",
        html: verificationResubmissionTemplate({
          name: verification.business.owner.name,
          businessName: verification.business.name,
          reason: rejectionReason || "Please resubmit with correct documents",
        }),
      });
    } catch (emailError) {
      console.error("Failed to send resubmission email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Resubmission requested",
      data: verification,
    });
  }
}
