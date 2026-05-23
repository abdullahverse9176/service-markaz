import { getBusinesses } from "@/lib/businesses";
import FeaturedProvidersClient from "./FeaturedProvidersClient";

const FeaturedProviders = async () => {
  // Fetch only featured businesses; no fallback to keep the section exclusive
  const { businesses } = await getBusinesses({
    featured: true,
    onlyActive: true,
    limit: 12,
  });

  if (!businesses.length) return null;

  // Strip Mongoose ObjectId / Buffer references — only pass plain serializable fields to the Client Component
  const safeProviders = businesses.map((b) => ({
    id: b.id,
    name: b.name,
    image: b.image || "",
    rating: b.rating ?? 0,
    reviews: b.reviews ?? 0,
    category: b.category || "",
    experience: b.experience ?? 0,
    availability: b.availability || "",
    responseTime: b.responseTime || "",
    verification: b.verification ?? false,
    city: b.city || "",
    // Include coordinates for proximity filtering (null if not set)
    location: b.location || null,
  }));

  return <FeaturedProvidersClient providers={safeProviders} />;
};

export default FeaturedProviders;