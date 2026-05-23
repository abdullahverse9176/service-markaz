"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Trophy, Users, CheckCheck, Clock, Ban,
  ChevronLeft, ChevronRight, Crown, RefreshCw,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

// ─── Helpers ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

function StatusBadge({ status }) {
  const styles = {
    pending:  "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    approved: "bg-green-50 text-green-700 ring-1 ring-green-200",
    revoked:  "bg-red-50 text-red-600 ring-1 ring-red-200",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? styles.pending}`}>
      {status}
    </span>
  );
}

// ─── Leaderboard Tab ─────────────────────────────────────────────────────────

function LeaderboardTab({ token }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchLeaders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await fetch("/api/admin/referrals?view=leaderboard", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (json.success) setLeaders(json.data);
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchLeaders(); }, [fetchLeaders]);

  const approveLifetime = async (referralId, providerName) => {
    if (!confirm(`Grant LIFETIME subscription to ${providerName}?`)) return;
    setActionLoading(referralId);
    await fetch(`/api/admin/referrals/${referralId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve_lifetime", note: "Admin approved lifetime via leaderboard" }),
    });
    setActionLoading(null);
    fetchLeaders();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leaders.map((l, i) => (
        <div key={l.userId} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
          <span className="text-lg font-bold text-gray-400 w-6 text-center">#{i + 1}</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 truncate">{l.name}</p>
            <p className="text-xs text-gray-400 truncate">{l.email}</p>
            {l.badges?.includes("featured") && (
              <span className="text-xs text-yellow-600 font-medium">Featured</span>
            )}
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-800">{l.approvedCount}</p>
            <p className="text-xs text-gray-400">approved</p>
          </div>
          {l.lifetimeEligible && (
            <button
              disabled={!!actionLoading}
              onClick={() => approveLifetime(l.userId, l.name)}
              className="shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Crown size={12} /> Grant Lifetime
            </button>
          )}
        </div>
      ))}
      {leaders.length === 0 && (
        <p className="text-center text-gray-400 py-8">No approved referrals yet.</p>
      )}
    </div>
  );
}

// ─── Referrals List Tab ───────────────────────────────────────────────────────

function ReferralsTab({ token }) {
  const [referrals, setReferrals] = useState([]);
  const [summary, setSummary] = useState({ pending: 0, approved: 0, revoked: 0 });
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchReferrals = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams({ page, limit: PAGE_SIZE });
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/referrals?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (json.success) {
      setReferrals(json.data.referrals);
      setSummary(json.data.summary);
      setTotal(json.data.total);
      setPages(json.data.pages);
    }
    setLoading(false);
  }, [token, page, statusFilter]);

  useEffect(() => { setPage(1); }, [statusFilter]);
  useEffect(() => { fetchReferrals(); }, [fetchReferrals]);

  const doAction = async (id, action, reason = "") => {
    setActionLoading(id);
    await fetch(`/api/admin/referrals/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason }),
    });
    setActionLoading(null);
    fetchReferrals();
  };

  return (
    <div className="space-y-4">
      {/* Summary chips */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pending",  value: summary.pending,  color: "text-amber-600",  icon: Clock },
          { label: "Approved", value: summary.approved, color: "text-green-600",  icon: CheckCheck },
          { label: "Revoked",  value: summary.revoked,  color: "text-red-600",    icon: Ban },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
              <Icon size={12} /> {label}
            </p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        {["", "pending", "approved", "revoked"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === s
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <button
          onClick={fetchReferrals}
          className="ml-auto p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={15} className="text-gray-500" />
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {referrals.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No referrals found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Referrer</th>
                  <th className="px-4 py-3 text-left">Referee</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {referrals.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{r.referrer?.name ?? "—"}</p>
                      <p className="text-xs text-gray-400">{r.referrer?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{r.referee?.name ?? "—"}</p>
                      <p className="text-xs text-gray-400">{r.referee?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString("en-PK", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {r.status === "pending" && (
                          <button
                            disabled={actionLoading === r._id}
                            onClick={() => doAction(r._id, "approve")}
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}
                        {r.status !== "revoked" && (
                          <button
                            disabled={actionLoading === r._id}
                            onClick={() => {
                              const reason = prompt("Reason for revoking?") ?? "Admin revoked";
                              doAction(r._id, "revoke", reason);
                            }}
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{total} total referrals</p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-600">{page} / {pages}</span>
            <button
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminReferralsPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("referrals");

  useEffect(() => {
    if (user && user.role !== "admin") router.push("/");
  }, [user, router]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-xl">
          <Users size={22} className="text-purple-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Referral Management</h1>
          <p className="text-sm text-gray-500">Review, approve, and manage all referrals</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: "referrals",    label: "All Referrals", icon: Users },
          { key: "leaderboard",  label: "Leaderboard",   icon: Trophy },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === "referrals"   && <ReferralsTab    token={token} />}
      {tab === "leaderboard" && <LeaderboardTab  token={token} />}
    </div>
  );
}
