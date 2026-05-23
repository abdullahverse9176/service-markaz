"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Search, Trash2, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const LIMIT = 10;

const stars = (n) =>
  Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      size={11}
      className={i < n ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}
    />
  ));

export default function ReviewsPage() {
  const { token } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ total: 0, fiveStars: 0, avgRating: "0.0", flagged: 0 });
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const debouncedSearch = useDebounce(search, 400);

  const fetchReviews = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (ratingFilter) params.set("rating", ratingFilter);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/reviews?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setReviews(json.data.reviews);
        setTotal(json.data.total);
        setTotalPages(json.data.totalPages);
        setSummary(json.data.summary);
      }
    } finally {
      setLoading(false);
    }
  }, [token, page, debouncedSearch, ratingFilter, statusFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, ratingFilter, statusFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleStatusToggle = async (review) => {
    const newStatus = review.status === "flagged" ? "published" : "flagged";
    await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reviewId: review._id, status: newStatus }),
    });
    fetchReviews();
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    await fetch(`/api/admin/reviews?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchReviews();
  };

  const pageNumbers = () => {
    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Reviews</h2>
        <p className="text-sm text-gray-500 mt-0.5">Monitor and moderate customer reviews.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-2xl px-5 py-4">
          <p className="text-2xl font-bold text-blue-600">{summary.total}</p>
          <p className="text-sm text-gray-600 mt-0.5">Total Reviews</p>
        </div>
        <div className="bg-green-50 rounded-2xl px-5 py-4">
          <p className="text-2xl font-bold text-green-600">{summary.fiveStars}</p>
          <p className="text-sm text-gray-600 mt-0.5">5-star</p>
        </div>
        <div className="bg-yellow-50 rounded-2xl px-5 py-4">
          <p className="text-2xl font-bold text-yellow-600">{summary.avgRating}★</p>
          <p className="text-sm text-gray-600 mt-0.5">Avg Rating</p>
        </div>
        <div className="bg-red-50 rounded-2xl px-5 py-4">
          <p className="text-2xl font-bold text-red-600">{summary.flagged}</p>
          <p className="text-sm text-gray-600 mt-0.5">Flagged</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
            <Search size={15} className="text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by reviewer, business, comment…"
              className="bg-transparent text-sm placeholder-gray-400 outline-none w-full"
            />
          </div>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 outline-none"
          >
            <option value="">All Ratings</option>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="flagged">Flagged</option>
          </select>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="py-16 text-center text-sm text-gray-400">Loading reviews…</div>
          ) : reviews.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">No reviews found.</div>
          ) : (
            reviews.map((r) => (
              <div key={r._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {r.reviewerName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-sm text-gray-800">{r.reviewerName}</span>
                      <span className="text-gray-400 text-xs">on</span>
                      <span className="text-sm text-blue-600 font-medium">{r.businessName}</span>
                      <div className="flex items-center gap-0.5 ml-1">{stars(r.rating)}</div>
                      {r.status === "flagged" && (
                        <span className="text-xs bg-red-50 text-red-600 ring-1 ring-red-200 px-2 py-0.5 rounded-full font-semibold">
                          Flagged
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
                    <p className="text-xs text-gray-400 mt-1.5">
                      {new Date(r.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleStatusToggle(r)}
                      className={`p-1.5 rounded-lg transition ${
                        r.status === "flagged"
                          ? "text-orange-400 hover:text-green-600 hover:bg-green-50"
                          : "text-gray-400 hover:text-orange-500 hover:bg-orange-50"
                      }`}
                      title={r.status === "flagged" ? "Mark as Published" : "Flag Review"}
                    >
                      {r.status === "flagged" ? <ThumbsUp size={14} /> : <ThumbsDown size={14} />}
                    </button>
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {total === 0 ? 0 : Math.min((page - 1) * LIMIT + 1, total)}–{Math.min(page * LIMIT, total)}
              </span>{" "}
              of <span className="font-semibold text-gray-700">{total}</span> reviews
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
              </button>
              {pageNumbers().map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition ${
                    n === page
                      ? "bg-blue-600 text-white font-semibold"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

