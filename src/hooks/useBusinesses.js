import { useQuery } from "@tanstack/react-query";
import axios from "axios";

/**
 * Normalize a raw API business document for ProviderCard consumption.
 * Mirrors normalizeBusiness from lib/businesses.js but is client-safe (no server imports).
 */
function normalize(doc) {
  const id = (doc._id || doc.id)?.toString() || "";
  return {
    ...doc,
    id,
    _id: id,
    name: doc.name || "",
    category: doc.category || "",
    city: doc.city || "",
    area: doc.area || "",
    image: doc.profileImage || "",
    reviews: doc.reviewsCount ?? 0,
    rating: doc.rating ?? 0,
    verification: doc.verification ?? false,
    availability: doc.availability || "Unavailable",
    responseTime: doc.responseTime || "",
    experience: doc.experience ?? 0,
  };
}

/**
 * Fetch paginated, filtered businesses from /api/businesses.
 *
 * @param {{ category?: string, city?: string, sort?: string, available?: boolean, verified?: boolean, page?: number, limit?: number, lat?: number|null, lng?: number|null }} opts
 */
export function useBusinesses({ category = "", city = "", sort = "rating", available = false, verified = false, page = 1, limit = 12, lat = null, lng = null } = {}) {
  return useQuery({
    queryKey: ["businesses", { category, city, sort, available, verified, page, limit, lat, lng }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (city) params.set("city", city);
      // When using geo sort, skip the sort param (backend ignores it in $geoNear mode)
      if (lat == null && sort && sort !== "rating") params.set("sort", sort);
      if (available) params.set("available", "1");
      if (verified) params.set("verified", "1");
      if (lat != null && lng != null) {
        params.set("lat", String(lat));
        params.set("lng", String(lng));
      }
      params.set("page", String(page));
      params.set("limit", String(limit));

      const { data } = await axios.get(`/api/businesses?${params}`);
      const result = data.data;

      return {
        ...result,
        businesses: result.businesses.map(normalize),
      };
    },
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev, // keep previous page visible while loading next
  });
}
