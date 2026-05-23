import React from "react";
import Link from "next/link";
import { Star, CheckCircle, Clock, MapPin, Briefcase, Navigation } from "lucide-react";
import { getProviderSlug } from "@/utils/slug";

const ProviderCard = ({ provider, distanceKm = null }) => {
  const { name, image, rating, reviews, category, experience, availability, responseTime, verification, city, pricing } = provider;
  const providerSlug = getProviderSlug(provider);
  const isAvailable = availability === "Available";

  return (
    <Link href={`/provider/${providerSlug}`} className="block group h-full">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 h-full flex flex-col">

        {/* Image area */}
        <div className="relative pt-[80%] overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100">
          {image ? (
            <img
              src={image}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl font-black text-blue-200">{name?.charAt(0)}</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Availability dot */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm border ${
              isAvailable
                ? "bg-green-500/20 border-green-400/40 text-green-100"
                : "bg-gray-500/20 border-gray-400/40 text-gray-200"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${ isAvailable ? "bg-green-400" : "bg-gray-400" }`} />
              {availability || "Unavailable"}
            </span>
          </div>

          {/* Verification badge */}
          {verification && (
            <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm border border-green-400/50 rounded-full px-2 py-1 flex items-center gap-1 shadow-lg">
              <CheckCircle size={14} className="text-white fill-white" />
              <span className="text-white text-xs font-bold">Verified</span>
            </div>
          )}

          {/* Distance badge — shown only in Near Me mode */}
          {distanceKm != null && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-blue-600/80 backdrop-blur-sm border border-blue-400/40 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              <Navigation size={11} />
              {distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`}
            </div>
          )}

          {/* Rating pill — bottom of image */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/25 px-2.5 py-1 rounded-full">
            <Star size={13} className="fill-yellow-400 text-yellow-400" />
            <span className="text-white font-bold text-sm">{rating > 0 ? rating.toFixed(1) : "New"}</span>
            {reviews > 0 && (
              <span className="text-white/70 text-xs">({reviews})</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1">
          {/* Category chip */}
          {category && (
            <span className="self-start text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full mb-2 capitalize">
              {category}
            </span>
          )}

          {/* Name */}
          <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
            {name}
            {verification && (
              <CheckCircle size={16} className="text-green-500 fill-green-100 flex-shrink-0" title="Verified Business" />
            )}
          </h3>

          {/* Meta row */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Briefcase size={11} />
              {experience} yr{experience !== 1 ? "s" : ""}
            </span>
            <span className="w-px h-3 bg-gray-200" />
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {city}
            </span>
            {responseTime && (
              <>
                <span className="w-px h-3 bg-gray-200" />
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {responseTime}
                </span>
              </>
            )}
          </div>

          {/* Callout fee */}
          {(() => {
            const fee = parseFloat(pricing?.calloutFee);
            return fee > 0 ? (
              <p className="text-xs text-gray-500 mb-2">
                Callout fee:{" "}
                <span className="font-semibold text-gray-700">
                  Rs. {fee.toLocaleString()}
                </span>
              </p>
            ) : null;
          })()}

          {/* CTA */}
          <div className="mt-auto pt-2">
            <span className="block w-full text-center py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-colors">
              View Profile
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProviderCard;
