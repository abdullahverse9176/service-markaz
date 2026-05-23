"use client";

import { useState, useEffect } from "react";
import { Trophy, Star, Crown, Medal, Users } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import ProtectedRoute from "@/app/components/ui/ProtectedRoute";

function RankIcon({ rank }) {
  if (rank === 1) return <Crown  size={20} className="text-yellow-500" />;
  if (rank === 2) return <Medal  size={20} className="text-slate-400" />;
  if (rank === 3) return <Medal  size={20} className="text-amber-600" />;
  return <span className="text-sm font-bold text-gray-400 w-5 text-center">#{rank}</span>;
}

function LeaderboardContent() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/referrals/leaderboard")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setLeaders(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-yellow-100 rounded-full mb-4">
          <Trophy size={26} className="text-yellow-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Top Referrers</h1>
        <p className="text-sm text-gray-500 mt-1">Service Markaz&apos;s most active community builders</p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-yellow-400 border-t-transparent" />
        </div>
      )}

      {!loading && leaders.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Users size={40} className="mx-auto mb-3 opacity-40" />
          <p>No referrals recorded yet. Be the first!</p>
        </div>
      )}

      {!loading && leaders.length > 0 && (
        <div className="space-y-3">
          {leaders.map((leader, index) => {
            const rank = index + 1;
            return (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                  rank === 1
                    ? "bg-yellow-50 border-yellow-200"
                    : rank === 2
                    ? "bg-slate-50 border-slate-200"
                    : rank === 3
                    ? "bg-amber-50 border-amber-200"
                    : "bg-white border-gray-100"
                }`}
              >
                <div className="flex items-center justify-center w-8">
                  <RankIcon rank={rank} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{leader.name}</p>
                  {leader.badges?.includes("featured") && (
                    <span className="inline-flex items-center gap-1 text-xs text-yellow-700 font-medium mt-0.5">
                      <Star size={11} className="fill-yellow-500 text-yellow-500" /> Featured Provider
                    </span>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xl font-bold text-gray-800">{leader.approvedCount}</p>
                  <p className="text-xs text-gray-400">referrals</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-center text-xs text-gray-400 mt-8">
        Updated in real-time. Only approved referrals are counted.
      </p>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <ProtectedRoute requiredRole={["provider", "admin"]}>
      <LeaderboardContent />
    </ProtectedRoute>
  );
}
