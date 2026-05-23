import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/connect";
import City from "@/models/City";
import Category from "@/models/Category";
import { getSiteSettings } from "@/lib/settings";
import { getIconComponent } from "@/utils/iconMap";
import CategoriesGrid from "@/app/components/CategoriesGrid";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

// ISR: revalidate every hour
export const revalidate = 3600;

export async function generateStaticParams() {
  await connectDB();
  const cities = await City.find({ status: "active" }).select("slug").lean();
  return cities.map((city) => ({ city: city.slug }));
}

export async function generateMetadata({ params }) {
  const { city } = await params;

  await connectDB();
  const cityDoc = await City.findOne({ slug: city, status: "active" })
    .select("name slug description")
    .lean();

  if (!cityDoc) {
    return { title: "City Not Found | Service Markaz" };
  }

  const settings = await getSiteSettings();
  const cityName = cityDoc.name;
  const title = `Service Providers in ${cityName} | ${settings.siteName}`;
  const description =
    cityDoc.description ||
    `Find trusted local service providers in ${cityName} – electricians, plumbers, AC repair, home cleaning and more. Compare verified professionals and book today.`;
  const canonical = `${settings.siteUrl}/${city}`;

  return {
    title,
    description,
    keywords: [
      `services in ${cityName}`,
      `service providers ${cityName}`,
      `local services ${cityName} Pakistan`,
      `home services ${cityName}`,
      `electrician plumber ${cityName}`,
    ],
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const CityPage = async ({ params }) => {
  const { city } = await params;

  await connectDB();

  const [cityDoc, dbCategories, settings] = await Promise.all([
    City.findOne({ slug: city, status: "active" }).select("name slug description businessCount").lean(),
    Category.find({ isActive: true }).sort({ createdAt: 1 }).select("name slug icon color").lean(),
    getSiteSettings(),
  ]);

  if (!cityDoc) notFound();

  const cityName = cityDoc.name;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: settings.siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `Services in ${cityName}`,
        item: `${settings.siteUrl}/${city}`,
      },
    ],
  };

  // Map DB icon strings to React components
  const categories = dbCategories.map((cat) => ({
    ...cat,
    _id: cat._id.toString(),
    icon: getIconComponent(cat.icon),
  }));

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Service Providers in ${cityName} – ${settings.siteName}`,
    description: `Browse verified local service providers in ${cityName}, Pakistan. Find electricians, plumbers, AC repair, and more.`,
    url: `${settings.siteUrl}/${city}`,
    inLanguage: "en-PK",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: settings.siteUrl },
        { "@type": "ListItem", position: 2, name: cityName, item: `${settings.siteUrl}/${city}` },
      ],
    },
  };

  const cityEntityJsonLd = {
    "@context": "https://schema.org",
    "@type": "City",
    name: cityName,
    containedInPlace: { "@type": "Country", name: "Pakistan" },
    url: `${settings.siteUrl}/${city}`,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(cityEntityJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Hero Section */}
      <section className="bg-white px-4 md:px-0 py-14 text-center">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center justify-center gap-1.5 text-gray-500 text-sm mb-6"
        >
          <Link href="/" className="hover:text-blue-600 transition">
            Home
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-medium">{cityName}</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-800">
          Services in {cityName}
        </h1>
        <p className="mt-4 text-gray-600 max-w-xl mx-auto">
          Explore trusted, verified service providers available in {cityName}.
          Compare ratings and book local professionals with ease.
        </p>
        {cityDoc.businessCount > 0 && (
          <p className="mt-3 text-sm text-gray-500">
            <span className="font-semibold text-gray-700">{cityDoc.businessCount.toLocaleString()}</span> verified providers listed in {cityName}
          </p>
        )}
      </section>

      {/* Categories Grid */}
      <section className="max-w-6xl mx-auto px-6 py-14">

        {categories.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No categories available at the moment.
          </p>
        ) : (
          <CategoriesGrid
            categories={categories}
            href={(category) => `/${city}/${category.slug}`}
          />
        )}
      </section>
    </div>
  );
};

export default CityPage;
