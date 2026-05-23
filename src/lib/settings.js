import { cache } from "react";
import { connectDB } from "@/lib/db/connect";
import SiteSettings from "@/models/SiteSettings";

const DEFAULTS = {
  siteName: "Service Markaz",
  siteUrl: "https://servicemarkaz.com",
  contactEmail: "support@servicemarkaz.com",
  phone: "",
  whatsapp: "",
  socialLinks: {
    facebook:  "",
    instagram: "",
    twitter:   "",
    linkedin:  "",
    youtube:   "",
    tiktok:    "",
  },
  requireApproval:      true,
  emailOnSubmission:    true,
  autoBlockNegative:    false,
  notifyOnRegistration: false,
  notifyOnListing:      true,
  notifyOnReview:       false,
  notifyOnFlaggedReview: true,
};

/**
 * Fetch site-wide settings from DB.
 * React.cache deduplicates calls within a single render tree,
 * and page-level ISR (revalidate) caches the rendered output.
 */
export const getSiteSettings = cache(async () => {
  try {
    await connectDB();
    const doc = await SiteSettings.findOne().lean();
    if (!doc) return DEFAULTS;

    const { _id, __v, createdAt, updatedAt, ...rest } = doc;
    return {
      ...DEFAULTS,
      ...rest,
      socialLinks: { ...DEFAULTS.socialLinks, ...(rest.socialLinks || {}) },
    };
  } catch {
    return DEFAULTS;
  }
});
