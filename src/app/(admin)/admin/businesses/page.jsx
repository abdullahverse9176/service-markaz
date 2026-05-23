"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, Star, CheckCircle } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

const STATUS_STYLE = {
  active:  "bg-green-50 text-green-700 ring-1 ring-green-200",
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  blocked: "bg-red-50 text-red-600 ring-1 ring-red-200",
};

const PAGE_SIZE = 10;

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

const CATEGORIES = [
  "Electrician", "Plumber", "AC Technician", "Carpenter", "Cleaner",
  "Tutor", "Tailor", "Home Repair", "Painter", "Pest Control"
];

const CITIES = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Peshawar", "Quetta"
];

export default function BusinessesPage() {
  const { token } = useAuth();

  const [businesses, setBusinesses] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({ active: 0, pending: 0, blocked: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  const debouncedSearch = useDebounce(search, 400);

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter, categoryFilter, cityFilter]);

  const fetchBusinesses = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page, limit: PAGE_SIZE });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter) params.set("status", statusFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      if (cityFilter) params.set("city", cityFilter);

      const res = await fetch(`/api/admin/businesses?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setBusinesses(json.data.businesses);
        setTotal(json.data.total);
        setTotalPages(json.data.totalPages);
        setSummary(json.data.summary);
      } else {
        setError(json.message || "Failed to load businesses.");
      }
    } catch {
      setError("Network error — could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, [token, page, debouncedSearch, statusFilter, categoryFilter, cityFilter]);

  useEffect(() => { fetchBusinesses(); }, [fetchBusinesses]);

  const handleStatusChange = async (businessId, newStatus) => {
    setActionLoading(businessId);
    try {
      const res = await fetch("/api/admin/businesses", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ businessId, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setBusinesses((prev) =>
          prev.map((b) => (b._id === businessId ? { ...b, status: newStatus } : b))
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleFeaturedToggle = async (businessId, currentFeatured) => {
    setActionLoading(businessId);
    try {
      const res = await fetch("/api/admin/businesses", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ businessId, featured: !currentFeatured }),
      });
      const json = await res.json();
      if (json.success) {
        setBusinesses((prev) =>
          prev.map((b) => (b._id === businessId ? { ...b, featured: !currentFeatured } : b))
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const summaryCards = [
    { label: "Total Businesses", value: total,             color: "text-blue-600",   bg: "bg-blue-50" },
    { label: "Active",           value: summary.active,    color: "text-green-600",  bg: "bg-green-50" },
    { label: "Pending",          value: summary.pending,   color: "text-amber-600",  bg: "bg-amber-50" },
    { label: "Blocked",          value: summary.blocked,   color: "text-red-600",    bg: "bg-red-50" },
  ];

  const pages = buildPageList(page, totalPages);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Businesses</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage all registered businesses on the platform.</p>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {summaryCards.map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl px-5 py-4 border border-white`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
            <Search size={15} className="text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search businesses by name or email…"
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="blocked">Blocked</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 outline-none"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 outline-none"
          >
            <option value="">All Cities</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 font-medium">
                <th className="px-6 py-3 text-left">Business</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">City</th>
                <th className="px-4 py-3 text-left">Owner</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Rating</th>
                <th className="px-4 py-3 text-left">Verified</th>
                <th className="px-4 py-3 text-left">Featured</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                    <p className="text-sm">Loading businesses…</p>
                  </td>
                </tr>
              ) : businesses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No businesses found.
                  </td>
                </tr>
              ) : (
                businesses.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {b.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{b.name}</p>
                          <p className="text-xs text-gray-400">{b.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 text-xs font-medium">{b.category}</td>
                    <td className="px-4 py-3.5 text-gray-600 text-xs">{b.city}</td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs text-gray-600 font-medium">{b.owner?.name || "N/A"}</p>
                      <p className="text-xs text-gray-400">{b.owner?.email || "N/A"}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${STATUS_STYLE[b.status] ?? ""}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-gray-800">{b.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-400">({b.reviewsCount})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {b.verification ? (
                        <div className="flex items-center gap-1 text-green-600" title="Verified Business">
                          <CheckCircle size={16} className="fill-green-100" />
                          <span className="text-xs font-semibold">Yes</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        disabled={actionLoading === b._id}
                        onClick={() => handleFeaturedToggle(b._id, b.featured)}
                        title={b.featured ? "Remove from featured" : "Mark as featured"}
                        className={`p-1.5 rounded-lg transition ${
                          b.featured
                            ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                            : "text-gray-300 hover:text-amber-400 hover:bg-amber-50"
                        }`}
                      >
                        <Star size={15} fill={b.featured ? "currentColor" : "none"} />
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      {actionLoading === b._id ? (
                        <Loader2 size={15} className="animate-spin text-gray-400" />
                      ) : (
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b._id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border outline-none cursor-pointer capitalize ${
                            b.status === "active"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : b.status === "pending"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-red-50 text-red-600 border-red-200"
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="blocked">Blocked</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-700">{businesses.length}</span> of{" "}
              <span className="font-semibold text-gray-700">{total}</span> businesses
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 text-sm rounded-lg text-gray-500 hover:bg-gray-100 transition disabled:opacity-40"
              >
                Prev
              </button>
              {pages.map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-gray-400">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1.5 text-sm rounded-lg font-semibold transition ${
                      p === page ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-sm rounded-lg text-gray-500 hover:bg-gray-100 transition disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
