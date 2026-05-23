"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

// Leaflet is browser-only — load client-side only
const LocationMap = dynamic(() => import("./LocationMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center gap-2 text-sm text-gray-400">
      <MapPin size={16} className="text-gray-300" />
      Loading map…
    </div>
  ),
});

export default function LocationSection({ provider }) {
  const coords = provider.location?.coordinates;
  if (!coords || coords.length !== 2) return null;

  // GeoJSON stores [lng, lat]
  const [lng, lat] = coords;

  return (
    <div className="bg-white sm:shadow-sm sm:rounded-2xl p-5 sm:p-6 border-b sm:border-none border-gray-100">
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg">
          <MapPin size={18} className="text-blue-600" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Location</h2>
      </div>

      <LocationMap lat={lat} lng={lng} />

      <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
        <MapPin size={11} />
        Approximate location shown
      </p>
    </div>
  );
}
