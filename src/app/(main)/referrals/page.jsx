"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Gift, Copy, CheckCheck, Share2, Users, Clock, Trophy, Star,
  ChevronRight, Zap, Crown, Infinity, ExternalLink,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import ProtectedRoute from "@/app/components/ui/ProtectedRoute";
import toast from "react-hot-toast";

// ─── Helpers ────────────────────────────────────────────────────────────────

function MilestoneIcon({ reward }) {
  if (reward === "1_month_sub")     return <Zap size={18} className="text-blue-500" />;
  if (reward === "featured_badge")  return <Star size={18} className="text-yellow-500" />;
  if (reward === "6_month_sub")     return <Trophy size={18} className="text-purple-500" />;
  if (reward === "lifetime_eligible") return <Infinity size={18} className="text-emerald-500" />;
  return <Gift size={18} className="text-gray-400" />;
}

function MilestoneLabel({ reward }) {
  const map = {
    "1_month_sub":      "1 Month Free Subscription",
    "featured_badge":   "Featured Badge on Profile",
    "6_month_sub":      "6 Months Free Subscription",
    "lifetime_eligible":"Lifetime Free (Admin Approval)",
  };
  return map[reward] ?? reward;
}

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

// ─── Sub-components ──────────────────────────────────────────────────────────

function InviteCard({ referralCode, inviteLink }) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      toast.success("Invite link copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const whatsappShare = () => {
    const msg = encodeURIComponent(
      `Join me on Service Markaz — Pakistan's local services marketplace! Use my referral link to sign up and we both earn rewards:\n${inviteLink}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-500/20">
      {/* Decorative Background Icon */}
      <div className="absolute -top-6 -right-6 p-8 opacity-10 pointer-events-none">
        <Gift size={160} className="transform rotate-12" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-sm">
            <Gift size={24} className="text-white" />
          </div>
          <h2 className="font-bold text-xl sm:text-2xl">Your Invite Link</h2>
        </div>

        <p className="text-purple-100 text-sm sm:text-base leading-relaxed mb-6 max-w-sm">
          Share this link with other service providers. Earn rewards when they go live!
        </p>

        {/* Code display */}
        <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-4 flex flex-col items-center sm:items-start">
          <p className="text-xs font-medium text-purple-200 uppercase tracking-widest mb-1">Your Referral Code</p>
          <p className="font-mono text-3xl sm:text-4xl font-bold tracking-widest text-white">{referralCode}</p>
        </div>

        {/* Link + copy */}
        <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-2 pl-4 mb-6 flex items-center justify-between gap-3">
          <p className="text-sm truncate flex-1 text-purple-100 font-medium">{inviteLink}</p>
          <button
            onClick={copyLink}
            className="shrink-0 p-2.5 rounded-xl bg-white text-purple-600 hover:bg-purple-50 transition-all active:scale-95 shadow-sm"
            aria-label="Copy link"
          >
            {copied ? <CheckCheck size={18} /> : <Copy size={18} />}
          </button>
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <button
            onClick={copyLink}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all active:scale-95 text-sm font-semibold backdrop-blur-sm"
          >
            {copied ? <CheckCheck size={18} /> : <Copy size={18} />}
            Copy Link
          </button>
          <button
            onClick={whatsappShare}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary active:scale-95 text-sm font-semibold"
          >
            <Share2 size={18} />
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

function StatsRow({ approvedCount, pendingCount }) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] p-4 sm:p-5 flex flex-col items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <p className="text-2xl sm:text-3xl font-black text-gray-800 relative z-10">{approvedCount + pendingCount}</p>
        <p className="text-[10px] sm:text-xs font-semibold text-gray-500 mt-1 flex items-center gap-1.5 uppercase tracking-wide relative z-10">
          <Users size={14} className="text-blue-500" /> Total
        </p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] p-4 sm:p-5 flex flex-col items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <p className="text-2xl sm:text-3xl font-black text-amber-500 relative z-10">{pendingCount}</p>
        <p className="text-[10px] sm:text-xs font-semibold text-gray-500 mt-1 flex items-center gap-1.5 uppercase tracking-wide relative z-10">
          <Clock size={14} className="text-amber-500" /> Pending
        </p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] p-4 sm:p-5 flex flex-col items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <p className="text-2xl sm:text-3xl font-black text-green-600 relative z-10">{approvedCount}</p>
        <p className="text-[10px] sm:text-xs font-semibold text-gray-500 mt-1 flex items-center gap-1.5 uppercase tracking-wide relative z-10">
          <CheckCheck size={14} className="text-green-500" /> Approved
        </p>
      </div>
    </div>
  );
}

function MilestoneProgress({ progress }) {
  const { approvedCount, nextMilestone, progressPct, milestones } = progress;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] p-5 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-900 text-lg sm:text-xl flex items-center gap-2.5">
          <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
            <Trophy size={20} />
          </div>
          Reward Milestones
        </h3>
      </div>

      {/* Milestones list */}
      <div className="space-y-3 mb-6">
        {milestones.map((m) => (
          <div
            key={m.reward}
            className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-2xl border-2 transition-all ${
              m.reached
                ? "bg-green-50/50 border-green-500/20 shadow-sm"
                : "bg-gray-50/50 border-transparent hover:border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <div className={`p-2.5 rounded-xl shrink-0 ${m.reached ? "bg-white shadow-sm" : "bg-gray-200/80"}`}>
                <MilestoneIcon reward={m.reward} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm sm:text-base font-bold ${m.reached ? "text-green-900" : "text-gray-700"} truncate sm:whitespace-normal`}>
                  <MilestoneLabel reward={m.reward} />
                </p>
                <p className={`text-xs mt-0.5 ${m.reached ? "text-green-600 font-medium" : "text-gray-500"}`}>
                  {m.count} referral{m.count > 1 ? "s" : ""} required
                </p>
              </div>
            </div>
            {m.reached && (
              <div className="flex justify-start sm:justify-end pl-[52px] sm:pl-0 shrink-0 mt-1 sm:mt-0">
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-green-700 bg-green-200/50 px-2.5 py-1 sm:py-1.5 rounded-full uppercase tracking-wide">
                  <CheckCheck size={14} /> Unlocked
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress toward next milestone */}
      {nextMilestone ? (
        <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 py-1 mb-4">
            <div className="flex flex-col border-b border-gray-200/60 sm:border-0 pb-3 sm:pb-0">
              <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Current Progress</p>
              <p className="text-base sm:text-sm font-black text-gray-900">{approvedCount} <span className="text-gray-500 font-medium text-sm">approved</span></p>
            </div>
            <div className="flex flex-col sm:text-right">
              <p className="text-[10px] sm:text-xs font-bold text-purple-600 uppercase tracking-widest mb-1.5">Next Goal</p>
              <p className="text-sm font-black text-gray-900 leading-tight">{nextMilestone.count} <span className="text-gray-500 font-medium block sm:inline mt-0.5 sm:mt-0">({nextMilestone.description})</span></p>
            </div>
          </div>
          <div className="w-full bg-gray-200/80 rounded-full h-3 sm:h-4 overflow-hidden mt-1 shadow-inner">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${progressPct}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
          <p className="text-[11px] sm:text-xs font-medium text-gray-500 mt-3 text-center">
            You're {progressPct}% there! Keep inviting to unlock your next reward.
          </p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-4 sm:p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl text-emerald-800 font-semibold shadow-inner">
          <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
            <Crown size={24} />
          </div>
          <span className="text-center sm:text-left">All milestones reached! You're a local legend.</span>
        </div>
      )}
    </div>
  );
}

function RewardsStatus({ subscription, badges, lifetimeEligible }) {
  const hasActiveSub = subscription?.expiresAt && new Date(subscription.expiresAt) > new Date();
  const daysLeft = hasActiveSub
    ? Math.ceil((new Date(subscription.expiresAt) - new Date()) / 86400000)
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] p-5 sm:p-6">
      <h3 className="font-bold text-gray-900 text-lg sm:text-xl flex items-center gap-2.5 mb-5">
        <div className="p-2 bg-yellow-100 rounded-xl text-yellow-600">
          <Star size={20} />
        </div>
        Your Active Rewards
      </h3>

      <div className="space-y-3 sm:space-y-4">
        {/* Subscription */}
        <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100/80 transition-colors border border-gray-100 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Zap size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Subscription</p>
              <p className="text-xs font-medium text-gray-500 capitalize">{subscription?.plan ?? "free"} plan</p>
            </div>
          </div>
          {subscription?.plan === "lifetime" ? (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Infinity size={14} /> Lifetime
            </span>
          ) : hasActiveSub ? (
            <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1.5 rounded-full ring-1 ring-blue-500/20">
              {daysLeft} days left
            </span>
          ) : (
            <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-3 py-1.5 rounded-full">Inactive</span>
          )}
        </div>

        {/* Badges */}
        {badges?.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200/60 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-200/50 text-yellow-700 rounded-xl">
                <Star size={18} className="fill-current" />
              </div>
              <div>
                <p className="text-sm font-bold text-yellow-900">Profile Badges</p>
                <p className="text-xs font-medium text-yellow-700">{badges.join(", ")}</p>
              </div>
            </div>
          </div>
        )}

        {/* Lifetime eligible */}
        {lifetimeEligible && subscription?.plan !== "lifetime" && (
          <div className="flex items-start sm:items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-2xl">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl shrink-0 mt-0.5 sm:mt-0">
              <Crown size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900">Lifetime Status Eligibility</p>
              <p className="text-xs font-medium text-emerald-700 mt-0.5">You're eligible for lifetime free — waiting for admin approval.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReferralTable({ referrals }) {
  if (!referrals?.length) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] p-10 sm:p-12 text-center flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-indigo-50/80 rounded-3xl flex items-center justify-center mb-5 shadow-sm rotate-3 hover:rotate-0 transition-transform">
          <Users size={36} className="text-indigo-500" />
        </div>
        <h3 className="text-gray-900 font-black text-xl sm:text-2xl mb-2">No referrals yet</h3>
        <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto leading-relaxed">Share your invite link above with fellow service providers to start earning exclusive rewards!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-gray-100/80 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-3">
          <div className="p-2 bg-indigo-100/80 rounded-xl text-indigo-600 shadow-sm border border-indigo-200/50">
            <Users size={20} />
          </div>
          Recent Referrals
        </h3>
      </div>
      <div className="divide-y divide-gray-50/80">
        {referrals.map((r) => (
          <div key={r._id} className="px-5 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 hover:bg-gray-50/80 transition-colors group">
            <div className="min-w-0 flex items-center gap-3.5 sm:gap-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center shrink-0 border border-gray-200/60 shadow-sm group-hover:border-indigo-200 group-hover:from-indigo-50 group-hover:to-white transition-all duration-300">
                <span className="text-gray-500 group-hover:text-indigo-600 font-bold text-sm sm:text-base uppercase transition-colors">
                  {(r.referee?.name || "U")[0]}
                </span>
              </div>
              <div className="min-w-0 flex-1 py-0.5">
                <p className="text-[15px] sm:text-base font-bold text-gray-900 truncate tracking-tight">{r.referee?.name ?? "Unknown User"}</p>
                <p className="text-[13px] font-medium text-gray-500 truncate mt-0.5">{r.referee?.email}</p>
              </div>
            </div>
            
            {/* Mobile: Align date and badge under the name via left padding to clear the avatar */}
            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto pl-[58px] sm:pl-0 mt-1.5 sm:mt-0">
              <p className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest sm:mr-5">
                {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }) : ""}
              </p>
              <div className="shrink-0 origin-right transition-transform">
                <StatusBadge status={r.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

function ReferralDashboardContent() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch("/api/referrals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setData(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-purple-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm font-medium text-gray-500">Loading your rewards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="p-5 sm:p-6 bg-red-50/80 border border-red-200 rounded-2xl text-red-700 text-sm flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center shrink-0">
            <Zap size={24} />
          </div>
          <div>
            <p className="font-bold mb-1">Oops! Something went wrong.</p>
            <p className="text-red-600/80">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { referralCode, inviteLink, referrals, progress, subscription, badges, lifetimeEligible } = data;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 sm:pb-8">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 space-y-6 sm:space-y-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <Star size={14} className="fill-current" /> Partners Program
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Refer & Earn</h1>
            <p className="text-base text-gray-500 mt-2 font-medium">Invite fellow service providers. Unlock premium benefits.</p>
          </div>
        </div>

        {/* Invite card */}
        <InviteCard referralCode={referralCode} inviteLink={inviteLink} />

        {/* Stats */}
        <StatsRow
          approvedCount={progress.approvedCount}
          pendingCount={progress.pendingCount}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Milestone progress */}
          <div className="col-span-1 md:col-span-2">
            <MilestoneProgress progress={progress} />
          </div>

          <div className="col-span-1 w-full">
            <RewardsStatus
              subscription={subscription}
              badges={badges}
              lifetimeEligible={lifetimeEligible}
            />
          </div>

          <div className="col-span-1 w-full h-full">
            <a
              href="/referrals/leaderboard"
              className="flex flex-col h-full items-center justify-center px-6 py-8 service-markaz-gradient rounded-2xl shadow-lg shadow-indigo-500/20 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="bg-white/20 p-4 rounded-full mb-4 backdrop-blur-md group-hover:scale-110 transition-transform">
                <Trophy size={32} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white mb-1">View Leaderboard</span>
              <span className="text-sm font-medium text-indigo-100 flex items-center gap-1 group-hover:gap-2 transition-all">
                See top earners <ChevronRight size={16} />
              </span>
            </a>
          </div>
        </div>

        {/* Referral table */}
        <ReferralTable referrals={referrals} />

      </div>
    </div>
  );
}

export default function ReferralDashboardPage() {
  return (
    <ProtectedRoute requiredRole={["provider", "admin"]}>
      <ReferralDashboardContent />
    </ProtectedRoute>
  );
}

