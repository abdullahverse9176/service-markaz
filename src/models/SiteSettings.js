import mongoose from "mongoose";

const socialLinksSchema = new mongoose.Schema(
  {
    facebook:  { type: String, default: "" },
    instagram: { type: String, default: "" },
    twitter:   { type: String, default: "" },
    linkedin:  { type: String, default: "" },
    youtube:   { type: String, default: "" },
    tiktok:    { type: String, default: "" },
  },
  { _id: false }
);

const siteSettingsSchema = new mongoose.Schema(
  {
    // General
    siteName:     { type: String, default: "Service Markaz" },
    siteUrl:      { type: String, default: "https://servicemarkaz.com" },
    contactEmail: { type: String, default: "support@servicemarkaz.com" },
    phone:        { type: String, default: "" },
    whatsapp:     { type: String, default: "" },

    // Social media
    socialLinks: { type: socialLinksSchema, default: () => ({}) },

    // Business approval
    requireApproval:    { type: Boolean, default: true },
    emailOnSubmission:  { type: Boolean, default: true },
    autoBlockNegative:  { type: Boolean, default: false },

    // Notifications
    notifyOnRegistration: { type: Boolean, default: false },
    notifyOnListing:      { type: Boolean, default: true },
    notifyOnReview:       { type: Boolean, default: false },
    notifyOnFlaggedReview:{ type: Boolean, default: true },
  },
  { timestamps: true }
);

const SiteSettings =
  mongoose.models.SiteSettings ||
  mongoose.model("SiteSettings", siteSettingsSchema);

export default SiteSettings;
