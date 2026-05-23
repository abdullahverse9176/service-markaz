"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import {
  Plus, Search, Edit2, Trash2, Star, FileText,
  TrendingUp, BookOpen, Loader2, ChevronLeft, ChevronRight,
  Filter, Eye, EyeOff,
} from "lucide-react";

const LIMIT = 10;

const BLOG_CATEGORIES = [
  "All", "Plumbing", "AC Repair", "Electricians",
  "Home Cleaning", "Carpentry", "General Tips",
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

// ── Debounce hook ─────────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Summary Card ──────────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    published: "bg-green-100 text-green-700 border-green-200",
    draft: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${map[status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {status === "published" ? <Eye size={11} /> : <EyeOff size={11} />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminBlogsPage() {
  const { token } = useAuth();

  const [blogs, setBlogs] = useState([]);
  const [summary, setSummary] = useState({ total: 0, published: 0, drafts: 0, featured: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const debouncedSearch = useDebounce(search, 400);

  const fetchBlogs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter) params.set("status", statusFilter);
      if (categoryFilter && categoryFilter !== "All") params.set("category", categoryFilter);

      const res = await fetch(`/api/admin/blogs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setBlogs(json.data.blogs);
        setSummary(json.data.summary);
        setTotal(json.data.total);
        setTotalPages(json.data.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [token, page, debouncedSearch, statusFilter, categoryFilter]);

  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter, categoryFilter]);
  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This action cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) fetchBlogs();
      else alert(json.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleFeatured = async (blog) => {
    setTogglingId(blog._id);
    try {
      await fetch(`/api/admin/blogs/${blog._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ featured: !blog.featured }),
      });
      fetchBlogs();
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your blog content</p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <Plus size={16} />
          New Blog Post
        </Link>
      </div>

      {/* ── Summary Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={FileText}   label="Total Posts"   value={summary.total}     color="bg-blue-500" />
        <SummaryCard icon={Eye}        label="Published"     value={summary.published}  color="bg-green-500" />
        <SummaryCard icon={BookOpen}   label="Drafts"        value={summary.drafts}     color="bg-yellow-500" />
        <SummaryCard icon={Star}       label="Featured"      value={summary.featured}   color="bg-purple-500" />
      </div>

      {/* ── Filters ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, slug, author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white appearance-none cursor-pointer"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white appearance-none cursor-pointer"
            >
              {BLOG_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-blue-500" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-gray-400">
            <BookOpen size={40} className="mb-3 text-gray-300" />
            <p className="font-medium">No blog posts found</p>
            <p className="text-sm mt-1">Create your first blog post to get started</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Featured</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {blogs.map((blog) => (
                    <tr key={blog._id} className="hover:bg-gray-50/60 transition-colors group">
                      {/* Title */}
                      <td className="px-5 py-4 max-w-xs">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                            <BookOpen size={15} className="text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{blog.title}</p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">/{blog.slug}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4">
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                          {blog.category}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <StatusBadge status={blog.status} />
                      </td>

                      {/* Featured toggle */}
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => toggleFeatured(blog)}
                          disabled={togglingId === blog._id}
                          className="transition-transform hover:scale-110 disabled:opacity-50"
                          title={blog.featured ? "Remove from featured" : "Mark as featured"}
                        >
                          <Star
                            size={18}
                            className={blog.featured ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                          />
                        </button>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4">
                        <p className="text-xs text-gray-500">
                          {new Date(blog.createdAt).toLocaleDateString("en-PK", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{blog.readTime}</p>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/admin/blogs/${blog._id}/edit`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </Link>
                          <button
                            onClick={() => handleDelete(blog._id, blog.title)}
                            disabled={deletingId === blog._id}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === blog._id ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ───────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                <p className="text-xs text-gray-500">
                  Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} posts
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce((acc, p, i, arr) => {
                      if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === "..." ? (
                        <span key={`d${i}`} className="px-1.5 text-gray-400 text-sm">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                            p === page ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
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
          </>
        )}
      </div>

      {/* ── Empty state for fresh start ──────────────────────────────── */}
      {!loading && summary.total === 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-8 text-center">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={24} className="text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Start your blog</h3>
          <p className="text-sm text-gray-500 mb-5">Create your first blog post to engage your audience</p>
          <Link
            href="/admin/blogs/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={16} />
            Write First Post
          </Link>
        </div>
      )}
    </div>
  );
}
