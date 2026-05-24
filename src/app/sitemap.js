import { connectDB } from "@/lib/db/connect";
import City from "@/models/City";
import Category from "@/models/Category";
import Business from "@/models/Business";
import Blog from "@/models/Blog";
import { getSiteSettings } from "@/lib/settings";
import { getProviderSlug } from "@/utils/slug";

export const revalidate = 86400; // Revalidate once per day

const FALLBACK_URL = "https://servicemarkaz.com";

export default async function sitemap() {
  const now = new Date();
  let BASE_URL = FALLBACK_URL;

  try {
    await connectDB();
    const settings = await getSiteSettings();
    BASE_URL = settings.siteUrl || FALLBACK_URL;

    // Fetch all data in parallel
    const [cities, categories, activeCombos, businesses, blogs] = await Promise.all([
      City.find({ status: "active" }).select("slug updatedAt").lean(),
      Category.find({ isActive: true }).select("slug").lean(),
      Business.aggregate([
        { $match: { status: "active" } },
        {
          $group: {
            _id: { city: { $toLower: "$city" }, category: "$category" },
          },
        },
      ]),
      Business.find({
        status: "active",
        profileImage: { $nin: ["", null] },
        about: { $nin: ["", null] },
      })
        .select("_id name category area city updatedAt")
        .lean(),
      Blog.find({ status: "published" })
        .select("slug updatedAt publishedAt")
        .lean(),
    ]);

    // Build combo set for O(1) lookup
    const comboSet = new Set(
      activeCombos.map((c) => `${c._id.city}||${c._id.category}`)
    );

    const urls = [];

    // ── Static pages ──────────────────────────────────────────────────────
    urls.push(
      { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
      { url: `${BASE_URL}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
      { url: `${BASE_URL}/cities`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
      { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
      { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
      { url: `${BASE_URL}/contact-us`, lastModified: now, changeFrequency: "monthly", priority: 0.4 }
    );

    // Individual category landing pages
    categories.forEach((cat) => {
      urls.push({
        url: `${BASE_URL}/categories/${cat.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    });

    // ── City hub pages: /{city} ───────────────────────────────────────────
    cities.forEach((city) => {
      urls.push({
        url: `${BASE_URL}/${city.slug}`,
        lastModified: new Date(city.updatedAt || now),
        changeFrequency: "weekly",
        priority: 0.85,
      });
    });

    // ── City + Category pages: /{city}/{category} (PRIMARY SEO pages) ─────
    for (const city of cities) {
      for (const cat of categories) {
        if (comboSet.has(`${city.slug.toLowerCase()}||${cat.slug}`)) {
          urls.push({
            url: `${BASE_URL}/${city.slug}/${cat.slug}`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.95,
          });
        }
      }
    }

    // ── Provider profile pages: /provider/{slug} ───────────────────────────
    businesses.forEach((b) => {
      urls.push({
        url: `${BASE_URL}/provider/${getProviderSlug(b)}`,
        lastModified: new Date(b.updatedAt || now),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    });

    // ── Cost guide pages: /cost/{category}/{city} ─────────────────────────
    for (const city of cities) {
      for (const cat of categories) {
        if (comboSet.has(`${city.slug.toLowerCase()}||${cat.slug}`)) {
          urls.push({
            url: `${BASE_URL}/cost/${cat.slug}/${city.slug}`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.65,
          });
        }
      }
    }

    // ── Near-me + How-to-hire pages ───────────────────────────────────────
    urls.push({
      url: `${BASE_URL}/services/near-me`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });

    categories.forEach((cat) => {
      urls.push({
        url: `${BASE_URL}/services/near-me/${cat.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
      urls.push({
        url: `${BASE_URL}/how-to-hire/${cat.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    });

    // ── Blog posts ────────────────────────────────────────────────────────
    blogs.forEach((b) => {
      urls.push({
        url: `${BASE_URL}/blog/${b.slug}`,
        lastModified: new Date(b.updatedAt || b.publishedAt || now),
        changeFrequency: "monthly",
        priority: 0.65,
      });
    });

    return urls;
  } catch (error) {
    console.error("Sitemap generation error:", error);
    // Fallback: return static core pages so /sitemap.xml never errors
    return [
      { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    ];
  }
}
