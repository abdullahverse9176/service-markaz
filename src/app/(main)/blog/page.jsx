"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar, Clock, Tag, ArrowRight, BookOpen,
  Wrench, Snowflake, Zap, Sparkles, Hammer, Lightbulb,
  Star, FileText, TrendingUp, Users, Loader2,
} from "lucide-react";
import Pagination from "@/app/components/Pagination";
import AddBusinessCTA from "@/app/components/home/AddBusinessCTA";
import { categories } from "@/data/categories";
import BusinessCard from "@/app/components/ui/BusinessCard";

const POSTS_PER_PAGE = 6;

const blogCategories = [
  "All", "Plumbing", "AC Repair", "Electricians",
  "Home Cleaning", "Carpentry", "General Tips",
];

const COVER_ICONS = { Wrench, Snowflake, Zap, Sparkles, Hammer, Lightbulb };

const CATEGORY_ICON_MAP = {
  All: BookOpen,
  Plumbing: Wrench,
  "AC Repair": Snowflake,
  Electricians: Zap,
  "Home Cleaning": Sparkles,
  Carpentry: Hammer,
  "General Tips": Lightbulb,
};

function BlogCard({ blog, featured = false }) {
  const CoverIcon = COVER_ICONS[blog.coverIconName] ?? BookOpen;

  return (
    <Link href={`/blog/${blog.slug}`} className="block group h-full">
      <article
        className={`bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 h-full flex flex-col ${
          featured ? "sm:flex-row" : ""
        }`}
      >
        {/* Cover Image */}
        <div
          className={`relative overflow-hidden flex-shrink-0 ${
            featured ? "sm:w-64 min-h-[200px] sm:min-h-full" : "h-52"
          }`}
        >
          <Image
            src={blog.image}
            alt={blog.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            unoptimized={!blog.image?.includes("cloudfront.net") && !blog.image?.includes("amazonaws.com") && !blog.image?.includes("cloudinary.com")}
          />
          {/* Gradient overlays */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${blog.coverGradient} opacity-55 group-hover:opacity-45 transition-opacity duration-300`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

          {/* Lucide icon badge */}
          <div className="absolute top-3 left-3 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
            <CoverIcon size={18} className="text-blue-600" />
          </div>

          {/* Category chip */}
          <span className="absolute top-3 right-3 text-xs font-bold text-white bg-black/40 backdrop-blur-sm border border-white/20 px-2.5 py-0.5 rounded-full">
            {blog.category}
          </span>

          {/* Featured badge */}
          {blog.featured && (
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 text-xs font-bold text-white bg-[#00a676] px-2 py-0.5 rounded-full">
              <Star size={10} className="fill-white" />
              Featured
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h2
            className={`font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors mb-2 ${
              featured ? "text-xl" : "text-base line-clamp-2"
            }`}
          >
            {blog.title}
          </h2>

          <p
            className={`text-gray-500 text-sm leading-relaxed mb-4 flex-1 ${
              featured ? "line-clamp-3" : "line-clamp-2"
            }`}
          >
            {blog.excerpt}
          </p>

          {/* Tags — featured cards only */}
          {featured && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {blog.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-gray-400 mt-auto pt-3 border-t border-gray-100">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} className="text-blue-400" />
              {new Date(blog.date).toLocaleDateString("en-PK", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="w-px h-3 bg-gray-200" />
            <span className="flex items-center gap-1.5">
              <Clock size={12} className="text-blue-400" />
              {blog.readTime}
            </span>
            <span className="ml-auto flex items-center gap-1 text-blue-600 font-semibold group-hover:gap-2 transition-all">
              Read more
              <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// JSON-LD structured data for blog collection
const blogCollectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Service Markaz Blog",
  description: "Expert guides and tips for home services in Pakistan",
  url: "https://servicemarkaz.com/blog",
  inLanguage: "en-PK",
  publisher: {
    "@type": "Organization",
    name: "Service Markaz",
    url: "https://servicemarkaz.com",
  },
};

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch main (paginated) blogs
  const { data: mainData, isLoading: loading } = useQuery({
    queryKey: ["blogs", currentPage, activeCategory],
    queryFn: async () => {
      const params = new URLSearchParams({ page: currentPage, limit: POSTS_PER_PAGE });
      if (activeCategory !== "All") params.set("category", activeCategory);
      const r = await fetch(`/api/blogs?${params}`);
      const json = await r.json();
      if (!json.success) throw new Error("Failed to load blogs");
      return json.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch featured posts once
  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ["blogs-featured"],
    queryFn: async () => {
      const r = await fetch("/api/blogs?featured=true&limit=3");
      const json = await r.json();
      if (!json.success) throw new Error("Failed to load featured blogs");
      return json.data.blogs;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes — changes rarely
  });

  const paginated = mainData?.blogs ?? [];
  const totalPages = mainData?.totalPages ?? 1;
  const total = mainData?.total ?? 0;
  const featuredPosts = featuredData ?? [];

  const showFeatured = activeCategory === "All" && currentPage === 1;

  function handleCategoryChange(cat) {
    setActiveCategory(cat);
    setCurrentPage(1);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogCollectionJsonLd) }} />
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0ea577] via-[#0c8c64] to-[#018094] text-white">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#018094] opacity-20 blur-3xl pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto px-4 py-12 sm:py-16 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-100 bg-white/15 border border-white/20 backdrop-blur-md px-4 py-1.5 rounded-full mb-6">
            <BookOpen size={14} />
            Service Tips &amp; Guides
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-4 drop-shadow-sm">
            Home Service <span className="text-emerald-100">Expert Blog</span>
          </h1>
          
          <p className="text-emerald-50/90 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 font-medium">
            Practical guides, hiring tips, and maintenance advice to help you
            get the best from every home service.
          </p>
          
          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-2.5 sm:gap-4">
            {[
              { icon: FileText, label: `${total > 0 ? total : "10"}+ Articles` },
              { icon: Tag, label: "5 Categories" },
              { icon: Users, label: "Expert Tips" },
              { icon: TrendingUp, label: "Weekly Updates" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex-1 min-w-[140px] sm:flex-none bg-black/10 hover:bg-black/20 transition-colors backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center sm:justify-start gap-2 px-3 py-3 text-sm sm:text-base font-medium text-white shadow-sm">
                <Icon size={18} className="text-emerald-200" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* ── Featured Posts ──────────────────────────────────────── */}
        {showFeatured && featuredPosts.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2">
                <Star size={16} className="fill-[#00a676] text-[#00a676]" />
                <span className="text-sm font-bold uppercase tracking-widest text-gray-700">
                  Featured Articles
                </span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-[#00a676]/30 to-transparent" />
            </div>
            {featuredLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3].map((i) => <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />)}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredPosts.map((blog) => (
                  <BlogCard key={blog._id} blog={blog} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Category Filter ─────────────────────────────────────── */}
        <section className="mb-8 sm:mb-10 -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="bg-white/80 sm:bg-white sm:rounded-2xl sm:border border-gray-100 shadow-none sm:shadow-sm sm:p-4">
            <div className="flex sm:flex-wrap overflow-x-auto pb-3 sm:pb-0 gap-2 sm:gap-2.5 scrollbar-none snap-x snap-mandatory">
              {blogCategories.map((cat) => {
                const CatIcon = CATEGORY_ICON_MAP[cat] ?? BookOpen;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`snap-start whitespace-nowrap inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 shrink-0 ${
                      activeCategory === cat
                        ? "bg-[#0ea577] text-white border-[#0ea577] shadow-md shadow-emerald-500/20"
                        : "bg-white sm:bg-gray-50 text-gray-600 border-gray-200 hover:border-[#0ea577] hover:text-[#0ea577] hover:bg-emerald-50 shadow-sm sm:shadow-none"
                    }`}
                  >
                    <CatIcon size={16} className={activeCategory === cat ? "text-white" : "text-gray-400"} />
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Articles Grid ───────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {activeCategory === "All" ? "All Articles" : activeCategory}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {total} article{total !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: POSTS_PER_PAGE }).map((_, i) => (
                <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center py-20 bg-white rounded-2xl border border-gray-100">
              <BookOpen size={40} className="text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No articles found in this category.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginated.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </section>
      </div>


      {/* ── Tags Cloud ──────────────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-100 pt-9 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-lg font-bold text-gray-800 mb-1">Browse by Topic</h3>
          <p className="text-sm text-gray-500 mb-6">
            Jump to the service area you need help with
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(({ name, icon: Icon, slug}) => (
              <Link href={`/services?category=${slug}`} passHref
                key={name}
                className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 px-4 py-2 rounded-full cursor-default transition-colors border border-transparent hover:border-blue-200 cursor-pointer"
              >
                <Icon size={14} />
                {name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Business CTA ────────────────────────────────────────────── */}
      <div className="">
        <BusinessCard
        title="Stay Updated with Helpful Guides"
        subtitle="Read tips, insights, and updates to help you find and choose the best local services."
        buttonText="Explore Services"
        buttonHref="/services"
      />
      </div>
    </div>
  );
}
