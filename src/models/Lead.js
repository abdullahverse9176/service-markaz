import mongoose from "mongoose";

const statusHistoryEntrySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, refPath: "statusHistory.actorModel" },
    actorModel: { type: String, enum: ["User"], default: "User" },
    actorRole: { type: String, enum: ["customer", "provider", "admin", "system"] },
    note: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const leadSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    source: {
      type: String,
      enum: ["call", "whatsapp", "form"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "awaiting_response", "confirmed", "rejected", "disputed"],
      default: "pending",
    },
    customerConfirmed: {
      type: String,
      enum: ["yes", "no"],
      default: null,
    },
    providerConfirmed: {
      type: String,
      enum: ["yes", "no"],
      default: null,
    },
    lastContactedAt: { type: Date, default: null },
    providerConfirmedAt: { type: Date, default: null },
    followupSentAt: { type: Date, default: null },
    followupCount: { type: Number, default: 0 },
    statusHistory: { type: [statusHistoryEntrySchema], default: [] },
  },
  { timestamps: true }
);

// One lead per customer-business pair — upsert on repeat contact
leadSchema.index({ customer: 1, business: 1 }, { unique: true });
// Provider dashboard queries
leadSchema.index({ business: 1, status: 1 });
leadSchema.index({ business: 1, createdAt: -1 });

export default mongoose.models.Lead ?? mongoose.model("Lead", leadSchema);
