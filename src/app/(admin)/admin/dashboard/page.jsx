"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users, Building2, Clock, CheckCircle, Star,
  TrendingUp, MapPin, AlertCircle, Eye, UserCheck,
  ArrowUpRight, ArrowDownRight, RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

const colorMap = {
  blue:   { bg: "bg-blue-50",   icon: "text-blue-600",   ring: "ring-blue-100" },
  indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", ring: "ring-indigo-100" },
  amber:  { bg: "bg-amber-50",  icon: "text-amber-600",  ring: "ring-amber-100" },
  green:  { bg: "bg-green-50",  icon: "text-green-600",  ring: "ring-green-100" },
  yellow: { bg: "bg-yellow-50", icon: "text-yellow-600", ring: "ring-yellow-100" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600", ring: "ring-purple-100" },
};

function StatCard({ label, value, change, up, icon: Icon, color, urgent }) {
  const c = colorMap[color];
  return (
    <div className={`bg-white rounded-2xl p-5 border ${urgent ? "border-amber-200 ring-2 ring-amber-100" : "border-gray-100"} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl ${c.bg} ring-1 ${c.ring} flex items-center justify-center`}>
          <Icon size={20} className={c.icon} />
        </div>
        {up !== null && change && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ${up ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
            {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {change}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold text-gray-800">{value ?? "—"}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    active:  "bg-green-50 text-green-700 ring-1 ring-green-200",
    pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    blocked: "bg-red-50 text-red-600 ring-1 ring-red-200",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${map[status] || "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [actionLoading, setActionLoading] = useState({});

  const { data, isLoading: loading, refetch: fetchData } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load");
      return json.data;
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const handleBusinessStatus = async (businessId, status) => {
    setActionLoading((prev) => ({ ...prev, [businessId]: true }));
    try {
      await fetch("/api/admin/businesses", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ businessId, status }),
      });
      await fetchData();
    } finally {
      setActionLoading((prev) => ({ ...prev, [businessId]: false }));
    }
  };

  const stats = data
    ? [
        { label: "Total Users",       value: data.stats.totalUsers,      icon: Users,       color: "blue",   up: true  },
        { label: "Total Businesses",  value: data.stats.totalBusinesses, icon: Building2,   color: "indigo", up: true  },
        { label: "Pending Approvals", value: data.stats.pendingCount,    icon: Clock,       color: "amber",  up: false, urgent: data.stats.pendingCount > 0 },
        { label: "Active Providers",  value: data.stats.activeProviders, icon: CheckCircle, color: "green",  up: true  },
        { label: "Total Reviews",     value: data.stats.totalReviews,    icon: Star,        color: "yellow", up: true  },
        { label: "Cities Covered",    value: data.stats.citiesCovered,   icon: MapPin,      color: "purple", up: null  },
        { label: "Total Leads",       value: data.stats.totalLeads,      icon: TrendingUp,  color: "indigo", up: true  },
        { label: "Confirmed Deals",   value: data.stats.confirmedLeads,  icon: UserCheck,   color: "green",  up: true  },
      ]
    : [];

  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const byCategory = data?.byCategory ?? [];
  const byCity = data?.byCity ?? [];
  const maxCat  = Math.max(...byCategory.map((c) => c.count), 1);
  const maxCity = Math.max(...byCity.map((c) => c.count), 1);

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Overview</h2>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, Admin — here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200 transition disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <span className="text-xs text-gray-400 bg-white border border-gray-200 rounded-lg px-3 py-1.5 font-medium">
            {today}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-32" />)
          : stats.map((s) => <StatCard key={s.label} {...s} />)
        }
      </div>

      {/* Pending Approvals Banner */}
      {!loading && data?.stats.pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {data.stats.pendingCount} business listing{data.stats.pendingCount !== 1 ? "s are" : " is"} waiting for approval
              </p>
              <p className="text-xs text-amber-600 mt-0.5">Review and approve or reject each submission.</p>
            </div>
          </div>
          <Link
            href="/admin/businesses"
            className="flex-shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
          >
            Review Now
          </Link>
        </div>
      )}

      {/* Main 2-col */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left — Pending Businesses Table */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm">Pending Business Listings</h3>
            <Link href="/admin/businesses" className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
              </div>
            ) : data?.pendingBusinesses.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No pending listings — all caught up!</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 font-medium">
                    <th className="px-6 py-3 text-left">Business</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">City</th>
                    <th className="px-4 py-3 text-left">Submitted</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.pendingBusinesses.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {b.avatar}
                          </div>
                          <span className="font-medium text-gray-800 truncate max-w-[180px]">{b.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500">{b.category}</td>
                      <td className="px-4 py-3.5 text-gray-500">{b.city}</td>
                      <td className="px-4 py-3.5 text-gray-400 text-xs">{b.submitted}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            disabled={actionLoading[b.id]}
                            onClick={() => handleBusinessStatus(b.id, "active")}
                            className="text-xs bg-green-50 hover:bg-green-100 text-green-700 font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                          >
                            {actionLoading[b.id] ? "…" : "Approve"}
                          </button>
                          <button
                            disabled={actionLoading[b.id]}
                            onClick={() => handleBusinessStatus(b.id, "blocked")}
                            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                          >
                            {actionLoading[b.id] ? "…" : "Reject"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right — Activity Feed */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm">Recent Activity</h3>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {(data?.activity ?? []).length === 0 ? (
                <li className="py-10 text-center text-sm text-gray-400">No recent activity yet.</li>
              ) : (
                (data?.activity ?? []).map((a, i) => (
                  <li key={i} className="flex items-start gap-3 px-5 py-3.5">
                    <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${a.dot}`} />
                    <div>
                      <p className="text-sm text-gray-700 leading-snug">{a.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Second 2-col */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Users */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm">Recent Users</h3>
            <Link href="/admin/users" className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 font-medium">
                    <th className="px-6 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Joined</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(data?.recentUsers ?? []).map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{u.name}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${u.role === "provider" ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200" : "bg-gray-100 text-gray-600"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5"><StatusBadge status={u.status} /></td>
                      <td className="px-4 py-3.5 text-gray-400 text-xs">{u.joined}</td>
                      <td className="px-4 py-3.5">
                        <Link href="/admin/users" className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1">
                          <Eye size={12} /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Businesses by Category */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm">Businesses by Category</h3>
          </div>
          <div className="p-5 space-y-3.5">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-7" />)
              : byCategory.map((c) => {
                  const pct = Math.round((c.count / maxCat) * 100);
                  return (
                    <div key={c.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-gray-700 truncate max-w-[130px]">{c.name}</span>
                        <span className="text-xs font-semibold text-gray-600">{c.count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>
      </div>

      {/* Businesses by City */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 text-sm">Businesses by City</h3>
        </div>
        <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-32" />)
            : byCity.map((c) => {
                const pct = Math.round((c.count / maxCity) * 100);
                return (
                  <div key={c.city} className="flex flex-col items-center gap-2">
                    <div className="w-full bg-gray-100 rounded-xl overflow-hidden h-24 flex items-end">
                      <div className="w-full bg-blue-500 rounded-xl transition-all" style={{ height: `${pct}%` }} />
                    </div>
                    <p className="text-xs font-medium text-gray-600 text-center">{c.city}</p>
                    <p className="text-xs font-bold text-gray-800">{c.count}</p>
                  </div>
                );
              })
          }
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Approve Pending", icon: CheckCircle, href: "/admin/businesses", color: "bg-green-600 hover:bg-green-700" },
          { label: "Manage Users",    icon: UserCheck,   href: "/admin/users",      color: "bg-blue-600 hover:bg-blue-700" },
          { label: "View Reviews",    icon: Star,        href: "/admin/reviews",    color: "bg-yellow-500 hover:bg-yellow-600" },
          { label: "Site Analytics",  icon: TrendingUp,  href: "/admin/settings",   color: "bg-purple-600 hover:bg-purple-700" },
        ].map((qa) => {
          const Icon = qa.icon;
          return (
            <Link
              key={qa.label}
              href={qa.href}
              className={`flex items-center gap-3 ${qa.color} text-white font-semibold text-sm px-5 py-4 rounded-2xl transition shadow-sm`}
            >
              <Icon size={18} />
              {qa.label}
            </Link>
          );
        })}
      </div>

      {/* Lead Sources + Top Providers */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Lead Source Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm">Lead Sources (Platform-wide)</h3>
          </div>
          <div className="p-6 space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8" />)
            ) : (() => {
              const src = data?.leadSources ?? { call: 0, whatsapp: 0, form: 0 };
              const total = src.call + src.whatsapp + src.form;
              return [
                { key: "call",      label: "Call",          color: "bg-blue-500",   bg: "bg-blue-50",   text: "text-blue-700" },
                { key: "whatsapp",  label: "WhatsApp",      color: "bg-green-500",  bg: "bg-green-50",  text: "text-green-700" },
                { key: "form",      label: "Contact Form",  color: "bg-purple-500", bg: "bg-purple-50", text: "text-purple-700" },
              ].map(({ key, label, color, bg, text }) => {
                const count = src[key];
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={key} className="flex items-center gap-4">
                    <div className={`text-xs font-semibold px-2 py-1 rounded-lg ${bg} ${text} w-28 text-center flex-shrink-0`}>
                      {label}
                    </div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-bold text-gray-700 w-14 text-right">{count} <span className="font-normal text-gray-400">({pct}%)</span></span>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Top Providers by Conversion Rate */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm">Top Providers (Conversion Rate)</h3>
            <span className="text-xs text-gray-400">Min 5 leads</span>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
              </div>
            ) : !data?.topProviders?.length ? (
              <p className="text-sm text-gray-400 text-center py-10">Not enough lead data yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 font-medium">
                    <th className="px-5 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Provider</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-right">Leads</th>
                    <th className="px-4 py-3 text-right">Deals</th>
                    <th className="px-4 py-3 text-right">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(data?.topProviders ?? []).map((p, i) => (
                    <tr key={p.businessId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-xs font-bold text-gray-400">#{i + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 truncate max-w-[120px]">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.city}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{p.category}</td>
                      <td className="px-4 py-3 text-right text-xs font-semibold text-gray-700">{p.total}</td>
                      <td className="px-4 py-3 text-right text-xs font-semibold text-green-700">{p.confirmed}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.conversionRate >= 70 ? "bg-green-50 text-green-700" : p.conversionRate >= 40 ? "bg-yellow-50 text-yellow-700" : "bg-gray-100 text-gray-500"}`}>
                          {p.conversionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
