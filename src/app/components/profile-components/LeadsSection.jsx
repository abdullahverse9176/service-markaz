"use client";

import {
  Loader2, Users, Phone, MessageCircle, Mail, Clock,
  CheckCircle2, XCircle, AlertTriangle, ThumbsUp, ThumbsDown,
} from "lucide-react";
import { useReceivedLeads, useProviderRespondToLead } from "@/hooks/useLeads";
import { toast } from "react-hot-toast";

const SOURCE_CONFIG = {
  call:     { label: "Call",      icon: Phone,         className: "bg-blue-100 text-blue-700" },
  whatsapp: { label: "WhatsApp",  icon: MessageCircle, className: "bg-green-100 text-green-700" },
  form:     { label: "Form",      icon: Mail,          className: "bg-purple-100 text-purple-700" },
};

const STATUS_CONFIG = {
  pending:           { label: "Pending",      icon: Clock,         className: "bg-yellow-100 text-yellow-700" },
  awaiting_response: { label: "Awaiting",     icon: Clock,         className: "bg-orange-100 text-orange-700" },
  confirmed:         { label: "Deal Done",    icon: CheckCircle2,  className: "bg-green-100 text-green-700" },
  rejected:          { label: "No Deal",      icon: XCircle,       className: "bg-red-100 text-red-700" },
  disputed:          { label: "Disputed",     icon: AlertTriangle, className: "bg-amber-100 text-amber-700" },
};

function SourceBadge({ source }) {
  const cfg = SOURCE_CONFIG[source] ?? { label: source, icon: Phone, className: "bg-gray-100 text-gray-600" };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, icon: Clock, className: "bg-gray-100 text-gray-600" };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function ProviderActions({ lead, onRespond, isPending }) {
  if (["confirmed", "rejected", "disputed"].includes(lead.status)) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button
        onClick={() => onRespond(lead._id, "confirmed")}
        disabled={isPending}
        className="inline-flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white min-w-[32px] sm:min-w-[90px] h-8 px-2 sm:px-3 flex-1 sm:flex-none py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
        title="Confirm Deal"
      >
        <ThumbsUp size={12} />
        <span className="hidden sm:inline">Confirm</span>
      </button>
      <button
        onClick={() => onRespond(lead._id, "rejected")}
        disabled={isPending}
        className="inline-flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 min-w-[32px] sm:min-w-[80px] h-8 px-2 sm:px-3 flex-1 sm:flex-none py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
        title="No Deal"
      >
        <ThumbsDown size={12} />
        <span className="hidden sm:inline">No Deal</span>
      </button>
      <button
        onClick={() => onRespond(lead._id, "disputed")}
        disabled={isPending}
        className="inline-flex items-center justify-center gap-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 min-w-[32px] sm:min-w-[70px] h-8 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
        title="Dispute"
      >
        <AlertTriangle size={12} />
        <span className="hidden sm:inline">Dispute</span>
      </button>
    </div>
  );
}

function StatsBar({ leads }) {
  const total = leads.length;
  const confirmed = leads.filter((l) => l.status === "confirmed").length;
  const pending = leads.filter(
    (l) => l.status === "pending" || l.status === "awaiting_response"
  ).length;
  const rate = total > 0 ? Math.round((confirmed / total) * 100) : 0;

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-5">
      <div className="bg-gray-50 rounded-xl p-2.5 sm:p-3 text-center">
        <p className="text-xl sm:text-2xl font-bold text-gray-800">{total}</p>
        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Total</p>
      </div>
      <div className="bg-green-50 rounded-xl p-2.5 sm:p-3 text-center">
        <p className="text-xl sm:text-2xl font-bold text-green-700">{confirmed}</p>
        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Confirmed</p>
      </div>
      <div className="bg-yellow-50 rounded-xl p-2.5 sm:p-3 text-center">
        <p className="text-xl sm:text-2xl font-bold text-yellow-700">{pending}</p>
        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Pending</p>
      </div>
      <div className="bg-blue-50 rounded-xl p-2.5 sm:p-3 text-center">
        <p className="text-xl sm:text-2xl font-bold text-blue-700">{rate}%</p>
        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Conversion</p>
      </div>
    </div>
  );
}

/** Card shown per lead on mobile */
function LeadCard({ lead, onRespond, isResponding }) {
  const name = lead.customer?.name || "Unknown Customer";
  const initial = name.charAt(0).toUpperCase();

  const canRespond = !["confirmed", "rejected", "disputed"].includes(lead.status);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] p-4 relative overflow-hidden transition-all">
      {/* Decorative status accent strip on the left edge */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        lead.status === 'confirmed' ? 'bg-green-500' :
        lead.status === 'rejected' ? 'bg-red-500' :
        'bg-yellow-400'
      }`} />

      {/* Card info: 3 lines */}
      <div className="pl-1.5 mb-4 space-y-1.5">
        {/* Line 1: Name */}
        <p className="font-bold text-gray-900 text-[15px] leading-tight truncate">{name}</p>
        {/* Line 2: Date */}
        <p className="text-[11px] text-gray-500 font-medium">
          {new Date(lead.createdAt).toLocaleDateString("en-PK", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
        {/* Line 3: Source + Status */}
        <div className="flex items-center gap-2">
          <SourceBadge source={lead.source} />
          <StatusBadge status={lead.status} />
        </div>
      </div>

      {/* Mobile-centric Actions */}
      {canRespond && (
        <div className="mt-4 pt-4 border-t border-gray-50 flex flex-col gap-2.5 pl-1.5">
          <div className="flex gap-2.5">
            <button
              onClick={() => onRespond(lead._id, "confirmed")}
              disabled={isResponding}
              className="flex-1 flex justify-center items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white shadow-sm py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-95 disabled:opacity-50"
            >
              <ThumbsUp size={14} />
              Confirm Deal
            </button>
            <button
              onClick={() => onRespond(lead._id, "rejected")}
              disabled={isResponding}
              className="flex-1 flex justify-center items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-95 disabled:opacity-50"
            >
              <ThumbsDown size={14} />
              No Deal
            </button>
          </div>
          <button
            onClick={() => onRespond(lead._id, "disputed")}
            disabled={isResponding}
            className="w-full flex justify-center items-center gap-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
          >
            <AlertTriangle size={12} />
            Dispute this lead
          </button>
        </div>
      )}
    </div>
  );
}

export default function LeadsSection() {
  const { data: leads, isLoading } = useReceivedLeads();
  const { mutate: respondToLead, isPending: isResponding } = useProviderRespondToLead();

  const handleRespond = (leadId, action) => {
    respondToLead(
      { leadId, action },
      {
        onSuccess: () => {
          const labels = {
            confirmed: "marked as confirmed",
            rejected: "marked as no deal",
            disputed: "marked as disputed",
          };
          toast.success(`Lead ${labels[action] ?? "updated"}`);
        },
        onError: (err) => toast.error(err.message || "Failed to update lead"),
      }
    );
  };

  if (!isLoading && (!leads || leads.length === 0)) return null;

  return (
    <div className="bg-white sm:shadow-sm sm:rounded-2xl p-4 sm:p-6 border-b sm:border-none border-gray-100">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg">
          <Users size={18} className="text-blue-600" />
        </div>
        <h2 className="text-base sm:text-xl font-bold text-gray-800">Customer Leads</h2>
        {!isLoading && leads && (
          <span className="ml-auto text-xs sm:text-sm text-gray-500 font-medium">
            {leads.length} {leads.length === 1 ? "lead" : "leads"}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : !leads?.length ? (
        <p className="text-sm text-gray-400 text-center py-6">
          No leads yet. Customers who contact you will appear here.
        </p>
      ) : (
        <>
          <StatsBar leads={leads} />

          {/* Mobile: card list (< md) */}
          <div className="md:hidden space-y-3">
            {leads.map((lead) => (
              <LeadCard
                key={lead._id}
                lead={lead}
                onRespond={handleRespond}
                isResponding={isResponding}
              />
            ))}
          </div>

          {/* Desktop: table (md+) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Source</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-3">
                      <p className="font-medium text-gray-800 text-sm">{lead.customer?.name || "Unknown"}</p>
                    </td>
                    <td className="py-3 px-3">
                      <SourceBadge source={lead.source} />
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="py-3 px-3 text-gray-500 text-xs">
                      {new Date(lead.createdAt).toLocaleDateString("en-PK", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-3">
                      <ProviderActions lead={lead} onRespond={handleRespond} isPending={isResponding} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
