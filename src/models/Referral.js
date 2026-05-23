import mongoose from "mongoose";

/**
 * One Referral document = one (referrer, referee) relationship.
 *
 * Lifecycle:
 *   pending  → referee signed up using the referral code but has not yet
 *              become "active" (business created + first lead received).
 *   approved → referee is now active; reward has been (or will be) granted.
 *   revoked  → admin manually revoked (fraud, fake account, etc.).
 */
const referralSchema = new mongoose.Schema(
  {
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    referee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one referral per new user
    },
    // Denormalised for fast look-ups without joining User
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "revoked"],
      default: "pending",
      index: true,
    },

    // Set to true once the milestone reward for THIS referral has been applied
    rewardGranted: {
      type: Boolean,
      default: false,
    },

    approvedAt: { type: Date, default: null },
    revokedAt:  { type: Date, default: null },
    revokedReason: { type: String, default: "" },

    // Free-text note left by an admin (e.g. "lifetime approved")
    adminNote: { type: String, default: "" },
  },
  { timestamps: true }
);

// Fast count of approved referrals per referrer (reward engine query)
referralSchema.index({ referrer: 1, status: 1 });
// Admin overview
referralSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Referral ?? mongoose.model("Referral", referralSchema);
