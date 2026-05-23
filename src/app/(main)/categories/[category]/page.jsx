import Link from "next/link";
import { categories } from "@/data/categories";
import { getCities } from "@/lib/cities";
import { getSiteSettings } from "@/lib/settings";
import {
  MapPin,
  CheckCircle,
  Star,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import CitiesCard from "@/app/components/CitiesCard";
import BusinessCard from "@/app/components/ui/BusinessCard";

// ISR: revalidate every hour
export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { category } = await params;
  const categoryObj = categories.find((cat) => cat.slug === category);

  if (!categoryObj) {
    return { title: "Category Not Found | Service Markaz" };
  }

  const settings = await getSiteSettings();
  const title = `${categoryObj.name} Services in Pakistan | ${settings.siteName}`;
  const description =
    categoryObj.description ||
    `Find verified ${categoryObj.name.toLowerCase()} professionals across Pakistan on Service Markaz. Browse by city, compare ratings, reviews, and prices. Available in 30+ cities.`;

  return {
    title,
    description,
    keywords: [
      `${categoryObj.name.toLowerCase()} Pakistan`,
      `best ${categoryObj.name.toLowerCase()} Pakistan`,
      `${categoryObj.name.toLowerCase()} near me`,
      `hire ${categoryObj.name.toLowerCase()} Pakistan`,
      `${categoryObj.name.toLowerCase()} services`,
    ],
    alternates: { canonical: `/categories/${category}` },
    openGraph: {
      title,
      description,
      url: `/categories/${category}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const CategoryPage = async ({ params }) => {
  const { category } = await params;
  const settings = await getSiteSettings();
  const cities = await getCities();

  const categoryObj = categories.find((cat) => cat.slug === category);

  if (!categoryObj) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="text-3xl font-bold text-gray-800">Category not found</h1>
          <p className="mt-2 text-gray-500">The category you're looking for doesn't exist.</p>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 mt-6 text-blue-600 font-medium hover:underline"
          >
            <ArrowRight size={16} className="rotate-180" /> Back to categories
          </Link>
        </div>
      </div>
    );
  }

  const Icon = categoryObj.icon;

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${categoryObj.name} Services in Pakistan`,
    description:
      categoryObj.description ||
      `Find verified ${categoryObj.name.toLowerCase()} professionals across Pakistan on Service Markaz.`,
    areaServed: { "@type": "Country", name: "Pakistan" },
    provider: {
      "@type": "Organization",
      name: settings.siteName,
      url: settings.siteUrl,
    },
    serviceType: categoryObj.name,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: settings.siteUrl },
      { "@type": "ListItem", position: 2, name: "Categories", item: `${settings.siteUrl}/categories` },
      { "@type": "ListItem", position: 3, name: categoryObj.name, item: `${settings.siteUrl}/categories/${category}` },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0ea577] via-[#0c8c64] to-[#018094] text-white">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-5 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#018094] opacity-20 blur-3xl pointer-events-none"></div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-12 sm:pt-10 sm:pb-16">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-emerald-100/80 text-xs sm:text-sm mb-8 sm:mb-10 overflow-x-auto whitespace-nowrap pb-2 scrollbar-none">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight size={14} className="opacity-70" />
            <Link href="/categories" className="hover:text-white transition">Categories</Link>
            <ChevronRight size={14} className="opacity-70" />
            <span className="text-white font-medium">{categoryObj.name}</span>
          </nav>

          <div className="flex flex-col items-center text-center sm:text-left sm:flex-row sm:items-start gap-6 sm:gap-8">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 blur-xl rounded-full"></div>
              <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 sm:p-5 shadow-xl">
                <Icon size={48} strokeWidth={1.5} className="text-white drop-shadow-sm sm:w-[40px] sm:h-[40px]" />
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-sm">
                {categoryObj.name}
              </h1>
              <p className="text-emerald-50/90 text-base sm:text-lg max-w-xl mx-auto sm:mx-0 font-medium">
                Find highly rated, verified {categoryObj.name.toLowerCase()} professionals across Pakistan
              </p>

              <div className="flex flex-wrap justify-center sm:justify-start gap-2.5 sm:gap-3 mt-6 sm:mt-8">
                <div className="flex items-center gap-2 bg-black/10 hover:bg-black/20 transition-colors backdrop-blur-md rounded-xl px-4 py-2 border border-white/10">
                  <MapPin size={16} className="text-emerald-200" /> 
                  <span className="text-sm font-medium">{isLoading ? "..." : cities.length} Cities</span>
                </div>
                <div className="flex items-center gap-2 bg-black/10 hover:bg-black/20 transition-colors backdrop-blur-md rounded-xl px-4 py-2 border border-white/10">
                  <CheckCircle size={16} className="text-emerald-200" /> 
                  <span className="text-sm font-medium">Verified Pros</span>
                </div>
                <div className="flex items-center gap-2 bg-black/10 hover:bg-black/20 transition-colors backdrop-blur-md rounded-xl px-4 py-2 border border-white/10">
                  <Star size={16} className="text-emerald-200" /> 
                  <span className="text-sm font-medium">Top Rated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── City Selection ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Select Your City</h2>
          <p className="mt-2 text-gray-500">
            Choose your city to browse local {categoryObj.name.toLowerCase()}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {isLoading && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600">Loading cities...</p>
            </div>
          )}

          {error && (
            <div className="col-span-full text-center py-12">
              <p className="text-red-600">Failed to load cities</p>
            </div>
          )}

          {!isLoading && !error && cities.length > 0 && cities.map((city) => (

            <CitiesCard key={city.slug} city={city} categoryObj={categoryObj} />

          ))}

          {!isLoading && !error && cities.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No cities available at the moment</p>
            </div>
          )}
        </div>
      </section>

      {/* <HowItWorks /> */}

      {/* ── Trust Features ── */}
      {/* <ChooseUs /> */}


      <BusinessCard
            title={`Offer ${categoryObj.name} Services?`}
            subtitle="List your business on Service Markaz and reach thousands of customers in your city for free."
            buttonText="Find a Service"
            buttonHref="/services"
            buttonText2="Register as Provider"
            buttonHref2="/add-business"
        />

    </div>
  );
};

export default CategoryPage;
