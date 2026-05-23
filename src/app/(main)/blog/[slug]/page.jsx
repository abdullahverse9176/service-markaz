import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar, Clock, Tag, ArrowLeft, ArrowRight, BookOpen,
  ChevronRight, Search, Wrench, Snowflake, Zap, Sparkles,
  Hammer, Lightbulb, User, Star,
} from "lucide-react";
import AddBusinessCTA from "@/app/components/home/AddBusinessCTA";
import { connectDB } from "@/lib/db/connect";
import Blog from "@/models/Blog";
import { generateSlug } from "@/utils/slug";
import { unstable_cache } from "next/cache";
import BusinessCard from "@/app/components/ui/BusinessCard";
import { getSiteSettings } from "@/lib/settings";

// Revalidate cached blog pages every hour — blogs change rarely
export const revalidate = 3600;

/**
 * Cached helper — fetches the blog AND all its page data in one pass.
 * Both generateMetadata and the page component share this cache key,
 * so the DB is only queried once per revalidation window.
 */
const getBlogPageData = unstable_cache(
  async (slug) => {
    await connectDB();
    const blog = await Blog.findOne({ slug, status: "published" }).lean();
    if (!blog) return null;

    const [prevBlog, nextBlog, related] = await Promise.all([
      Blog.findOne({ status: "published", _id: { $gt: blog._id } })
        .sort({ _id: 1 })
        .select("title slug")
        .lean(),
      Blog.findOne({ status: "published", _id: { $lt: blog._id } })
        .sort({ _id: -1 })
        .select("title slug")
        .lean(),
      Blog.find({
        status: "published",
        category: blog.category,
        _id: { $ne: blog._id },
      })
        .sort({ createdAt: -1 })
        .limit(3)
        .select("title slug category coverIconName coverGradient image readTime")
        .lean(),
    ]);

    const remaining = 3 - related.length;
    const others =
      remaining > 0
        ? await Blog.find({
            status: "published",
            category: { $ne: blog.category },
            _id: { $ne: blog._id },
          })
            .sort({ createdAt: -1 })
            .limit(remaining)
            .select("title slug category coverIconName coverGradient image readTime")
            .lean()
        : [];

    return { blog, prevBlog, nextBlog, sidebar: [...related, ...others] };
  },
  ["blog-page"],
  { revalidate: 3600, tags: ["blog"] }
);

const COVER_ICONS = { Wrench, Snowflake, Zap, Sparkles, Hammer, Lightbulb };

// Derive initials from author name
function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "SM";
}

// â”€â”€ SEO Metadata â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const data = await getBlogPageData(slug);
    if (!data) return { title: "Article Not Found | Service Markaz" };
    const { blog } = data;
    return {
      title: `${blog.title} | Service Markaz`,
      description: blog.excerpt,
      alternates: { canonical: `/blog/${slug}` },
      openGraph: {
        title: blog.title,
        description: blog.excerpt,
        url: `/blog/${slug}`,
        type: "article",
        publishedTime: blog.publishedAt ?? blog.createdAt,
      },
      twitter: {
        card: "summary_large_image",
        title: blog.title,
        description: blog.excerpt,
      },
    };
  } catch {
    return { title: "Service Markaz Blog" };
  }
}

// â”€â”€ Related Posts sidebar card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function RelatedCard({ blog }) {
  const CoverIcon = COVER_ICONS[blog.coverIconName] ?? BookOpen;
  return (
    <Link href={`/blog/${blog.slug}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex gap-3 p-3">
        {/* Thumbnail with image + gradient overlay + icon */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${blog.coverGradient} opacity-60`} />
          <div className="absolute inset-0 flex items-center justify-center">
            <CoverIcon size={16} className="text-white drop-shadow" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-blue-600 mb-0.5">{blog.category}</p>
          <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
            {blog.title}
          </h4>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <Clock size={10} />
            {blog.readTime}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;

  // Use the shared cached helper — avoids double DB hit with generateMetadata
  const data = await getBlogPageData(slug);
  if (!data) notFound();

  const { blog, prevBlog, nextBlog, sidebar } = data;
  const settings = await getSiteSettings();
  const BASE = settings.siteUrl;

  const CoverIcon = COVER_ICONS[blog.coverIconName] ?? BookOpen;
  const authorInitials = getInitials(blog.author);
  const categorySlug = generateSlug(blog.category);
  const publishDate = blog.publishedAt ?? blog.createdAt;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    description: blog.excerpt,
    datePublished: new Date(publishDate).toISOString(),
    dateModified: new Date(blog.updatedAt ?? blog.createdAt).toISOString(),
    author: {
      "@type": "Person",
      name: blog.author || "Service Markaz Editorial Team",
      url: `${BASE}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: settings.siteName,
      url: BASE,
      logo: {
        "@type": "ImageObject",
        url: `${BASE}/images/logo.png`,
      },
    },
    image: blog.image || `${BASE}/images/meta-img.webp`,
    url: `${BASE}/blog/${slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE}/blog/${slug}`,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE}/blog` },
      { "@type": "ListItem", position: 3, name: blog.title, item: `${BASE}/blog/${slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {/* â”€â”€ Hero with image â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="relative min-h-[420px] flex items-end">
        <img
          src={blog.image}
          alt={blog.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${blog.coverGradient} opacity-70`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

        <div className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 pb-12 pt-28">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-white/60 mb-5 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <ChevronRight size={14} />
            <span className="text-white/40 truncate max-w-[200px]">{blog.category}</span>
          </nav>

          {/* Category chip */}
          <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 border border-white/30 text-white px-3 py-1 rounded-full mb-4 backdrop-blur-sm">
            <CoverIcon size={12} />
            {blog.category}
          </span>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight mb-5 max-w-3xl">
            {blog.title}
          </h1>

          {/* Meta bar */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-xs font-black text-white border-2 border-white/30">
                {authorInitials}
              </span>
              <span className="font-medium">{blog.author}</span>
            </span>
            <span className="w-px h-4 bg-white/30" />
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {new Date(publishDate).toLocaleDateString("en-PK", {
                month: "long", day: "numeric", year: "numeric",
              })}
            </span>
            <span className="w-px h-4 bg-white/30" />
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {blog.readTime}
            </span>
          </div>
        </div>
      </div>

      {/* â”€â”€ Main Content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Article body */}
          <main className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            {/* Excerpt lead */}
            <p className="text-lg text-gray-700 leading-relaxed border-l-4 border-blue-500 pl-5 mb-8 bg-blue-50 rounded-r-xl py-4 pr-5 font-medium">
              {blog.excerpt}
            </p>

            {/* Article content from TipTap */}
            <div className="blog-content" dangerouslySetInnerHTML={{ __html: blog.content }} />

            {/* Tags */}
            {blog.tags?.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-10 pt-8 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1 mr-1">
                  <Tag size={12} /> Topics:
                </span>
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-sm text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Prev / Next */}
            <div className="grid sm:grid-cols-2 gap-4 mt-10">
              {prevBlog ? (
                <Link
                  href={`/blog/${prevBlog.slug}`}
                  className="group bg-gray-50 hover:bg-blue-50 rounded-xl border border-gray-200 hover:border-blue-200 transition-all p-4 flex items-center gap-3"
                >
                  <ArrowLeft size={18} className="text-gray-400 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 mb-0.5">Previous</p>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 line-clamp-1 transition-colors">
                      {prevBlog.title}
                    </p>
                  </div>
                </Link>
              ) : <div />}
              {nextBlog ? (
                <Link
                  href={`/blog/${nextBlog.slug}`}
                  className="group bg-gray-50 hover:bg-blue-50 rounded-xl border border-gray-200 hover:border-blue-200 transition-all p-4 flex items-center gap-3 sm:justify-end text-right"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 mb-0.5">Next</p>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 line-clamp-1 transition-colors">
                      {nextBlog.title}
                    </p>
                  </div>
                  <ArrowRight size={18} className="text-gray-400 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
                </Link>
              ) : <div />}
            </div>
          </main>

          {/* Sidebar */}
          <aside className="lg:w-72 flex-shrink-0 space-y-5">
            {/* Author card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0">
                  {authorInitials}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{blog.author}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <User size={11} className="text-blue-500" />
                    Home Services Experts
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Practical advice from the Service Markaz team to help Pakistani
                homeowners find the right professionals and keep homes well-maintained.
              </p>
            </div>

            {/* More articles */}
            {sidebar.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-4">
                  <BookOpen size={15} className="text-blue-600" />
                  More Articles
                </h3>
                <div className="flex flex-col gap-3">
                  {sidebar.map((b) => (
                    <RelatedCard key={b._id.toString()} blog={b} />
                  ))}
                </div>
              </div>
            )}

            {/* Find a Pro CTA */}
            <div className="bg-primary rounded-2xl p-5 text-white text-center shadow-lg">
              <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Search size={22} className="text-white" />
              </div>
              <h3 className="font-bold text-base mb-2">Need a Professional?</h3>
              <p className="text-blue-100 text-xs mb-4 leading-relaxed">
                Find verified{" "}
                <span className="font-semibold text-white">{blog.category}</span> experts
                in your city right now.
              </p>
              <Link
                href={`/services?category=${categorySlug}`}
                className="inline-flex items-center gap-1.5 bg-white text-blue-600 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
              >
                Browse Providers
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Trust badge */}
            <div className="bg-[#00a676]/10 border border-[#00a676]/30 rounded-2xl p-4 text-center">
              <div className="flex justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} className="fill-[#00a676] text-[#00a676]" />
                ))}
              </div>
              <p className="text-sm font-semibold text-[#004d37]">Trusted by 1,000+ customers</p>
              <p className="text-xs text-[#00a676] mt-1">Verified reviews on every provider</p>
            </div>
          </aside>
        </div>
      </div>

      {/* Back to Blog */}
      <div className="text-center py-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors bg-white border border-blue-200 px-5 py-2.5 rounded-xl hover:bg-blue-50 shadow-sm"
        >
          <ArrowLeft size={16} />
          Back to all articles
        </Link>
      </div>

      {/* Business CTA */}
      <div className="pb-10">
        <BusinessCard
        title="Need a Trusted Service in Your Area?"
        subtitle="Find verified electricians, plumbers, tutors, and more on Service Markaz."
        buttonText="Explore Services"
        buttonHref="/services"
      />
      </div>
    </div>
  );
}

