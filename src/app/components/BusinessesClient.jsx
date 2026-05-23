"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, SlidersHorizontal, X, Loader2, Navigation, ArrowUpDown, CheckCircle } from "lucide-react";
import ProviderCard from "@/app/components/ProviderCard";
import Pagination from "@/app/components/Pagination";
import CategorySearchBox from "@/app/components/CategorySearchBox";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useCategories } from "@/hooks/useCategories";
import { useCities } from "@/hooks/useCities";
import { useNearMe } from "@/hooks/useNearMe";
import GreenBtn from "./buttons/GreenBtn";

const LIMIT = 12;

const SORT_OPTIONS = [
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest First" },
  { value: "experience", label: "Most Experienced" },
];

export default function BusinessesClient({ initialCategory, initialCity, initialPage, initialSort, initialAvailable, initialVerified, initialLat, initialLng }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Filter state
  const [category, setCategory] = useState(initialCategory);
  const [categoryInput, setCategoryInput] = useState(""); // display text in search box
  const [city, setCity] = useState(initialCity);
  const [sort, setSort] = useState(initialSort || "rating");
  const [available, setAvailable] = useState(initialAvailable || false);
  const [verified, setVerified] = useState(initialVerified || false);
  const [page, setPage] = useState(initialPage);

  // Near Me state (shared hook)
  const { locating, locError, nearMeActive, userLat, userLng, requestLocation, clearNearMe } = useNearMe(initialLat, initialLng);

  const { data: categoriesData = [] } = useCategories();
  const { data: citiesData = [] } = useCities();

  const { data, isFetching } = useBusinesses({ category, city, sort, available, verified, page, limit: LIMIT, lat: userLat, lng: userLng });

  const businesses = data?.businesses || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  // Resolve category display name for chips
  const categoryName = categoriesData.find((c) => c.slug === category)?.name || category;
  const cityName = citiesData.find((c) => c.slug === city)?.name || city?.replace(/-/g, " ");

  // â”€â”€ URL sync â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const pushURL = useCallback(
    (overrides = {}) => {
      const next = { category, city, sort, available, page: String(page), ...overrides };
      const params = new URLSearchParams();
      if (next.category) params.set("category", next.category);
      if (next.city) params.set("city", next.city);
      if (next.sort && next.sort !== "rating") params.set("sort", next.sort);
      if (next.available) params.set("available", "1");
      if (next.page && next.page !== "1") params.set("page", next.page);
      startTransition(() => router.push(`/services?${params.toString()}`, { scroll: false }));
    },
    [category, city, sort, available, page, router]
  );

  // â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function handleCategorySelect(slug, name) {
    setCategory(slug);
    setCategoryInput(name);
    setPage(1);
    pushURL({ category: slug, page: "1" });
  }

  function handleCategoryInputChange(text) {
    setCategoryInput(text);
    // if user clears input manually, clear category filter too
    if (!text) { setCategory(""); pushURL({ category: "", page: "1" }); }
  }

  function handleCategoryClear() {
    setCategory("");
    setCategoryInput("");
    setPage(1);
    pushURL({ category: "", page: "1" });
  }

  function handleCity(value) {
    setCity(value);
    clearNearMe();
    setPage(1);
    pushURL({ city: value, page: "1" });
  }

  function handleSort(value) {
    setSort(value);
    setPage(1);
    pushURL({ sort: value, page: "1" });
  }

  function handleAvailable(checked) {
    setAvailable(checked);
    setPage(1);
    pushURL({ available: checked, page: "1" });
  }

  function handleVerified(checked) {
    setVerified(checked);
    setPage(1);
    pushURL({ verified: checked, page: "1" });
  }

  function handlePageChange(p) {
    setPage(p);
    pushURL({ page: String(p) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearFilters() {
    setCategory("");
    setCategoryInput("");
    setCity("");
    setSort("rating");
    setAvailable(false);
    setVerified(false);
    setPage(1);
    clearNearMe();
    startTransition(() => router.push("/services", { scroll: false }));
  }

  // ── Near Me ──────────────────────────────────────────────────────────────────
  function handleNearMe() {
    if (nearMeActive) {
      // Toggle off
      clearNearMe();
      return;
    }
    requestLocation(citiesData)
      .then(() => {
        // Clear city filter — Near Me searches all providers by GPS distance
        setCity("");
        setPage(1);
        pushURL({ city: "", page: "1" });
      })
      .catch(() => {}); // error already shown via locError
  }

  const hasActiveFilters = category || city || sort !== "rating" || available || verified || nearMeActive;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* header section*/}
      <section className="bg-primary text-white py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Find Service Providers Near You
          </h1>
          <p className="text-blue-100 text-lg font-medium mb-8">
            Browse verified plumbers, electricians, painters &amp; more across Pakistan
          </p>

          <CategorySearchBox
            inputValue={categoryInput}
            onInputChange={handleCategoryInputChange}
            onSelect={handleCategorySelect}
            onClear={handleCategoryClear}
            placeholder="Search category (plumber, AC repair, etc.)"
            inputClassName="py-3.5"
          />
        </div>
      </section>

      {/* form */}
      <section className="bg-white border-b border-gray-200 sticky top-[64px] z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex md:flex-wrap items-center gap-3 overflow-x-auto no-scrollbar pb-3 md:pb-3">
          <div className="flex items-center gap-2 pr-2 border-r border-gray-200 shrink-0 hidden md:flex">
            <SlidersHorizontal size={18} className="text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">Filters</span>
          </div>

          {/* City select */}
          <select
            value={city}
            onChange={(e) => handleCity(e.target.value)}
            className="flex-1 md:flex-none min-w-[140px] md:min-w-[160px] border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer transition-colors appearance-none"
            style={{ backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem top 50%', backgroundSize: '0.65rem auto', paddingRight: '2rem' }}
          >
            <option value="">All Cities</option>
            {citiesData.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>

          {/* Sort select */}
          <div className="flex items-center gap-1.5 flex-1 md:flex-none min-w-[150px] md:min-w-[170px]">
            <ArrowUpDown size={15} className="text-gray-400 shrink-0 hidden md:block" />
            <select
              value={sort}
              onChange={(e) => handleSort(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer transition-colors appearance-none"
              style={{ backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem top 50%', backgroundSize: '0.65rem auto', paddingRight: '2rem' }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Near Me button */}
          <button
            onClick={handleNearMe}
            disabled={locating}
            className={`group flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all shrink-0 shadow-sm active:scale-[0.98] ${nearMeActive
                ? "bg-primary text-white border-primary hover:bg-primary hover:text-white"
                : "bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary hover:bg-primary/5"
              } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {locating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Navigation
                size={16}
                className={
                  nearMeActive
                    ? "text-white"
                    : "text-gray-700 group-hover:text-primary"
                }
              />
            )}

            <span
              className={
                nearMeActive
                  ? "text-white"
                  : "text-gray-700 group-hover:text-primary"
              }
            >
              Near Me
            </span>
          </button>

          {/* Available only toggle */}
          <label className="flex items-center gap-2 cursor-pointer shrink-0 select-none bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors px-3 py-2 rounded-xl">
            <div
              onClick={() => handleAvailable(!available)}
              className={`relative w-9 h-5 rounded-full transition-colors ${available ? "bg-green-500" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${available ? "translate-x-4" : "translate-x-0"}`}
              />
            </div>
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              Available Only
            </span>
          </label>

          {/* Verified only toggle */}
          <label className="flex items-center gap-2 cursor-pointer shrink-0 select-none bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors px-3 py-2 rounded-xl">
            <div
              onClick={() => handleVerified(!verified)}
              className={`relative w-9 h-5 rounded-full transition-colors ${verified ? "bg-green-500" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${verified ? "translate-x-4" : "translate-x-0"}`}
              />
            </div>
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <CheckCircle size={14} className={verified ? "text-green-600" : "text-gray-400"} />
              Verified Only
            </span>
          </label>

          {/* Clear all */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-100 hover:border-red-200 transition-all shrink-0"
            >
              <X size={15} />
              Clear
            </button>
          )}
        </div>

        {/* Location error */}
        {locError && (
          <p className="text-center text-xs text-red-500 pb-2 px-4">{locError}</p>
        )}

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="max-w-6xl mx-auto px-4 pb-2.5 flex flex-wrap gap-2">
            {nearMeActive && (
              <span className="flex items-center gap-1.5 bg-blue-600 text-white border border-blue-600 text-xs px-3 py-1 rounded-full font-medium">
                <Navigation size={11} />
                Near Me — Sorted by Distance
                <button onClick={handleNearMe} className="hover:text-blue-200"><X size={11} /></button>
              </span>
            )}
            {category && (
              <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs px-3 py-1 rounded-full font-medium">
                {categoryName}
                <button onClick={handleCategoryClear} className="hover:text-blue-900"><X size={11} /></button>
              </span>
            )}
            {city && (
              <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs px-3 py-1 rounded-full font-medium">
                <MapPin size={11} />
                {cityName}
                <button onClick={() => handleCity("")} className="hover:text-blue-900"><X size={11} /></button>
              </span>
            )}
            {sort !== "rating" && !nearMeActive && (
              <span className="flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200 text-xs px-3 py-1 rounded-full font-medium">
                {SORT_OPTIONS.find((o) => o.value === sort)?.label}
                <button onClick={() => handleSort("rating")} className="hover:text-purple-900"><X size={11} /></button>
              </span>
            )}
            {available && (
              <span className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 text-xs px-3 py-1 rounded-full font-medium">
                <CheckCircle size={11} />
                Available Only
                <button onClick={() => handleAvailable(false)} className="hover:text-green-900"><X size={11} /></button>
              </span>
            )}
            {verified && (
              <span className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 text-xs px-3 py-1 rounded-full font-medium">
                <CheckCircle size={11} />
                Verified Only
                <button onClick={() => handleVerified(false)} className="hover:text-green-900"><X size={11} /></button>
              </span>
            )}
          </div>
        )}
      </section>

      {/* â”€â”€ Results â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        {/* Result meta */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <p className="text-sm text-gray-600">
            {isFetching ? "Loading…" : (
              <>
                <span className="font-semibold text-gray-800">{total}</span>{" "}
                provider{total !== 1 ? "s" : ""} found
                {city && <> in <span className="font-medium capitalize">{cityName}</span></>}
                {category && <> Â· <span className="font-medium capitalize">{categoryName}</span></>}
              </>
            )}
          </p>
          {isFetching && <Loader2 size={18} className="animate-spin text-blue-600" />}
        </div>

        {/* Grid */}
        {!isFetching && businesses.length === 0 ? (
          <div className="text-center py-20">
            <MapPin size={48} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600">No providers found</h2>
            <p className="text-gray-400 mt-2 mb-4 text-sm">
              Try a different category, city, or remove filters.
            </p>
            {hasActiveFilters && (
              <GreenBtn title="Clear Filters" onClick={clearFilters} />
            )}
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-200 ${isFetching ? "opacity-60 pointer-events-none" : "opacity-100"
              }`}
          >
            {businesses.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} distanceKm={nearMeActive ? provider.distanceKm : null} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </section>
    </div>
  );
}

