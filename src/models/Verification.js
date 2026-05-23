import mongoose from "mongoose";

/**
 * Verification Model
 * Stores business verification requests with document uploads.
 * One verification per business (unique constraint on business field).
 */

const documentsSchema = new mongoose.Schema(
  {
    cnicFront: { type: String, required: true },
    cnicBack: { type: String, required: true },
    businessProof: { type: [String], required: true }, // Array for multiple files
    utilityBill: { type: String, required: true },
  },
  { _id: false }
);

const verificationSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      unique: true, // One verification per business
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "resubmission_required"],
      default: "pending",
      index: true,
    },

    // Document URLs (stored in private S3 bucket)
    documents: {
      type: documentsSchema,
      required: true,
    },

    // Admin review fields
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: "" },
    adminNotes: { type: String, default: "" },

    // Submission tracking
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Admin panel queries: filter by status and sort by submission date
verificationSchema.index({ status: 1, submittedAt: -1 });
// Business lookup
verificationSchema.index({ business: 1, status: 1 });

export default mongoose.models.Verification ?? mongoose.model("Verification", verificationSchema);
