"use client";

import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  MessageCircle,
  ShieldCheck,
  PhoneCall,
  FileText,
  ChevronRight,
  Loader2,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import ProtectedRoute from "@/app/components/ui/ProtectedRoute";
import { useMyLeads } from "@/hooks/useLeads";

// ── Lead status chip ──────────────────────────────────────────────────────────
const statusConfig = {
  pending: { label: "Pending", icon: Clock, className: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
  awaiting_response: { label: "Awaiting", icon: Clock, className: "bg-blue-50 text-blue-700 border border-blue-200" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, className: "bg-green-50 text-green-700 border border-green-200" },
  rejected: { label: "Rejected", icon: XCircle, className: "bg-red-50 text-red-700 border border-red-200" },
  disputed: { label: "Disputed", icon: AlertCircle, className: "bg-orange-50 text-orange-700 border border-orange-200" },
};

const sourceConfig = {
  call: { label: "Called", icon: PhoneCall, color: "text-blue-500" },
  whatsapp: { label: "WhatsApp", icon: MessageCircle, color: "text-green-500" },
  form: { label: "Email", icon: FileText, color: "text-purple-500" },
};

function StatusChip({ status }) {
  const cfg = statusConfig[status] ?? statusConfig.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.className}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
function CustomerHeader({ user }) {
  const initials = user.name
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="bg-white shadow-sm rounded-b-2xl lg:rounded-2xl overflow-hidden mb-6">
      {/* Banner */}
      <div className="h-36 relative bg-gradient-to-r from-violet-500 via-purple-600 to-pink-500">
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml,%3Csvg width%3D%2260%22 height%3D%2260%22 viewBox%3D%220 0 60 60%22 xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg fill%3D%22none%22 fill-rule%3D%22evenodd%22%3E%3Cg fill%3D%22%23ffffff%22 fill-opacity%3D%221%22%3E%3Cpath d%3D%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
      </div>

      <div className="px-5 sm:px-6 pb-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="relative -mt-14 flex-shrink-0">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-28 h-28 rounded-2xl border-4 border-white shadow-md object-cover"
              />
            ) : (
              <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-md bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">{initials}</span>
              </div>
            )}
            {user.isEmailVerified && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow">
                <CheckCircle2 size={20} className="text-green-500 fill-green-100" />
              </div>
            )}
          </div>

          {/* Name + meta */}
          <div className="flex-1 pt-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              {user.isEmailVerified ? (
                <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                  Verified
                </span>
              ) : (
                <Link
                  href="/verify-email"
                  className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium hover:bg-amber-100 transition"
                >
                  Unverified — Verify now
                </Link>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <User size={14} className="text-purple-500" />
              <p className="text-purple-600 font-semibold text-sm uppercase tracking-wide">Customer</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Mail size={14} className="text-blue-400" />
                <span className="truncate max-w-[200px]">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone size={14} className="text-green-400" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.whatsapp && user.whatsapp !== user.phone && (
                <div className="flex items-center gap-1.5">
                  <MessageCircle size={14} className="text-emerald-400" />
                  <span>{user.whatsapp}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Account Details card ──────────────────────────────────────────────────────
function AccountDetails({ user }) {
  const fields = [
    {
      label: "Email",
      value: user.email,
      icon: Mail,
      iconColor: "text-blue-500",
      suffix: user.isEmailVerified ? (
        <ShieldCheck size={18} className="text-green-500 flex-shrink-0" />
      ) : (
        <Link
          href="/verify-email"
          className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded-lg hover:bg-amber-100 transition flex-shrink-0"
        >
          Verify
        </Link>
      ),
    },
    user.phone && {
      label: "Phone",
      value: user.phone,
      icon: Phone,
      iconColor: "text-green-500",
    },
    user.whatsapp && {
      label: "WhatsApp",
      value: user.whatsapp,
      icon: MessageCircle,
      iconColor: "text-emerald-500",
    },
  ].filter(Boolean);

  return (
    <div className="bg-white sm:shadow-sm sm:rounded-2xl p-5 sm:p-6 border-b sm:border-none border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-blue-50 rounded-lg">
          <User size={18} className="text-blue-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-800">Account Details</h2>
      </div>

      <div className="space-y-3">
        {fields.map(({ label, value, icon: Icon, iconColor, suffix }) => (
          <div key={label} className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
            <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 flex-shrink-0">
              <Icon size={15} className={iconColor} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{label}</p>
              <p className="text-sm text-gray-700 font-medium truncate">{value}</p>
            </div>
            {suffix && suffix}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── My Enquiries card ─────────────────────────────────────────────────────────
function EnquiriesSection({ leads, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white sm:shadow-sm sm:rounded-2xl p-6 flex justify-center border-b sm:border-none border-gray-100">
        <Loader2 size={24} className="animate-spin text-purple-500" />
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="bg-white sm:shadow-sm sm:rounded-2xl p-6 sm:p-8 border-b sm:border-none border-gray-100">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Building2 size={18} className="text-indigo-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">My Enquiries</h2>
        </div>
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
            <Building2 size={26} className="text-gray-400" />
          </div>
          <p className="font-semibold text-gray-700">No enquiries yet</p>
          <p className="text-sm text-gray-400 max-w-xs">
            Contact a service provider to see your enquiries here.
          </p>
          <Link
            href="/services"
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl transition active:scale-[0.98]"
          >
            <Plus size={16} />
            Find a Provider
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white sm:shadow-sm sm:rounded-2xl p-5 sm:p-6 border-b sm:border-none border-gray-100">
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <div className="p-1.5 sm:p-2 bg-indigo-50 rounded-lg">
          <Building2 size={18} className="text-indigo-600" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">My Enquiries</h2>
        <span className="ml-auto text-sm text-gray-500 font-medium">
          {leads.length} {leads.length === 1 ? "contact" : "contacts"}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {leads.map((lead) => {
          const biz = lead.business;
          if (!biz) return null;
          const src = sourceConfig[lead.source] ?? sourceConfig.call;
          const SrcIcon = src.icon;
          const date = new Date(lead.createdAt).toLocaleDateString("en-PK", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <div
              key={lead._id}
              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition"
            >
              {/* Business avatar */}
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                {biz.profileImage ? (
                  <img src={biz.profileImage} alt={biz.name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={22} className="text-indigo-400" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{biz.name}</p>
                <p className="text-xs text-gray-500 truncate capitalize">
                  {biz.category?.replace(/-/g, " ")} · {biz.city}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`flex items-center gap-1 text-xs font-medium ${src.color}`}>
                    <SrcIcon size={11} />
                    {src.label}
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{date}</span>
                </div>
              </div>

              {/* Status + link */}
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <StatusChip status={lead.status} />
                <Link
                  href={`/provider/${biz._id}`}
                  className="text-xs text-indigo-500 hover:text-indigo-700 font-medium flex items-center gap-0.5 transition"
                >
                  View <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
function CustomerProfileContent() {
  const { user } = useAuth();
  const { data: leads, isLoading: leadsLoading } = useMyLeads();

  return (
    <div className="min-h-screen bg-gray-50 pb-8 lg:py-8 pt-0 sm:pt-4">
      <div className="max-w-5xl mx-auto px-0 sm:px-4 lg:px-6">
        <CustomerHeader user={user} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-0">
          {/* Left — enquiries */}
          <div className="lg:col-span-2">
            <EnquiriesSection leads={leads} isLoading={leadsLoading} />
          </div>

          {/* Right — account details */}
          <div className="lg:sticky lg:top-6 lg:h-fit">
            <AccountDetails user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerProfilePage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <CustomerProfileContent />
    </ProtectedRoute>
  );
}
