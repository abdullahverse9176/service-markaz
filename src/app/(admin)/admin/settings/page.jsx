"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Globe,
  Bell,
  Shield,
  Database,
  Save,
  Loader2,
  Share2,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

const SOCIAL_FIELDS = [
  { key: "facebook",  label: "Facebook",    placeholder: "https://facebook.com/yourpage" },
  { key: "instagram", label: "Instagram",   placeholder: "https://instagram.com/yourhandle" },
  { key: "twitter",   label: "Twitter / X", placeholder: "https://twitter.com/yourhandle" },
  { key: "linkedin",  label: "LinkedIn",    placeholder: "https://linkedin.com/company/yourcompany" },
  { key: "youtube",   label: "YouTube",     placeholder: "https://youtube.com/@yourchannel" },
  { key: "tiktok",    label: "TikTok",      placeholder: "https://tiktok.com/@yourhandle" },
];

function Toggle({ on, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-11 h-6 ${on ? "bg-blue-600" : "bg-gray-200"} rounded-full relative cursor-pointer flex-shrink-0 transition-colors`}
    >
      <span
        className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow transition-all duration-200 ${on ? "right-1" : "left-1"}`}
      />
    </button>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

const EMPTY = {
  siteName: "",
  siteUrl: "",
  contactEmail: "",
  phone: "",
  whatsapp: "",
  socialLinks: { facebook: "", instagram: "", twitter: "", linkedin: "", youtube: "", tiktok: "" },
  requireApproval:       true,
  emailOnSubmission:     true,
  autoBlockNegative:     false,
  notifyOnRegistration:  false,
  notifyOnListing:       true,
  notifyOnReview:        false,
  notifyOnFlaggedReview: true,
};

export default function SettingsPage() {
  const { token } = useAuth();

  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState("");

  const fetchSettings = useCallback(async () => {
    if (!token) return;
    try {
      const res  = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setForm({
          ...EMPTY,
          ...json.data,
          socialLinks: { ...EMPTY.socialLinks, ...(json.data.socialLinks || {}) },
        });
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const set      = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const setSocial = (key, val) =>
    setForm((p) => ({ ...p, socialLinks: { ...p.socialLinks, [key]: val } }));

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      const res  = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <Loader2 size={24} className="animate-spin mr-2" />
        Loading settings…
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Configure platform-wide settings.</p>
      </div>

      {/* General */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <Globe size={18} className="text-blue-600" />
          <h3 className="font-semibold text-gray-800 text-sm">General</h3>
        </div>
        <div className="p-6 space-y-5">
          <Field label="Site Name">
            <input type="text" value={form.siteName} onChange={(e) => set("siteName", e.target.value)} placeholder="Service Markaz" className={inputCls} />
          </Field>
          <Field label="Base URL" hint="Used in canonical links, sitemaps, and JSON-LD schema markup.">
            <input type="url" value={form.siteUrl} onChange={(e) => set("siteUrl", e.target.value)} placeholder="https://servicemarkaz.com" className={inputCls} />
          </Field>
          <Field label="Contact Email">
            <input type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} placeholder="support@servicemarkaz.com" className={inputCls} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Phone Number">
              <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+92 300 0000000" className={inputCls} />
            </Field>
            <Field label="WhatsApp Number">
              <input type="tel" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+92 300 0000000" className={inputCls} />
            </Field>
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <Share2 size={18} className="text-pink-500" />
          <h3 className="font-semibold text-gray-800 text-sm">Social Media Links</h3>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
            <Field key={key} label={label}>
              <input type="url" value={form.socialLinks[key] || ""} onChange={(e) => setSocial(key, e.target.value)} placeholder={placeholder} className={inputCls} />
            </Field>
          ))}
        </div>
      </div>

      {/* Business Approvals */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <Shield size={18} className="text-green-600" />
          <h3 className="font-semibold text-gray-800 text-sm">Business Approval</h3>
        </div>
        <div className="p-6 space-y-4">
          {[
            { key: "requireApproval",   label: "Manual approval required",           sub: "New business listings must be reviewed before going live." },
            { key: "emailOnSubmission", label: "Email notification on submission",    sub: "Send admin an email when a new listing is submitted." },
            { key: "autoBlockNegative", label: "Auto-block after 3 negative reviews", sub: "Automatically flag listings with consistently low ratings." },
          ].map(({ key, label, sub }, i) => (
            <div key={key} className={`flex items-center justify-between py-2 ${i > 0 ? "border-t border-gray-50" : ""}`}>
              <div>
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
              </div>
              <Toggle on={form[key]} onToggle={() => set(key, !form[key])} />
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <Bell size={18} className="text-amber-500" />
          <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
        </div>
        <div className="p-6 space-y-4">
          {[
            { key: "notifyOnRegistration",  label: "New user registration",  sub: "Notify when a new user signs up." },
            { key: "notifyOnListing",       label: "New business listing",    sub: "Notify when a business is submitted." },
            { key: "notifyOnReview",        label: "New review submitted",    sub: "Notify when a review is posted." },
            { key: "notifyOnFlaggedReview", label: "Flagged review alert",    sub: "Notify when a review is flagged." },
          ].map(({ key, label, sub }, i) => (
            <div key={key} className={`flex items-center justify-between py-2 ${i > 0 ? "border-t border-gray-50" : ""}`}>
              <div>
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
              </div>
              <Toggle on={form[key]} onToggle={() => set(key, !form[key])} />
            </div>
          ))}
        </div>
      </div>

      {/* Database */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <Database size={18} className="text-purple-600" />
          <h3 className="font-semibold text-gray-800 text-sm">Data &amp; Maintenance</h3>
        </div>
        <div className="p-6 flex flex-wrap gap-3">
          <button className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-semibold rounded-xl transition">
            Export Users CSV
          </button>
          <button className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold rounded-xl transition">
            Export Businesses CSV
          </button>
          <button className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl transition">
            Clear Cache
          </button>
        </div>
      </div>

      {/* Save */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex justify-end items-center gap-3">
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
            <CheckCircle size={15} />
            Saved successfully
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
