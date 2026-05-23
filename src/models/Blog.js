import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true }, // HTML from TipTap
    category: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],
    coverIconName: { type: String, default: "BookOpen", trim: true },
    coverGradient: {
      type: String,
      default: "from-blue-500 to-indigo-600",
      trim: true,
    },
    image: { type: String, default: "", trim: true },
    featured: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    readTime: { type: String, default: "5 min read" },
    author: { type: String, default: "Service Markaz Team", trim: true },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
blogSchema.index({ status: 1, createdAt: -1 });
blogSchema.index({ status: 1, category: 1, createdAt: -1 });
blogSchema.index({ status: 1, featured: 1, createdAt: -1 });

export default mongoose.models.Blog ?? mongoose.model("Blog", blogSchema);
