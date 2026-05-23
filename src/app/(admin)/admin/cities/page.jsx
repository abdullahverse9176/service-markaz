"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MapPin, Loader2, Edit, Trash2, ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";

const STATUS_STYLE = {
  active:  "bg-green-50 text-green-700 ring-1 ring-green-200",
  blocked: "bg-red-50 text-red-600 ring-1 ring-red-200",
};

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function CitiesPage() {
  const { token } = useAuth();

  const [cities, setCities] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, blocked: 0, businesses: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
  });

  const debouncedSearch = useDebounce(search, 400);

  const fetchCities = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: 1, limit: 100 });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/cities?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setCities(json.data.cities);
        setSummary(json.data.summary);
      }
    } finally {
      setLoading(false);
    }
  }, [token, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "service-markaz/cities");
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      const json = await res.json();
      if (json.success) {
        setFormData((prev) => ({ ...prev, image: json.data.url }));
      } else {
        alert(json.message || "Image upload failed");
      }
    } catch {
      alert("Image upload failed");
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = editingId ? "PATCH" : "POST";
      const body = editingId
        ? { cityId: editingId, ...formData }
        : formData;

      const res = await fetch("/api/admin/cities", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (json.success) {
        await fetchCities();
        setFormData({ name: "", description: "", image: "" });
        setShowForm(false);
        setEditingId(null);
      } else {
        alert(json.message || "Failed to save city");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (city) => {
    setFormData({
      name: city.name,
      description: city.description,
      image: city.image || "",
    });
    setEditingId(city._id);
    setShowForm(true);
  };

  const handleStatusChange = async (cityId, newStatus) => {
    setActionLoading(cityId);
    try {
      const res = await fetch("/api/admin/cities", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cityId, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setCities((prev) =>
          prev.map((c) => (c._id === cityId ? { ...c, status: newStatus } : c))
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this city?")) return;
    try {
      const res = await fetch(`/api/admin/cities?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        await fetchCities();
      } else {
        alert(json.message || "Failed to delete city");
      }
    } catch (err) {
      alert("Error deleting city");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Cities</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage all service cities on the platform.</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ name: "", description: "", image: "" });
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-sm"
        >
          + New City
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-2xl px-5 py-4 border border-white">
          <p className="text-2xl font-bold text-blue-600">{summary.total}</p>
          <p className="text-sm text-gray-600 mt-0.5">Total Cities</p>
        </div>
        <div className="bg-green-50 rounded-2xl px-5 py-4 border border-white">
          <p className="text-2xl font-bold text-green-600">{summary.active}</p>
          <p className="text-sm text-gray-600 mt-0.5">Active</p>
        </div>
        <div className="bg-yellow-50 rounded-2xl px-5 py-4 border border-white">
          <p className="text-2xl font-bold text-yellow-600">{summary.businesses}</p>
          <p className="text-sm text-gray-600 mt-0.5">Total Businesses</p>
        </div>
        <div className="bg-red-50 rounded-2xl px-5 py-4 border border-white">
          <p className="text-2xl font-bold text-red-600">{summary.blocked}</p>
          <p className="text-sm text-gray-600 mt-0.5">Blocked</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search cities…"
          className="flex-1 min-w-[200px] px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm bg-gray-50"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{editingId ? "Edit City" : "Create New City"}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="City name"
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm"
            />

            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description (optional)"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm"
              rows="2"
            />

            {/* City Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City Image (optional)</label>
              {formData.image ? (
                <div className="relative w-40 h-24 rounded-xl overflow-hidden border border-gray-200">
                  <Image src={formData.image} alt="City" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                    className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow text-gray-500 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={imageUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition disabled:opacity-50"
                >
                  {imageUploading ? (
                    <><Loader2 size={15} className="animate-spin" /> Uploading…</>
                  ) : (
                    <><ImagePlus size={15} /> Upload Image</>
                  )}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
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
                disabled={submitting || imageUploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition disabled:opacity-50"
              >
                {submitting ? "Saving..." : editingId ? "Update City" : "Create City"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cities Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 font-medium">
                <th className="px-6 py-3 text-left">City</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Businesses</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                    <p className="text-sm">Loading cities…</p>
                  </td>
                </tr>
              ) : cities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No cities found.
                  </td>
                </tr>
              ) : (
                cities.map((city) => (
                  <tr key={city._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                          <MapPin size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{city.name}</p>
                          <p className="text-xs text-gray-400">{city.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 text-xs">
                      {city.description || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold text-gray-800">{city.businessCount}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      {actionLoading === city._id ? (
                        <Loader2 size={15} className="animate-spin text-gray-400" />
                      ) : (
                        <select
                          value={city.status}
                          onChange={(e) => handleStatusChange(city._id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border outline-none cursor-pointer capitalize ${
                            city.status === "active"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-600 border-red-200"
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="blocked">Blocked</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs">
                      {new Date(city.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(city)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(city._id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
