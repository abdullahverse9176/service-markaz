import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["published", "flagged"],
      default: "published",
    },
  },
  { timestamps: true }
);

// Core anti-fake constraint: one review per user per business
reviewSchema.index({ business: 1, user: 1 }, { unique: true });
// Admin panel: filter by status and sort by date
reviewSchema.index({ status: 1, createdAt: -1 });
// Business rating recalculation aggregation
reviewSchema.index({ business: 1, status: 1 });

export default mongoose.models.Review ?? mongoose.model("Review", reviewSchema);
