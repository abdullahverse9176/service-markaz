import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    icon: {
      type: String,
      required: true,
      trim: true, // Lucide icon name like "Zap", "Wrench", "Snowflake"
    },
    color: {
      type: String,
      required: true, // Tailwind color like "bg-yellow-100 text-yellow-700"
      default: "bg-gray-100 text-gray-700",
    },
    bar: {
      type: String,
      required: true, // Progress bar color like "bg-yellow-400"
      default: "bg-gray-400",
    },
    businessCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Category ?? mongoose.model("Category", categorySchema);
