import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

// Leaflet is browser-only — must be loaded client-side only
const LocationPicker = dynamic(() => import("./LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center gap-2 text-sm text-gray-400">
      <MapPin size={18} className="text-gray-300" />
      Loading map…
    </div>
  ),
});

export default LocationPicker;
