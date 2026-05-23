import mongoose from "mongoose";

const pricingSchema = new mongoose.Schema(
    {
        calloutFee: { type: String, default: "" },
        hourlyRate: { type: String, default: "" },
        minCharge: { type: String, default: "" },
    },
    { _id: false }
);

const socialLinksSchema = new mongoose.Schema(
    {
        facebook:  { type: String, default: "" },
        instagram: { type: String, default: "" },
        youtube:   { type: String, default: "" },
        website:   { type: String, default: "" },
        linkedin:  { type: String, default: "" },
        tiktok:    { type: String, default: "" },
    },
    { _id: false }
);

const businessSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // one business per user
            index: true,
        },

        // Contact info
        name: { type: String, required: true, trim: true },
        email: { type: String, default: "", lowercase: true, trim: true },
        phone: { type: String, required: true, trim: true },
        whatsapp: { type: String, default: "", trim: true },

        // Business details
        title: { type: String, required: true, trim: true },
        category: { type: String, required: true },
        city: { type: String, required: true },
        area: { type: String, required: true, trim: true },
        about: { type: String, default: "", trim: true },

        // Services & expertise
        services: [{ type: String, trim: true }],
        experience: { type: Number, required: true, min: 0 },
        completedProjects: { type: Number, required: true, min: 0 },
        specializations: [{ type: String, trim: true }],

        // Coverage
        serviceAreas: [{ type: String, trim: true }],

        // Geolocation — GeoJSON Point (optional, set by provider via location picker)
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number], // [lng, lat]
                default: undefined,
            },
        },

        // Pricing
        pricing: { type: pricingSchema, default: () => ({}) },

        // Availability
        availability: {
            type: String,
            enum: ["Available", "Unavailable"],
            default: "Available",
        },
        responseTime: { type: String, default: "" },

        // Social media links
        socialLinks: { type: socialLinksSchema, default: () => ({}) },

        // Images (S3/CloudFront URLs — stored as WebP)
        profileImage: { type: String, default: "" },
        bannerImage: { type: String, default: "" },

        // Admin-managed fields
        status: {
            type: String,
            enum: ["pending", "active", "blocked"],
            default: "active",
        },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        reviewsCount: { type: Number, default: 0 },
        verification: { type: Boolean, default: false },
        featured: { type: Boolean, default: false, index: true },

        // Profile view tracking
        viewCount: { type: Number, default: 0 },       // all-time total
        weeklyViews: { type: Number, default: 0 },     // resets each Monday
        monthlyViews: { type: Number, default: 0 },    // resets on 1st of each month
        viewsWeekStart: { type: Date, default: null },  // Monday when weeklyViews started
        viewsMonthStart: { type: Date, default: null }, // 1st of month when monthlyViews started
    },
    { timestamps: true }
);

// Compound indexes for the three sort modes × common filters
businessSchema.index({ status: 1, rating: -1, createdAt: -1 });      // default sort (no filter)
businessSchema.index({ status: 1, createdAt: -1 });                   // newest sort
businessSchema.index({ status: 1, experience: -1, rating: -1 });      // experience sort
businessSchema.index({ status: 1, category: 1, rating: -1, createdAt: -1 }); // category filter
businessSchema.index({ status: 1, city: 1, rating: -1, createdAt: -1 });     // city filter

// Geospatial index for Near Me distance queries
businessSchema.index({ location: "2dsphere" }, { sparse: true }); // sparse = ignore docs without location

// Full-text search index — replaces expensive per-field regex scans
businessSchema.index(
  { name: "text", title: "text", about: "text", services: "text" },
  { weights: { name: 10, title: 8, services: 5, about: 1 }, name: "business_text_search" }
);

export default mongoose.models.Business ?? mongoose.model("Business", businessSchema);
