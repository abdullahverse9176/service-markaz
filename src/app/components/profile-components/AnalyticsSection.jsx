"use client";

import {
  Loader2,
  BarChart3,
  Eye,
  TrendingUp,
  Star,
  Phone,
  MessageCircle,
  Mail,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useBusinessAnalytics } from "@/app/hooks/useBusiness";

function StatCard({ label, value, sub, icon: Icon, bgClass, textClass }) {
  return (
    <div className={`rounded-xl p-3 sm:p-4 flex flex-col gap-0.5 sm:gap-1 ${bgClass}`}>
      <div className="flex items-center justify-between">
        <p className={`text-xl sm:text-2xl font-bold ${textClass}`}>{value}</p>
        <div className="p-1.5 sm:p-2 bg-white/50 rounded-lg">
          <Icon size={14} className={textClass} />
        </div>
      </div>
      <p className="text-[11px] sm:text-xs font-semibold text-gray-700 leading-tight">{label}</p>
      {sub && <p className="text-[10px] sm:text-[11px] text-gray-500 leading-tight">{sub}</p>}
    </div>
  );
}

function SourceBar({ label, value, total, icon: Icon, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className={`p-1.5 rounded-lg ${color.bg}`}>
        <Icon size={13} className={color.text} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between mb-1">
          <span className="text-xs font-medium text-gray-700">{label}</span>
          <span className="text-xs text-gray-500">{value} ({pct}%)</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${color.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsSection() {
  const { data, isLoading, isError } = useBusinessAnalytics();

  return (
    <div className="bg-white sm:shadow-sm sm:rounded-2xl p-4 sm:p-6 border-b sm:border-none border-gray-100">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-1.5 sm:p-2 bg-indigo-50 rounded-lg">
          <BarChart3 size={18} className="text-indigo-600" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">My Analytics</h2>
        <span className="ml-auto text-xs text-gray-400">Last 30 days</span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : isError ? (
        <p className="text-sm text-gray-400 text-center py-6">Could not load analytics.</p>
      ) : (
        <div className="space-y-6">
          {/* Profile Views */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Profile Views
            </p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <StatCard
                label="All Time"
                value={data.views.total.toLocaleString()}
                icon={Eye}
                bgClass="bg-blue-50"
                textClass="text-blue-700"
              />
              <StatCard
                label="This Week"
                value={data.views.weekly.toLocaleString()}
                icon={TrendingUp}
                bgClass="bg-indigo-50"
                textClass="text-indigo-700"
              />
              <StatCard
                label="This Month"
                value={data.views.monthly.toLocaleString()}
                icon={BarChart3}
                bgClass="bg-purple-50"
                textClass="text-purple-700"
              />
            </div>
          </div>

          {/* Lead Funnel */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Lead Funnel
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <StatCard
                label="Total Leads"
                value={data.leads.total}
                icon={TrendingUp}
                bgClass="bg-gray-50"
                textClass="text-gray-700"
              />
              <StatCard
                label="Confirmed"
                value={data.leads.confirmed}
                icon={CheckCircle2}
                bgClass="bg-green-50"
                textClass="text-green-700"
              />
              <StatCard
                label="Pending"
                value={data.leads.pending}
                icon={Clock}
                bgClass="bg-yellow-50"
                textClass="text-yellow-700"
              />
              <StatCard
                label="Conversion"
                value={`${data.leads.conversionRate}%`}
                sub={`${data.leads.confirmed} of ${data.leads.total} deals done`}
                icon={Star}
                bgClass="bg-emerald-50"
                textClass="text-emerald-700"
              />
            </div>
          </div>

          {/* Lead Source Breakdown */}
          {data.leads.total > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Lead Sources
              </p>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <SourceBar
                  label="Call"
                  value={data.leads.bySource.call}
                  total={data.leads.total}
                  icon={Phone}
                  color={{ bg: "bg-blue-100", text: "text-blue-700", bar: "bg-blue-500" }}
                />
                <SourceBar
                  label="WhatsApp"
                  value={data.leads.bySource.whatsapp}
                  total={data.leads.total}
                  icon={MessageCircle}
                  color={{ bg: "bg-green-100", text: "text-green-700", bar: "bg-green-500" }}
                />
                <SourceBar
                  label="Contact Form"
                  value={data.leads.bySource.form}
                  total={data.leads.total}
                  icon={Mail}
                  color={{ bg: "bg-purple-100", text: "text-purple-700", bar: "bg-purple-500" }}
                />
              </div>
            </div>
          )}

          {/* Reviews Summary */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Reviews
            </p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <StatCard
                label="Avg Rating"
                value={data.reviews.rating > 0 ? data.reviews.rating.toFixed(1) : "—"}
                sub="out of 5 stars"
                icon={Star}
                bgClass="bg-yellow-50"
                textClass="text-yellow-700"
              />
              <StatCard
                label="Total Reviews"
                value={data.reviews.count}
                icon={MessageCircle}
                bgClass="bg-orange-50"
                textClass="text-orange-700"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
