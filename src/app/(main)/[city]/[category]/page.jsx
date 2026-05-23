import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/connect";
import City from "@/models/City";
import Category from "@/models/Category";
import Business from "@/models/Business";
import { getBusinesses } from "@/lib/businesses";
import { getSiteSettings } from "@/lib/settings";
import ProviderCard from "@/app/components/ProviderCard";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

// ISR: revalidate every hour
export const revalidate = 3600;

export async function generateStaticParams() {
  await connectDB();
  const [cities, categories] = await Promise.all([
    City.find({ status: "active" }).select("slug").lean(),
    Category.find({ isActive: true }).select("slug").lean(),
  ]);
  return cities.flatMap((city) =>
    categories.map((cat) => ({
      city: city.slug,
      category: cat.slug,
    }))
  );
}

export async function generateMetadata({ params }) {
  const { city, category } = await params;

  await connectDB();

  const [cityDoc, categoryDoc] = await Promise.all([
    City.findOne({ slug: city, status: "active" }).select("name").lean(),
    Category.findOne({ slug: category, isActive: true }).select("name description").lean(),
  ]);

  if (!cityDoc || !categoryDoc) {
    return { title: "Not Found | Service Markaz" };
  }

  // noindex pages that have no active businesses — protects domain quality score
  const businessCount = await Business.countDocuments({
    status: "active",
    category: categoryDoc.name,
    city: { $regex: new RegExp(`^${city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
  });

  if (businessCount === 0) {
    return {
      title: `${categoryDoc.name} in ${cityDoc.name} | Service Markaz`,
      robots: {
        index: false,
        follow: true,
        googleBot: { index: false, follow: true },
      },
    };
  }

  const settings = await getSiteSettings();
  const cityName = cityDoc.name;
  const categoryName = categoryDoc.name;
  const title = `${categoryName} in ${cityName} | ${settings.siteName}`;
  const description =
    businessCount === 1
      ? `Looking for a ${categoryName.toLowerCase()} in ${cityName}? We have ${businessCount} verified provider available. Compare ratings and contact directly via WhatsApp or phone — free on ${settings.siteName}.`
      : `Looking for a ${categoryName.toLowerCase()} in ${cityName}? Browse ${businessCount} verified providers, compare ratings, and contact them directly via WhatsApp or phone — free on ${settings.siteName}.`;
  const canonical = `${settings.siteUrl}/${city}/${category}`;

  return {
    title,
    description,
    keywords: [
      `${categoryName.toLowerCase()} in ${cityName}`,
      `best ${categoryName.toLowerCase()} ${cityName}`,
      `${categoryName.toLowerCase()} near me ${cityName}`,
      `hire ${categoryName.toLowerCase()} ${cityName}`,
      `${cityName} ${categoryName.toLowerCase()} service`,
      `${categoryName.toLowerCase()} ${cityName} Pakistan`,
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

const CityCategoryPage = async ({ params }) => {
  const { city, category } = await params;

  await connectDB();

  const [cityDoc, categoryDoc, { businesses: providers }, settings] = await Promise.all([
    City.findOne({ slug: city, status: "active" }).select("name").lean(),
    Category.findOne({ slug: category, isActive: true }).select("name description").lean(),
    getBusinesses({ city, category }),
    getSiteSettings(),
  ]);

  if (!cityDoc || !categoryDoc) notFound();

  const cityName = cityDoc.name;
  const categoryName = categoryDoc.name;

  // ── Stats ──────────────────────────────────────────────────────────────
  const totalProviders = providers.length;
  const validRatings = providers.filter((p) => p.rating > 0).map((p) => p.rating);
  const avgRating =
    validRatings.length > 0
      ? (validRatings.reduce((a, b) => a + b, 0) / validRatings.length).toFixed(1)
      : null;
  const totalReviews = providers.reduce((sum, p) => sum + (p.reviews || 0), 0);

  // Price range from callout fees (stored as strings in DB)
  const calloutFees = providers
    .map((p) => parseFloat(p.pricing?.calloutFee))
    .filter((v) => !isNaN(v) && v > 0);
  const minFee = calloutFees.length > 0 ? Math.min(...calloutFees) : null;
  const maxFee = calloutFees.length > 0 ? Math.max(...calloutFees) : null;

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
        name: cityName,
        item: `${settings.siteUrl}/${city}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${categoryName} in ${cityName}`,
        item: `${settings.siteUrl}/${city}/${category}`,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How do I find a verified ${categoryName.toLowerCase()} in ${cityName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `You can find verified ${categoryName.toLowerCase()} in ${cityName} on ${settings.siteName}. All listed providers are reviewed before approval. Browse profiles, compare ratings, and contact them directly via phone or WhatsApp.`,
        },
      },
      {
        "@type": "Question",
        name: `Are ${categoryName.toLowerCase()} on ${settings.siteName} reliable?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes. ${settings.siteName} only lists providers who have been reviewed and approved. You can read real customer reviews for each ${categoryName.toLowerCase()} in ${cityName} before making a decision.`,
        },
      },
      {
        "@type": "Question",
        name: `Can I contact a ${categoryName.toLowerCase()} in ${cityName} on WhatsApp?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes. Most ${categoryName.toLowerCase()} in ${cityName} listed on ${settings.siteName} are available on WhatsApp. Each provider profile includes a direct WhatsApp contact button.`,
        },
      },
      {
        "@type": "Question",
        name: `How many ${categoryName.toLowerCase()} are available in ${cityName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `There are currently ${totalProviders} verified ${categoryName.toLowerCase()} listed in ${cityName} on ${settings.siteName}. New providers are added regularly.`,
        },
      },
      {
        "@type": "Question",
        name: `Is it free to contact a ${categoryName.toLowerCase()} on ${settings.siteName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes. Contacting any ${categoryName.toLowerCase()} in ${cityName} through ${settings.siteName} is completely free. There are no booking fees or commissions.`,
        },
      },
    ],
  };

  // Add pricing FAQ when callout fee data exists
  if (minFee) {
    faqJsonLd.mainEntity.push({
      "@type": "Question",
      name: `What is the cost of ${categoryName} service in ${cityName}?`,
      acceptedAnswer: {
        "@type": "Answer",
        text:
          maxFee && maxFee !== minFee
            ? `The callout fee for ${categoryName} services in ${cityName} typically ranges from Rs. ${minFee.toLocaleString()} to Rs. ${maxFee.toLocaleString()} depending on the provider.`
            : `The callout fee for ${categoryName} services in ${cityName} starts from Rs. ${minFee.toLocaleString()}.`,
      },
    });
  }

  // Roman Urdu FAQ questions — targets Urdu voice search and AI Overviews
  faqJsonLd.mainEntity.push(
    {
      "@type": "Question",
      name: `${cityName} mein ${categoryName.toLowerCase()} ka number kahan se milega?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `${settings.siteName} par ${cityName} mein ${totalProviders} verified ${categoryName.toLowerCase()} listed hain. Aap seedha unka phone number ya WhatsApp number hasil kar sakte hain — bilkul free.`,
      },
    },
    {
      "@type": "Question",
      name: `${cityName} mein ${categoryName.toLowerCase()} ka rate kya hai?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: minFee
          ? `${cityName} mein ${categoryName.toLowerCase()} ka callout fee Rs. ${minFee.toLocaleString()}${maxFee && maxFee !== minFee ? ` se Rs. ${maxFee.toLocaleString()} tak` : ""} hota hai. Exact rate provider se seedha pooch sakte hain.`
          : `${cityName} mein ${categoryName.toLowerCase()} ka rate kaam ke hisaab se alag hota hai. ${settings.siteName} par profiles dekh kar directly quote le sakte hain.`,
      },
    }
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${categoryName} in ${cityName}`,
    description: `List of trusted ${categoryName.toLowerCase()} service providers in ${cityName}, Pakistan`,
    url: `${settings.siteUrl}/${city}/${category}`,
    inLanguage: "en-PK",
    numberOfItems: providers.length,
    itemListElement: providers.slice(0, 10).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "LocalBusiness",
        name: p.name,
        description: p.about || `${categoryName} service provider in ${cityName}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: cityName,
          addressCountry: "PK",
        },
        ...(p.rating > 0 && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: p.rating,
            reviewCount: p.reviews || 1,
          },
        }),
      },
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

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
          <Link href={`/${city}`} className="hover:text-blue-600 transition">
            {cityName}
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-medium">{categoryName}</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-800">
          {categoryName} in {cityName}
        </h1>
        <p className="mt-4 text-gray-600 max-w-xl mx-auto">
          Browse trusted, verified {categoryName.toLowerCase()} service providers
          available in {cityName}. Compare ratings, reviews, and book today.
        </p>

        {/* Stats bar */}
        {totalProviders > 0 && (
          <div className="mt-8 flex flex-wrap justify-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{totalProviders}</p>
              <p className="text-sm text-gray-500 mt-0.5">Verified Providers</p>
            </div>
            {avgRating && (
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">⭐ {avgRating}</p>
                <p className="text-sm text-gray-500 mt-0.5">Avg Rating</p>
              </div>
            )}
            {totalReviews > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{totalReviews.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-0.5">Customer Reviews</p>
              </div>
            )}
            {minFee && (
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">Rs. {minFee.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-0.5">Starting Fee</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Providers List */}
      <section className="max-w-6xl mx-auto px-6 py-14">

        {providers.length === 0 ? (
          <div className="text-center py-14">
            <p className="text-gray-600 text-lg">
              No {categoryName.toLowerCase()} found in {cityName} yet.
            </p>
            <Link
              href="/add-business"
              className="inline-block mt-4 text-blue-600 hover:underline font-medium"
            >
              List your business here →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CityCategoryPage;
