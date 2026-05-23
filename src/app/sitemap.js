import { connectDB } from "@/lib/db/connect";
import City from "@/models/City";
import Category from "@/models/Category";
import Business from "@/models/Business";
import Blog from "@/models/Blog";
import { getSiteSettings } from "@/lib/settings";
import { getProviderSlug } from "@/utils/slug";

export const revalidate = 86400; // Each segment revalidates once per day

const FALLBACK_URL = "https://servicemarkaz.com";

// Generates a sitemap INDEX at /sitemap.xml pointing to 7 segments:
//   /sitemap/static.xml  /sitemap/city-hubs.xml  /sitemap/city-categories.xml
//   /sitemap/providers.xml  /sitemap/cost-pages.xml  /sitemap/near-me.xml  /sitemap/blog.xml
export async function generateSitemaps() {
  return [
    { id: "static" },
    { id: "city-hubs" },
    { id: "city-categories" },
    { id: "providers" },
    { id: "cost-pages" },
    { id: "near-me" },
    { id: "blog" },
  ];
}

export default async function sitemap(props) {
  const id = await props.id;
  const now = new Date();
  let BASE_URL = FALLBACK_URL;

  try {
    await connectDB();
    const settings = await getSiteSettings();
    BASE_URL = settings.siteUrl || FALLBACK_URL;

    switch (id) {
      // ── Static pages ──────────────────────────────────────────────────────
      case "static": {
        const categories = await Category.find({ isActive: true })
          .select("slug")
          .lean();
        return [
          { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
          { url: `${BASE_URL}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
          { url: `${BASE_URL}/cities`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
          { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
          { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
          { url: `${BASE_URL}/contact-us`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
          // Individual category landing pages
          ...categories.map((cat) => ({
            url: `${BASE_URL}/categories/${cat.slug}`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.8,
          })),
        ];
      }

      // ── City hub pages: /{city} ───────────────────────────────────────────
      case "city-hubs": {
        const cities = await City.find({ status: "active" })
          .select("slug updatedAt")
          .lean();
        return cities.map((city) => ({
          url: `${BASE_URL}/${city.slug}`,
          lastModified: new Date(city.updatedAt || now),
          changeFrequency: "weekly",
          priority: 0.85,
        }));
      }

      // ── City + Category pages: /{city}/{category} (PRIMARY SEO pages) ─────
      // Only includes combos that have at least 1 active business — no thin pages
      case "city-categories": {
        const [cities, categories, activeCombos] = await Promise.all([
          City.find({ status: "active" }).select("slug").lean(),
          Category.find({ isActive: true }).select("slug").lean(),
          Business.aggregate([
            { $match: { status: "active" } },
            {
              $group: {
                _id: { city: { $toLower: "$city" }, category: "$category" },
              },
            },
          ]),
        ]);

        // O(1) lookup: "cityslug||catslug"
        const comboSet = new Set(
          activeCombos.map((c) => `${c._id.city}||${c._id.category}`)
        );

        const urls = [];
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
        return urls;
      }

      // ── Provider profile pages: /provider/{slug} ───────────────────────────
      // Only quality providers: must have a profile image AND a description
      case "providers": {
        const businesses = await Business.find({
          status: "active",
          profileImage: { $nin: ["", null] },
          about: { $nin: ["", null] },
        })
          .select("_id name category area city updatedAt")
          .lean();

        return businesses.map((b) => ({
          url: `${BASE_URL}/provider/${getProviderSlug(b)}`,
          lastModified: new Date(b.updatedAt || now),
          changeFrequency: "weekly",
          priority: 0.7,
        }));
      }

      // ── Cost guide pages: /cost/{category}/{city} ─────────────────────────
      // Only include combos that have at least 1 active business — avoids thin pages
      case "cost-pages": {
        const [cities, categories, activeCombos] = await Promise.all([
          City.find({ status: "active" }).select("slug").lean(),
          Category.find({ isActive: true }).select("slug").lean(),
          Business.aggregate([
            { $match: { status: "active" } },
            {
              $group: {
                _id: { city: { $toLower: "$city" }, category: "$category" },
              },
            },
          ]),
        ]);

        // Build O(1) lookup set of "cityslug||catslug" combos with active businesses
        const comboSet = new Set(
          activeCombos.map((c) => `${c._id.city}||${c._id.category}`)
        );

        const urls = [];
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
        return urls;
      }

      // ── Near-me + How-to-hire pages ───────────────────────────────────────
      case "near-me": {
        const categories = await Category.find({ isActive: true })
          .select("slug")
          .lean();
        return [
          {
            url: `${BASE_URL}/services/near-me`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.8,
          },
          ...categories.map((cat) => ({
            url: `${BASE_URL}/services/near-me/${cat.slug}`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.7,
          })),
          ...categories.map((cat) => ({
            url: `${BASE_URL}/how-to-hire/${cat.slug}`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.6,
          })),
        ];
      }

      // ── Blog posts ────────────────────────────────────────────────────────
      case "blog": {
        const blogs = await Blog.find({ status: "published" })
          .select("slug updatedAt publishedAt")
          .lean();
        return blogs.map((b) => ({
          url: `${BASE_URL}/blog/${b.slug}`,
          lastModified: new Date(b.updatedAt || b.publishedAt || now),
          changeFrequency: "monthly",
          priority: 0.65,
        }));
      }

      default:
        return [];
    }
  } catch {
    // Fallback: return static core pages so /sitemap.xml never errors
    return [
      { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    ];
  }
}
