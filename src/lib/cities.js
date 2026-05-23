import { connectDB } from "@/lib/db/connect";
import City from "@/models/City";

/**
 * Server-side function to fetch all active cities
 * Used in server components for SEO-optimized pages
 */
export async function getCities() {
  await connectDB();
  const cities = await City.find({ status: "active" })
    .select("name slug description businessCount")
    .sort({ name: 1 })
    .lean();
  
  return cities.map((city) => ({
    ...city,
    _id: city._id.toString(),
  }));
}

/**
 * Server-side function to fetch a single city by slug
 */
export async function getCityBySlug(slug) {
  await connectDB();
  const city = await City.findOne({ slug, status: "active" })
    .select("name slug description businessCount")
    .lean();
  
  if (!city) return null;
  
  return {
    ...city,
    _id: city._id.toString(),
  };
}
