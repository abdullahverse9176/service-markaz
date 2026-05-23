import Link from "next/link";
import { MapPin, Users, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function CityCard({ city, gradient }) {

  return (
    <Link
      href={`/${city.slug}`}
      className="group relative overflow-hidden rounded-2xl aspect-[4/3] block shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* Background — image if available, else gradient */}
      {city.image ? (
        <Image
          src={city.image}
          alt={city.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Provider count badge */}
      {city.businessCount > 0 && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          <Users size={11} />
          {city.businessCount}
        </div>
      )}

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin size={13} className="text-white/80" />
              <p className="text-white/80 text-xs font-medium">Pakistan</p>
            </div>
            <h3 className="text-white font-bold text-lg leading-tight">{city.name}</h3>
            <p className="text-white/70 text-xs mt-0.5">
              {city.businessCount > 0
                ? `${city.businessCount} service provider${city.businessCount !== 1 ? "s" : ""}`
                : "Coming soon"}
            </p>
          </div>

          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
            <ArrowRight size={14} className="text-white" />
          </div>
        </div>
      </div>
    </Link>
  );
}
