import { MapPin, Navigation } from "lucide-react";

export default function ServiceAreasSection({ provider }) {
  if (!provider.serviceAreas || provider.serviceAreas.length === 0) return null;

  return (
    <div className="bg-white sm:shadow-sm sm:rounded-2xl p-5 sm:p-6 border-b sm:border-none border-gray-100">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div className="p-1.5 sm:p-2 bg-rose-50 rounded-lg">
          <Navigation size={18} className="text-rose-500" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Service Areas</h2>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-2.5">
        {provider.serviceAreas.map((area, index) => (
          <div
            key={index}
            className="flex items-center gap-1 sm:gap-1.5 bg-rose-50/80 sm:bg-rose-50 border border-rose-100 sm:border-rose-200 text-rose-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-rose-100 transition whitespace-nowrap"
          >
            <MapPin size={13} className="text-rose-500" />
            <span>{area}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
