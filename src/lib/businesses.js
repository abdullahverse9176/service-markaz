import { connectDB } from "@/lib/db/connect";
import Business from "@/models/Business";
import Category from "@/models/Category";
import "@/models/User"; // register User schema so Business.populate("owner") works

/**
 * Normalize a MongoDB Business lean doc to the shape consumed by
 * <ProviderCard> and all profile-components (ProfileHeader, ExperienceSection, etc.)
 */
export function normalizeBusiness(doc) {
  const id = doc._id?.toString() || doc.id?.toString() || "";
  return {
    ...doc,
    _id: id,
    id,
    // Basic info with defaults
    name: doc.name || "",
    category: doc.category || "",
    city: doc.city || "",
    area: doc.area || "",
    about: doc.about || "",
    title: doc.title || "",
    // ProviderCard expects `image` and `reviews`
    image: doc.profileImage || "",
    reviews: doc.reviewsCount ?? 0,
    rating: doc.rating ?? 0,
    verification: doc.verification ?? false,
    availability: doc.availability || "Unavailable",
    responseTime: doc.responseTime || "",
    experience: doc.experience ?? 0,
    completedProjects: doc.completedProjects ?? 0,
    // Profile images
    profileImage: doc.profileImage || "",
    bannerImage: doc.bannerImage || "",
    // Contact info (ContactSection expects doc.contact[key])
    contact: {
      phone: doc.phone || "",
      whatsapp: doc.whatsapp || "",
      email: doc.email || "",
    },
    // Pricing (PricingSection expects doc.pricing[key])
    pricing: doc.pricing || {
      calloutFee: "",
      minCharge: "",
    },
    // Social media links
    socialLinks: {
      facebook:  doc.socialLinks?.facebook  || "",
      instagram: doc.socialLinks?.instagram || "",
      youtube:   doc.socialLinks?.youtube   || "",
      website:   doc.socialLinks?.website   || "",
      linkedin:  doc.socialLinks?.linkedin  || "",
      tiktok:    doc.socialLinks?.tiktok    || "",
    },
    // ExperienceSection expects `experience_details`
    experience_details: {
      years: doc.experience ?? 0,
    },
    // Ensure all array fields have defaults (so profile components don't crash on .map())
    services: doc.services ?? [],
    serviceAreas: doc.serviceAreas ?? [],
    reviews_list: doc.reviews_list ?? [],
    specializations: doc.specializations ?? [],
    // Serialize owner ObjectId so Next.js can pass it as a server component prop
    owner: doc.owner
      ? { ...doc.owner, _id: doc.owner._id?.toString() }
      : null,
    // Serialize GeoJSON location — only keep coordinates if fully set
    location: doc.location?.coordinates?.length === 2
      ? { coordinates: [doc.location.coordinates[0], doc.location.coordinates[1]] }
      : null,
  };
}

/**
 * Fetch businesses from MongoDB.
 *
 * @param {{
 *   category?: string,
 *   city?: string,
 *   search?: string,
 *   page?: number,
 *   limit?: number,
 *   onlyActive?: boolean
 * }} opts
 */
export async function getBusinesses({
  category,
  city,
  search,
  page = 1,
  limit = 10,
  onlyActive = true,
  featured,
} = {}) {
  await connectDB();

  const query = {};
  if (onlyActive) query.status = "active";
  if (featured !== undefined) query.featured = featured;
  if (category) {
    // The DB stores category as the display name (e.g. "Electricians") but the
    // URL param is the slug (e.g. "electricians"). Look up the name from the slug.
    const categoryDoc = await Category.findOne({ slug: category }).select("name").lean();
    query.category = categoryDoc
      ? categoryDoc.name
      : { $regex: new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") };
  }
  // Escape special regex chars in the city slug before building the pattern
  if (city) query.city = { $regex: new RegExp(`^${city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") };
  if (search) {
    // $text search uses the full-text index; fall back to regex only if search index isn't available
    query.$text = { $search: search };
  }

  const skip = (page - 1) * limit;

  const [businesses, total] = await Promise.all([
    Business.find(query)
      .sort({ rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Business.countDocuments(query),
  ]);

  return {
    businesses: businesses.map(normalizeBusiness),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Fetch a single active business by its MongoDB _id string.
 */
export async function getBusinessById(id) {
  if (!id || !/^[a-f\d]{24}$/i.test(id)) return null;
  await connectDB();
  const doc = await Business.findById(id)
    .populate("owner", "name phone email")
    .lean();
  if (!doc) return null;
  return normalizeBusiness(doc);
}
