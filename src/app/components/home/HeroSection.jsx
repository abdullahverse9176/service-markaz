"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation, Loader2, ArrowRight, CheckCircle2, Zap, Wrench, Sparkles, GraduationCap, Home, Car, X } from "lucide-react";
import CategorySearchBox from "@/app/components/CategorySearchBox";
import { useCities } from "@/hooks/useCities";
import { useLocation } from "@/app/context/LocationContext";
import GreenBtn from "../buttons/GreenBtn";
import GreenOutlineBtn from "../buttons/GreenOutlineBtn";

// Quick-access popular category pills (slug + label)
const POPULAR_CATEGORIES = [
  { slug: "electricians", label: "Electrician", icon: Zap, color: "bg-[#fef3c7] text-[#92400e]" },
  { slug: "plumbers", label: "Plumber", icon: Wrench, color: "bg-[#e0f2fe] text-[#1e40af]" },
  { slug: "home-cleaning", label: "Cleaning", icon: Sparkles, color: "bg-[#f3e8ff] text-[#6b21a8]" },
  { slug: "tuition", label: "Tuition", icon: GraduationCap, color: "bg-[#dcfce7] text-[#166534]" },
  { slug: "repair", label: "Repair", icon: Home, color: "bg-[#ffe4e6] text-[#9f1239]" },
  { slug: "mechanic", label: "Mechanic", icon: Car, color: "bg-[#f1f5f9] text-[#334155]" },
];

const HeroSection = () => {
  const router = useRouter();
  const { data: cities = [] } = useCities();

  const [categorySlug, setCategorySlug] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [citySlug, setCitySlug] = useState("");

  // Use shared location context — one GPS call for the whole page.
  // clearLocation aliased as clearNearMe so the rest of the component stays unchanged.
  const { locating, locError, nearMeActive, userLat, userLng, requestLocation, clearLocation: clearNearMe } = useLocation();

  function handleCategorySelect(slug, name) {
    setCategorySlug(slug);
    setCategoryInput(name);
  }

  function handleCategoryInputChange(text) {
    setCategoryInput(text);
    if (!text) setCategorySlug("");
  }

  function handleCategoryClear() {
    setCategorySlug("");
    setCategoryInput("");
  }

  function handleCityChange(value) {
    setCitySlug(value);
    clearNearMe();
  }

  function handleNearMe() {
    if (nearMeActive) {
      clearNearMe();
      return;
    }
    requestLocation(cities)
      .then(() => {
        // Clear city dropdown — GPS coordinates will be used instead
        setCitySlug("");
      })
      .catch(() => {}); // error shown via locError
  }

  function handleSearch() {
    const params = new URLSearchParams();
    if (categorySlug) params.set("category", categorySlug);
    if (nearMeActive && userLat && userLng) {
      params.set("lat", String(userLat));
      params.set("lng", String(userLng));
    } else if (citySlug) {
      params.set("city", citySlug);
    }
    router.push(`/services?${params.toString()}`);
  }

  function handleQuickPill(slug) {
    const params = new URLSearchParams();
    params.set("category", slug);
    if (nearMeActive && userLat && userLng) {
      params.set("lat", String(userLat));
      params.set("lng", String(userLng));
    } else if (citySlug) {
      params.set("city", citySlug);
    }
    router.push(`/services?${params.toString()}`);
  }

  return (
    <section className="relative bg-gradient-to-b from-[#eafaf1] via-[#fdfbfa] to-white text-gray-900 mb-0 lg:mb-20 pt-8 pb-12 sm:py-16 overflow-hidden">
      {/* Background Blobs for soft gradient effect */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#e1f8eb] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob pointer-events-none"></div>
      <div className="absolute top-0 left-10 w-72 h-72 bg-[#fff5ea] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#f3e8ff] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 pointer-events-none"></div>

      <div className="max-w-6xl w-full mx-auto text-center relative z-10 px-4 sm:px-6">
        
        {/* Top Badge */}
        <div className="flex justify-center mb-5 sm:mb-6 mt-4 sm:mt-8">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-[#d1fae5] px-3 sm:px-4 py-1.5 rounded-full border border-[#a7f3d0] shadow-sm">
            <span className="text-[#059669] font-bold text-[11px] sm:text-sm tracking-wide uppercase sm:normal-case">Pakistan&apos;s #1 Local Services Platform</span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-[2.25rem] leading-[1.15] sm:text-4xl md:text-6xl font-extrabold sm:leading-tight text-[#111827] tracking-tight">
          Find Trusted Service Providers <br className="hidden md:block" />
          <span className="text-[#00a676]">Near You</span>
        </h1>
        <p className="mt-4 sm:mt-5 text-gray-600 text-[15px] sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
          Connect with 3,200+ verified professionals. From home repairs to personal services, we have got you covered.
        </p>

        {/* Checkmarks */}
        <div className="flex border-b border-gray-100 sm:border-0 pb-5 sm:pb-0 flex-wrap justify-center gap-3 sm:gap-8 mt-5 sm:mt-6">
          {['100% Verified', 'Fast Response', 'Best Prices'].map(feature => (
            <div key={feature} className="flex items-center gap-1.5 text-[13px] sm:text-sm font-bold text-gray-700 bg-gray-50 sm:bg-transparent px-3 py-1 sm:p-0 rounded-lg sm:rounded-none">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#00a676]" />
              {feature}
            </div>
          ))}
        </div>

        {/* Search card */}
        <div className="mt-6 sm:mt-10 bg-white sm:rounded-[2rem] rounded-3xl p-4 sm:p-4 shadow-[0_8px_30px_-12px_rgba(0,166,118,0.2)] border border-[#00a676]/20 sm:border-gray-100 max-w-3xl mx-auto relative z-40">
          {/* Subtle mobile pattern in search card */}
          <div className="absolute inset-0 bg-[#eafaf1] opacity-30 sm:hidden pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch relative">
            {/* Category search */}
            <div className="flex-1 w-full relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
              <CategorySearchBox
                inputValue={categoryInput}
                onInputChange={handleCategoryInputChange}
                onSelect={handleCategorySelect}
                onClear={handleCategoryClear}
                placeholder="What service do you need?"
                inputClassName="py-3.5 pl-11 bg-white sm:bg-[#f4fbfa] border border-gray-200 sm:border-[#d1fae5] focus:border-[#00a676] focus:ring-4 focus:ring-[#00a676]/10 rounded-xl w-full text-gray-800 placeholder-gray-400 shadow-sm sm:shadow-none transition-all font-medium"
                className="w-full text-left"
              />
            </div>

            {/* City select */}
            <div className="flex-1 w-full relative bg-white sm:bg-[#f4fbfa] border border-gray-200 sm:border-[#d1fae5] focus-within:border-[#00a676] focus-within:ring-4 focus-within:ring-[#00a676]/10 rounded-xl flex items-center transition-all shadow-sm sm:shadow-none">
              <span className="absolute left-4 text-gray-400 sm:text-[#00a676] pointer-events-none"><Navigation size={18} /></span>
              <select
                value={citySlug}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full bg-transparent px-11 py-3.5 text-[15px] sm:text-sm font-medium text-gray-800 outline-none cursor-pointer appearance-none truncate"
              >
                <option value="">Enter your location</option>
                {cities.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search button */}
            <button
              onClick={handleSearch}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#00a676] hover:bg-[#008f65] active:scale-[0.98] text-white font-bold text-[15px] px-8 py-3.5 sm:py-0 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(0,166,118,0.39)] shrink-0"
            >
              Search
            </button>
          </div>

          {/* Near Me row */}
          <div className="mt-3.5 flex items-center justify-center gap-2.5 flex-wrap ml-0 sm:ml-2 relative z-10 cursor-pointer">
            <button
              onClick={handleNearMe}
              disabled={locating}
              className={`group cursor-pointer flex items-center justify-center sm:justify-start gap-1.5 px-4 py-2 sm:px-3 sm:py-1.5 rounded-xl text-sm font-bold border transition-all shrink-0 shadow-sm active:scale-[0.98] ${
                nearMeActive
                  ? "bg-[#00a676] text-white border-[#00a676] shadow-inner"
                  : "bg-white text-gray-700 border-gray-200 hover:border-[#00a676] hover:text-[#00a676] hover:bg-[#eafaf1]"
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {locating ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Navigation
                  size={15}
                  className={nearMeActive ? "text-white" : "text-gray-500 group-hover:text-[#00a676]"}
                />
              )}
              <span className={nearMeActive ? "text-white" : "text-gray-700 group-hover:text-[#00a676]"}>
                Use My Current Location
              </span>
            </button>

            {nearMeActive && (
              <span className="flex items-center gap-1 text-[11px] sm:text-xs bg-[#e6f7ec] text-[#00a676] border border-[#c3eed4] px-2.5 py-1.5 rounded-full font-bold uppercase tracking-wider">
                <Navigation size={11} />
                Active
                <button onClick={clearNearMe} className="ml-1.5 p-0.5 bg-[#00a676]/10 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors cursor-pointer">
                  <X size={12} />
                </button>
              </span>
            )}

            {locError && (
              <span className="text-xs font-semibold text-red-500 bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-100">{locError}</span>
            )}
          </div>
        </div>

        {/* Quick-access popular category pills (Horizontal scroll on mobile) */}
        <div className="mt-8 mx-auto max-w-3xl overflow-hidden relative">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest sm:hidden mb-3 text-left px-2">Popular Services</p>
          <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap justify-start sm:justify-center gap-3 md:gap-4 pb-2 sm:pb-0 px-2 sm:px-0 snap-x">
            {POPULAR_CATEGORIES.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.slug}
                  onClick={() => handleQuickPill(p.slug, p.label)}
                  className={`flex items-center gap-2 px-4 py-2.5 sm:py-2 ${p.color} rounded-[14px] text-[13px] sm:text-sm font-bold transition hover:scale-105 shrink-0 snap-start shadow-sm border border-black/5`}
                >
                  <Icon size={16} className="opacity-80" />
                  {p.label}
                </button>
              );
            })}
          </div>
          {/* Subtle fade on right side for mobile scroll indicator */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent sm:hidden pointer-events-none"></div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 sm:mt-10 flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3.5 sm:gap-4 pb-6 sm:pb-10 px-2 sm:px-0">

          <GreenBtn onClick={handleSearch} title="Find Services" className="w-full sm:w-auto text-[15px] py-4 sm:py-3.5" />
          <GreenOutlineBtn href="/add-business" title="Become a Provider" className="w-full sm:w-auto text-[15px] py-4 sm:py-3.5" />
          
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
