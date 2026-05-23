"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/app/context/AuthContext";
import {
  Save, Send, ArrowLeft, Loader2, Image as ImageIcon,
  Tag, User, BookOpen, Palette, Star, Eye, EyeOff,
  AlertCircle, CheckCircle2, X, FileEdit, Sparkles, Globe, Lock,
  Upload, Trash2,
} from "lucide-react";
import { generateSlug } from "@/utils/slug";
import { useCategories } from "@/hooks/useCategories";

// TipTap is client-only — lazy load to avoid SSR issues
const TipTapEditor = dynamic(
  () => import("@/app/components/admin/TipTapEditor"),
  { ssr: false, loading: () => <div className="h-72 bg-gray-50 rounded-xl animate-pulse border border-dashed border-gray-200" /> }
);


const COVER_ICON_OPTIONS = [
  "BookOpen", "Wrench", "Snowflake", "Zap",
  "Sparkles", "Hammer", "Lightbulb", "Star",
  "Home", "Shield", "Settings", "Tool",
];

const GRADIENT_OPTIONS = [
  { label: "Blue → Indigo",  value: "from-blue-500 to-indigo-600" },
  { label: "Cyan → Blue",    value: "from-cyan-400 to-blue-600" },
  { label: "Purple → Pink",  value: "from-purple-500 to-pink-600" },
  { label: "Green → Teal",   value: "from-green-500 to-teal-600" },
  { label: "Orange → Red",   value: "from-orange-500 to-red-600" },
  { label: "Amber → Orange", value: "from-amber-400 to-orange-600" },
  { label: "Teal → Cyan",    value: "from-teal-500 to-cyan-600" },
  { label: "Rose → Pink",    value: "from-rose-500 to-pink-500" },
];

const EMPTY_FORM = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "",
  tags: [],
  author: "Service Markaz Team",
  image: "",
  coverIconName: "BookOpen",
  coverGradient: "from-blue-500 to-indigo-600",
  featured: false,
  status: "draft",
};

// ── Reusable field primitives ─────────────────────────────────────────────────
function FieldLabel({ children, required, hint }) {
  return (
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-sm font-semibold text-gray-700">
        {children}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {hint && <span className="text-xs text-gray-400">{hint}</span>}
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 bg-white placeholder-gray-400 transition-all ${className}`}
    />
  );
}

function Textarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 bg-white placeholder-gray-400 transition-all resize-none ${className}`}
    />
  );
}

function Select({ className = "", children, ...props }) {
  return (
    <select
      {...props}
      className={`w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 bg-white transition-all ${className}`}
    >
      {children}
    </select>
  );
}

function SectionCard({ icon: Icon, iconColor = "text-blue-500", iconBg = "bg-blue-50", title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50/70">
        <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon size={14} className={iconColor} />
        </div>
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold ${
      toast.type === "success" ? "bg-green-600 text-white" : "bg-red-500 text-white"
    }`}>
      {toast.type === "success" ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
      {toast.msg}
    </div>
  );
}

// ── TagInput ──────────────────────────────────────────────────────────────────
function TagInput({ tags, onChange }) {
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  function addTag(raw) {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, "-");
    if (!tag || tags.includes(tag)) { setInput(""); return; }
    onChange([...tags, tag]);
    setInput("");
  }

  function removeTag(tag) {
    onChange(tags.filter((t) => t !== tag));
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  }

  return (
    <div>
      <div
        className="flex items-center gap-2 px-3.5 py-2.5 border border-gray-200 rounded-xl focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 bg-white transition-all cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <Tag size={14} className="text-gray-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input.trim() && addTag(input)}
          placeholder={tags.length === 0 ? "Type a tag, press Enter…" : "Add more…"}
          className="flex-1 text-sm bg-transparent outline-none placeholder-gray-400 min-w-[100px]"
        />
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-blue-400 hover:text-red-500 transition-colors ml-0.5"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-400 mt-1.5">Press Enter or comma to add · Backspace to remove last</p>
    </div>
  );
}

// ── CategorySearchField ──────────────────────────────────────────────────────
const INITIAL_VISIBLE = 7;

function CategorySearchField({ value, onChange }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const { data: allCategories = [], isLoading } = useCategories();

  // Build suggestion list: if typing, filter all; otherwise show first 7
  const suggestions = query.trim()
    ? allCategories.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase())
      )
    : allCategories.slice(0, INITIAL_VISIBLE);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSelect(cat) {
    onChange(cat.name);
    setQuery("");
    setOpen(false);
  }

  function handleClear(e) {
    e.stopPropagation();
    onChange("");
    setQuery("");
    inputRef.current?.focus();
    setOpen(true);
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") setOpen(false);
    if (e.key === "Enter" && suggestions.length > 0) {
      e.preventDefault();
      handleSelect(suggestions[0]);
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          autoComplete="off"
          placeholder={isLoading ? "Loading categories…" : "Search category…"}
          value={value && !open ? value : query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setQuery("");
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 bg-white placeholder-gray-400 transition-all"
        />
        {value && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Selected badge */}
      {value && !open && (
        <div className="mt-2 inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
          {value}
        </div>
      )}

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          {!query.trim() && (
            <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Popular Categories
            </p>
          )}
          <ul className="py-1 max-h-52 overflow-y-auto">
            {suggestions.map((cat) => {
              const Icon = cat.icon;
              return (
                <li key={cat._id || cat.slug}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(cat)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition text-left group ${
                      value === cat.name ? "bg-blue-50/60" : ""
                    }`}
                  >
                    {Icon && (
                      <Icon size={15} className="text-blue-500 shrink-0 group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-sm text-gray-800 flex-1">{cat.name}</span>
                    {value === cat.name && (
                      <CheckCircle2 size={13} className="text-blue-500" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          {!query.trim() && allCategories.length > INITIAL_VISIBLE && (
            <p className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100">
              Type to search all {allCategories.length} categories…
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main BlogForm ─────────────────────────────────────────────────────────────
export default function BlogForm({ blogId = null }) {
  const { token } = useAuth();
  const router = useRouter();

  const isEdit = Boolean(blogId);

  const [form, setForm] = useState(EMPTY_FORM);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [slugManual, setSlugManual] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const coverInputRef = useRef(null);

  async function uploadCoverImage(file) {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(file.type)) {
      return showToast("error", "Only JPG, PNG or WebP images allowed");
    }
    if (file.size > 5 * 1024 * 1024) {
      return showToast("error", "Image must be under 5 MB");
    }
    setImageUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "service-markaz/blogs");
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const json = await res.json();
      if (json.success) {
        set("image", json.data.url);
        showToast("success", "Cover image uploaded!");
      } else {
        showToast("error", json.message || "Upload failed");
      }
    } catch {
      showToast("error", "Network error during upload");
    } finally {
      setImageUploading(false);
    }
  }

  // ── Load existing blog ────────────────────────────────────────────
  useEffect(() => {
    if (!isEdit || !token) return;
    setLoadingData(true);
    fetch(`/api/admin/blogs/${blogId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const b = json.data;
          setForm({
            title: b.title || "",
            slug: b.slug || "",
            excerpt: b.excerpt || "",
            content: b.content || "",
            category: b.category || "",
            tags: Array.isArray(b.tags) ? b.tags : [],
            author: b.author || "Service Markaz Team",
            image: b.image || "",
            coverIconName: b.coverIconName || "BookOpen",
            coverGradient: b.coverGradient || "from-blue-500 to-indigo-600",
            featured: b.featured || false,
            status: b.status || "draft",
          });
          setSlugManual(true);
        }
      })
      .finally(() => setLoadingData(false));
  }, [blogId, token, isEdit]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManual && form.title) {
      setForm((prev) => ({ ...prev, slug: generateSlug(form.title) }));
    }
  }, [form.title, slugManual]);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function showToast(type, msg) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  async function submit(overrideStatus) {
    const status = overrideStatus ?? form.status;
    if (!form.title.trim()) return showToast("error", "Title is required");
    if (!form.excerpt.trim()) return showToast("error", "Excerpt is required");
    if (!form.content || form.content === "<p></p>")
      return showToast("error", "Content cannot be empty");

    setSaving(true);
    try {
      const url = isEdit ? `/api/admin/blogs/${blogId}` : "/api/admin/blogs";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, status }),
      });
      const json = await res.json();

      if (json.success) {
        showToast("success", isEdit ? "Blog updated successfully!" : "Blog created successfully!");
        setTimeout(() => router.push("/admin/blogs"), 1300);
      } else {
        showToast("error", json.message || "Something went wrong");
      }
    } catch {
      showToast("error", "Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  if (loadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
        <Loader2 size={32} className="animate-spin text-blue-500" />
        <p className="text-sm text-gray-400">Loading blog post…</p>
      </div>
    );
  }

  const isPublished = form.status === "published";

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Toast toast={toast} />

      {/* ── Sticky action bar ────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors shrink-0"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0">
              <FileEdit size={15} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-gray-900 truncate">
                {form.title || (isEdit ? "Edit Blog Post" : "New Blog Post")}
              </h1>
              <p className="text-xs text-gray-400 truncate">
                {isEdit ? "Editing article" : "Creating new article"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full border ${
              isPublished
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}>
              {isPublished ? <Globe size={11} /> : <Lock size={11} />}
              {isPublished ? "Published" : "Draft"}
            </span>
            <button
              type="button"
              onClick={() => submit("draft")}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span className="hidden sm:inline">Save Draft</span>
            </button>
            <button
              type="button"
              onClick={() => submit("published")}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {isEdit ? "Update & Publish" : "Publish"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Two-column body ──────────────────────────────────────── */}
      <div className="px-6 py-6 grid lg:grid-cols-3 gap-6">

        {/* LEFT: Main content */}
        <div className="lg:col-span-2 space-y-5">

          {/* Title + Slug card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">
              Article Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Write a compelling title…"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className="w-full py-1 text-2xl font-bold text-gray-900 border-none outline-none bg-transparent placeholder-gray-300 focus:ring-0"
            />

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">blog/</span>
              <input
                type="text"
                placeholder="url-slug"
                value={form.slug}
                onChange={(e) => { setSlugManual(true); set("slug", e.target.value); }}
                className="flex-1 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-blue-400 focus:bg-white transition-all"
              />
              <span className="text-xs text-gray-400 hidden sm:block">auto-generated</span>
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <FieldLabel required hint={`${form.excerpt.length}/200`}>Excerpt</FieldLabel>
            <Textarea
              rows={3}
              placeholder="A short, engaging summary shown in blog cards and search results…"
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              maxLength={220}
            />
            {form.excerpt.length > 200 && (
              <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                <AlertCircle size={12} /> Keep excerpt under 200 characters
              </p>
            )}
          </div>

          {/* TipTap Content */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 block">
              Content <span className="text-red-400">*</span>
            </label>
            <TipTapEditor
              value={form.content}
              onChange={(html) => set("content", html)}
              placeholder="Write your full article here. Use the toolbar to format headings, lists, links and more…"
            />
          </div>
        </div>

        {/* RIGHT: Settings */}
        <div className="space-y-4">

          {/* Post Details */}
          <SectionCard icon={BookOpen} title="Post Details">
            <div>
              <FieldLabel required>Category</FieldLabel>
              <CategorySearchField
                value={form.category}
                onChange={(name) => set("category", name)}
              />
            </div>

            <div>
              <FieldLabel>Author</FieldLabel>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Author name"
                  value={form.author}
                  onChange={(e) => set("author", e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <FieldLabel>Tags</FieldLabel>
              <TagInput tags={form.tags} onChange={(tags) => set("tags", tags)} />
            </div>

            {/* Featured */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Star size={13} className="text-yellow-600 fill-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Featured Post</p>
                  <p className="text-xs text-gray-500">Show in featured section</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => set("featured", !form.featured)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  form.featured ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  form.featured ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            </div>
          </SectionCard>

          {/* Cover Image */}
          <SectionCard icon={ImageIcon} iconBg="bg-purple-50" iconColor="text-purple-600" title="Cover Image">
            {/* Hidden file input */}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => uploadCoverImage(e.target.files?.[0])}
            />

            {form.image ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-100 h-36 group">
                <img src={form.image} alt="Cover preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="flex items-center gap-1.5 bg-white/90 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-white transition-colors"
                  >
                    <Upload size={12} /> Change
                  </button>
                  <button
                    type="button"
                    onClick={() => set("image", "")}
                    className="flex items-center gap-1.5 bg-red-500/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={imageUploading}
                className="w-full flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-purple-400 hover:text-purple-500 hover:bg-purple-50/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {imageUploading ? (
                  <>
                    <Loader2 size={22} className="mb-1.5 animate-spin text-purple-500" />
                    <p className="text-xs font-medium text-purple-600">Uploading image…</p>
                  </>
                ) : (
                  <>
                    <Upload size={22} className="mb-1.5" />
                    <p className="text-xs font-semibold">Click to upload cover photo</p>
                    <p className="text-xs mt-0.5">JPG, PNG or WebP · max 5 MB</p>
                  </>
                )}
              </button>
            )}

            {imageUploading && form.image === "" && null}
          </SectionCard>

          {/* Appearance */}
          <SectionCard icon={Sparkles} iconBg="bg-pink-50" iconColor="text-pink-500" title="Appearance">
            <div>
              <FieldLabel>Cover Icon</FieldLabel>
              <Select value={form.coverIconName} onChange={(e) => set("coverIconName", e.target.value)}>
                {COVER_ICON_OPTIONS.map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </Select>
            </div>

            <div>
              <FieldLabel>Cover Gradient</FieldLabel>
              <div className="grid grid-cols-4 gap-2 mt-1">
                {GRADIENT_OPTIONS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => set("coverGradient", g.value)}
                    title={g.label}
                    className={`h-9 rounded-xl bg-gradient-to-br ${g.value} transition-all ${
                      form.coverGradient === g.value
                        ? "ring-2 ring-offset-2 ring-blue-500 scale-110 shadow-lg"
                        : "opacity-70 hover:opacity-100 hover:scale-105"
                    }`}
                  />
                ))}
              </div>
              {/* Live preview */}
              <div className={`mt-3 h-10 rounded-xl bg-gradient-to-br ${form.coverGradient} shadow-sm flex items-center justify-center`}>
                <span className="text-white text-xs font-semibold opacity-80">Gradient Preview</span>
              </div>
            </div>
          </SectionCard>

        </div>
      </div>
    </div>
  );
}


