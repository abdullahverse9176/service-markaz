"use client";

import { useMemo } from "react";
import { haversine, CITY_COORDS } from "@/utils/geolocation";
import { useLocation } from "@/app/context/LocationContext";
import FeaturedProvidersSlider from "./FeaturedProvidersSlider";

const RADIUS_KM = 30;

/** Returns { lat, lng } for a provider — exact coords first, city centre as fallback. */
function getProviderCoords(provider) {
  if (provider.location?.coordinates?.length === 2) {
    const [lng, lat] = provider.location.coordinates; // GeoJSON stores [lng, lat]
    return { lat, lng };
  }
  const cityKey = provider.city?.toLowerCase().trim();
  return CITY_COORDS[cityKey] || null;
}

export default function FeaturedProvidersClient({ providers }) {
  // Consume shared location — set once by LocationProvider, updated when user
  // clicks "Use My Current Location" in HeroSection. No separate GPS call here.
  const { userLat, userLng } = useLocation();

  const filtered = useMemo(() => {
    if (!userLat || !userLng) return providers;

    const nearby = providers.filter((p) => {
      const coords = getProviderCoords(p);
      if (!coords) return false;
      return haversine(userLat, userLng, coords.lat, coords.lng) <= RADIUS_KM;
    });

    // If no one is within range (user far from all featured providers), show all
    return nearby.length > 0 ? nearby : providers;
  }, [providers, userLat, userLng]);

  if (filtered.length === 0) return null;

  return (
    <section className="py-10 py-lg-16 max-w-6xl w-full mx-auto px-6">
      <div className="text-center mb-12">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">
          Featured
        </span>
        <h2 className="text-3xl font-bold text-gray-900">Top Rated Providers</h2>
        <p className="text-gray-500 mt-2">
          Hand-picked professionals trusted by hundreds of customers
        </p>
      </div>
      <FeaturedProvidersSlider providers={filtered} />
    </section>
  );
}
