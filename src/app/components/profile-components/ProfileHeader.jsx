import {
  Star,
  CheckCircle,
  Clock,
  MapPin,
  Briefcase,
  Award,
} from "lucide-react";

const availabilityStyles = {
  Available: "bg-green-100 text-green-700 border border-green-200",
  Unavailable: "bg-red-100 text-red-700 border border-red-200",
};

export default function ProfileHeader({ provider }) {
  return (
    <div className="bg-white shadow-sm rounded-b-2xl lg:rounded-2xl overflow-hidden mb-6">
      {/* Cover — uses uploaded banner image if available, otherwise gradient */}
      <div className="h-36 relative">
        {provider.bannerImage ? (
          <img
            src={provider.bannerImage}
            alt="Business banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600">
            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml,%3Csvg width%3D%2260%22 height%3D%2260%22 viewBox%3D%220 0 60 60%22 xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg fill%3D%22none%22 fill-rule%3D%22evenodd%22%3E%3Cg fill%3D%22%23ffffff%22 fill-opacity%3D%221%22%3E%3Cpath d%3D%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="relative -mt-14 flex-shrink-0">
            <img
              src={provider.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&size=112&background=3b82f6&color=fff&bold=true`}
              alt={provider.name}
              className="w-28 h-28 rounded-2xl border-4 border-white shadow-md object-cover"
            />
            {provider.verification && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow">
                <CheckCircle size={20} className="text-green-500 fill-green-100" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 pt-2">
            <div className="flex flex-wrap items-start gap-3 justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900">{provider.name}</h1>
                  {provider.verification && (
                    <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Briefcase size={14} className="text-blue-500" />
                  <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide">
                    {provider.category.replace(/-/g, " ")}
                  </p>
                </div>
              </div>

              <span
                className={`text-sm px-3 py-1.5 rounded-full font-semibold ${
                  availabilityStyles[provider.availability] ?? availabilityStyles.Unavailable
                }`}
              >
                {provider.availability}
              </span>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1.5">
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-gray-800">{provider.rating}</span>
                <span className="text-gray-500">({provider.reviews} reviews)</span>
              </div>

              {provider.responseTime && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Clock size={14} className="text-blue-500" />
                  <span>{provider.responseTime}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-gray-600">
                <MapPin size={14} className="text-rose-500" />
                <span>
                  {provider.area}, {provider.city}
                </span>
              </div>

              {provider.experience > 0 && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Award size={14} className="text-purple-500" />
                  <span>{provider.experience} yrs experience</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
