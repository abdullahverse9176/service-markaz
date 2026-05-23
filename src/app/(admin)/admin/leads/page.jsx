"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, Phone, MessageCircle, Mail, CheckCircle2,
  XCircle, AlertTriangle, Clock, TrendingUp, Search,
  ChevronLeft, ChevronRight, RefreshCw, Building2,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

// ── Shared config ─────────────────────────────────────────────────────────────
const SOURCE_CFG = {
  call:     { label: "Call",      icon: Phone,         cls: "bg-blue-100 text-blue-700" },
  whatsapp: { label: "WhatsApp",  icon: MessageCircle, cls: "bg-green-100 text-green-700" },
  form:     { label: "Form",      icon: Mail,          cls: "bg-purple-100 text-purple-700" },
};

const STATUS_CFG = {
  pending:           { label: "Pending",        icon: Clock,          cls: "bg-yellow-100 text-yellow-700" },
  awaiting_response: { label: "Awaiting",       icon: Clock,          cls: "bg-orange-100 text-orange-700" },
  confirmed:         { label: "Confirmed",      icon: CheckCircle2,   cls: "bg-green-100 text-green-700" },
  rejected:          { label: "No Deal",        icon: XCircle,        cls: "bg-red-100 text-red-700" },
  disputed:          { label: "Disputed",       icon: AlertTriangle,  cls: "bg-amber-100 text-amber-700" },
};

function Badge({ config }) {
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.cls}`}>
      <Icon size={11} />
      {config.label}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, color, sub }) {
  const colors = {
    blue:   { bg: "bg-blue-50",   text: "text-blue-600",   ring: "ring-blue-100" },
    green:  { bg: "bg-green-50",  text: "text-green-600",  ring: "ring-green-100" },
    amber:  { bg: "bg-amber-50",  text: "text-amber-600",  ring: "ring-amber-100" },
    red:    { bg: "bg-red-50",    text: "text-red-600",    ring: "ring-red-100" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", ring: "ring-purple-100" },
  };
  const c = colors[color];
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className={`w-10 h-10 rounded-xl ${c.bg} ring-1 ${c.ring} flex items-center justify-center mb-3`}>
        <Icon size={18} className={c.text} />
      </div>
      <p className="text-2xl font-bold text-gray-800">{value ?? "—"}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />;
}

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const LIMIT = 15;

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminLeadsPage() {
  const { token } = useAuth();

  const [view, setView]           = useState("list");      // "list" | "per_provider"
  const [leads, setLeads]         = useState([]);
  const [providers, setProviders] = useState([]);
  const [summary, setSummary]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [total, setTotal]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]           = useState(1);

  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  const debouncedSearch = useDebounce(search, 400);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT, view });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter) params.set("status", statusFilter);
      if (sourceFilter) params.set("source", sourceFilter);

      const res = await fetch(`/api/admin/leads?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.success) return;

      setSummary(json.data.summary);
      setTotal(json.data.total);
      setTotalPages(json.data.totalPages);

      if (view === "per_provider") {
        setProviders(json.data.providers ?? []);
      } else {
        setLeads(json.data.leads ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [token, page, view, debouncedSearch, statusFilter, sourceFilter]);

  useEffect(() => { setPage(1); }, [view, debouncedSearch, statusFilter, sourceFilter]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Lead Tracking</h2>
          <p className="text-sm text-gray-500 mt-0.5">Monitor all customer-provider leads across the platform</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200 transition disabled:opacity-40"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Summary Stats */}
      {loading && !summary ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : summary && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Total Leads"      value={summary.totalLeads}     icon={Users}       color="blue"   />
          <StatCard label="Confirmed Deals"  value={summary.totalConfirmed} icon={CheckCircle2} color="green"  />
          <StatCard label="Pending"          value={summary.totalPending}   icon={Clock}       color="amber"  />
          <StatCard label="Disputed"         value={summary.totalDisputed}  icon={AlertTriangle} color="red"  />
          <StatCard label="Conversion Rate"  value={`${summary.conversionRate}%`} icon={TrendingUp} color="purple" sub="leads → confirmed deals" />
        </div>
      )}

      {/* View Toggle + Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* View switcher */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 self-start">
            {[
              { id: "list",         label: "All Leads" },
              { id: "per_provider", label: "By Provider" },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={`px-4 py-2 text-sm font-medium transition ${
                  view === v.id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={view === "per_provider" ? "Search provider…" : "Search customer or provider…"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Filters (list view only) */}
          {view === "list" && (
            <>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="awaiting_response">Awaiting</option>
                <option value="confirmed">Confirmed</option>
                <option value="rejected">No Deal</option>
                <option value="disputed">Disputed</option>
              </select>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">All Sources</option>
                <option value="call">Call</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="form">Form</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : view === "per_provider" ? (
          /* ── Per-provider table ── */
          providers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">No leads recorded yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {["Provider", "Category / City", "Total Leads", "Confirmed", "Pending", "Disputed", "Conversion", "Last Lead"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {providers.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.providerName}</td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{p.providerCategory}</p>
                      <p className="text-xs text-gray-400">{p.providerCity}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-800">{p.totalLeads}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-green-700">{p.confirmed}</span>
                    </td>
                    <td className="px-4 py-3 text-yellow-700">{p.pending}</td>
                    <td className="px-4 py-3 text-amber-700">{p.disputed}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${Math.min(p.conversionRate, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-700">{p.conversionRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(p.lastLeadAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          /* ── Lead list table ── */
          leads.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">No leads found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {["Customer", "Provider", "Source", "Status", "Date"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{lead.customerName}</p>
                      <p className="text-xs text-gray-400">{lead.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{lead.businessName}</p>
                      <p className="text-xs text-gray-400">{lead.businessCategory} · {lead.businessCity}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge config={SOURCE_CFG[lead.source] ?? { label: lead.source, icon: Phone, cls: "bg-gray-100 text-gray-600" }} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge config={STATUS_CFG[lead.status] ?? { label: lead.status, icon: Clock, cls: "bg-gray-100 text-gray-600" }} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(lead.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages} · {total} total
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200 disabled:opacity-40 transition"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200 disabled:opacity-40 transition"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
