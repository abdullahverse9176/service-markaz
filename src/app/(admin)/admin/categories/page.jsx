"use client";

import { useState, useEffect, useCallback } from "react";
import * as Icons from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { ICON_MAP } from "@/data/assets";

const CAT_LIMIT = 12;

const ICON_OPTIONS = Object.keys(ICON_MAP);

const COLOR_OPTIONS = [
  { name: "Yellow", bg: "bg-yellow-100", text: "text-yellow-700" },
  { name: "Blue", bg: "bg-blue-100", text: "text-blue-700" },
  { name: "Cyan", bg: "bg-cyan-100", text: "text-cyan-700" },
  { name: "Orange", bg: "bg-orange-100", text: "text-orange-700" },
  { name: "Green", bg: "bg-green-100", text: "text-green-700" },
  { name: "Purple", bg: "bg-purple-100", text: "text-purple-700" },
  { name: "Pink", bg: "bg-pink-100", text: "text-pink-700" },
  { name: "Red", bg: "bg-red-100", text: "text-red-700" },
];
const BAR_OPTIONS = ["bg-yellow-400", "bg-blue-400", "bg-cyan-400", "bg-orange-400", "bg-green-400", "bg-purple-400", "bg-pink-400", "bg-red-400"];

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function CategoriesPage() {
  const { token } = useAuth();

  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, inactive: 0, businesses: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "Zap",
    color: "bg-yellow-100 text-yellow-700",
    bar: "bg-yellow-400",
  });

  const debouncedSearch = useDebounce(search, 400);

  const fetchCategories = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: CAT_LIMIT });
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch(`/api/admin/categories?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setCategories(json.data.categories);
        setSummary(json.data.summary);
        setTotal(json.data.total);
        setTotalPages(json.data.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [token, page, debouncedSearch]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = editingId ? "PATCH" : "POST";
      const body = editingId
        ? { categoryId: editingId, ...formData }
        : formData;

      const res = await fetch("/api/admin/categories", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (json.success) {
        await fetchCategories();
        setFormData({ name: "", description: "", icon: "Zap", color: "bg-yellow-100 text-yellow-700", bar: "bg-yellow-400" });
        setShowForm(false);
        setEditingId(null);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cat) => {
    setFormData({
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      color: cat.color,
      bar: cat.bar,
    });
    setEditingId(cat._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        await fetchCategories();
      } else {
        alert(json.message || "Failed to delete category");
      }
    } catch (err) {
      alert("Error deleting category");
    }
  };

  const getIconComponent = (iconName) => {
    const Icon = Icons[iconName];
    return Icon ? <Icon size={20} /> : null;
  };

  const totalBusinesses = summary.businesses;
  const maxBusinesses = Math.max(...categories.map(c => c.businessCount), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Categories</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage all service categories on the platform.</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ name: "", description: "", icon: "Zap", color: "bg-yellow-100 text-yellow-700", bar: "bg-yellow-400" });
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-sm"
        >
          + New Category
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-2xl px-5 py-4 border border-white">
          <p className="text-2xl font-bold text-blue-600">{summary.total}</p>
          <p className="text-sm text-gray-600 mt-0.5">Total Categories</p>
        </div>
        <div className="bg-green-50 rounded-2xl px-5 py-4 border border-white">
          <p className="text-2xl font-bold text-green-600">{summary.active}</p>
          <p className="text-sm text-gray-600 mt-0.5">Active</p>
        </div>
        <div className="bg-yellow-50 rounded-2xl px-5 py-4 border border-white">
          <p className="text-2xl font-bold text-yellow-600">{summary.businesses}</p>
          <p className="text-sm text-gray-600 mt-0.5">Total Businesses</p>
        </div>
        <div className="bg-pink-50 rounded-2xl px-5 py-4 border border-white">
          <p className="text-2xl font-bold text-pink-600">{summary.inactive}</p>
          <p className="text-sm text-gray-600 mt-0.5">Inactive</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories…"
          className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm"
        />
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{editingId ? "Edit Category" : "Create New Category"}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Category name"
                required
                className="px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm"
              />
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm"
              >
                {ICON_OPTIONS.map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>

            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description (optional)"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm"
              rows="2"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">Icon Color</label>
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm"
                >
                  {COLOR_OPTIONS.map((col) => (
                    <option key={col.name} value={`${col.bg} ${col.text}`}>{col.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">Progress Bar</label>
                <select
                  value={formData.bar}
                  onChange={(e) => setFormData({ ...formData, bar: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm"
                >
                  {BAR_OPTIONS.map((bar) => (
                    <option key={bar} value={bar}>{bar}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition disabled:opacity-50"
              >
                {submitting ? "Saving..." : editingId ? "Update Category" : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            <p className="text-sm">Loading categories…</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            <p className="text-sm">No categories found.</p>
          </div>
        ) : (
          categories.map((cat) => {
            const Icon = Icons[cat.icon];
            const pct = maxBusinesses > 0 ? Math.round((cat.businessCount / maxBusinesses) * 100) : 0;
            return (
              <div key={cat._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl ${cat.color} flex items-center justify-center`}>
                    {Icon && <Icon size={20} />}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit"
                    >
                      <Icons.Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Icons.Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{cat.name}</h3>
                {cat.description && <p className="text-xs text-gray-500 mb-2">{cat.description}</p>}
                <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                  <Icons.Building2 size={13} />
                  <span>{cat.businessCount} businesses</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${cat.bar} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">{Math.round((cat.businessCount / (totalBusinesses || 1)) * 100)}% of total listings</p>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-6 py-4">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {total === 0 ? 0 : Math.min((page - 1) * CAT_LIMIT + 1, total)}–{Math.min(page * CAT_LIMIT, total)}
            </span>{" "}
            of <span className="font-semibold text-gray-700">{total}</span> categories
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <Icons.ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => n >= page - 2 && n <= page + 2)
              .map((n) => (
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
              <Icons.ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
