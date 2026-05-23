import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import BusinessesClient from "@/app/components/BusinessesClient";

// ── SEO metadata — dynamically generated from URL filter params ─────────────
export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const category = params?.category || "";
  const city = params?.city || "";

  const titleParts = [];
  if (category) titleParts.push(category.replace(/-/g, " "));
  if (city) titleParts.push(`in ${city.replace(/-/g, " ")}`);

  const title = titleParts.length
    ? `${titleParts.join(" ")} — Service Providers | Service Markaz`
    : "Find Service Providers Near You | Service Markaz";

  const description = [
    "Browse",
    category ? `${category.replace(/-/g, " ")} professionals` : "trusted service providers",
    city ? `in ${city.replace(/-/g, " ")}` : "across Pakistan",
    "— verified plumbers, electricians, painters & more on Service Markaz.",
  ].join(" ");

  const canonical = buildCanonicalURL({ category, city });

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Service Markaz",
      type: "website",
    },
    // Structured data keywords help Google surface this page for "near me" searches
    keywords: [
      category ? `${category.replace(/-/g, " ")} near me` : "service providers near me",
      city ? `${category || "services"} in ${city.replace(/-/g, " ")}` : "local services Pakistan",
      "plumber near me",
      "electrician near me",
      "home services Pakistan",
      "Service Markaz",
    ].join(", "),
  };
}

function buildCanonicalURL({ category, city }) {
  // When both city and category are set, canonical → the priority /{city}/{category} URL
  // This consolidates link equity onto the high-value SEO pages instead of /services params
  if (city && category) return `/${city}/${category}`;
  const base = "/services";
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (city) params.set("city", city);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

// ── JSON-LD structured data for Google (LocalBusiness / SearchAction) ────────
function ServiceListingSchema({ category, city }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Service Providers",
    description: `Find verified ${category || "service"} providers ${city ? `in ${city}` : "across Pakistan"} on Service Markaz.`,
    url: buildCanonicalURL({ category, city }),
    inLanguage: "en-PK",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://servicemarkaz.com/services?category={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://servicemarkaz.com" },
      { "@type": "ListItem", position: 2, name: "Services", item: "https://servicemarkaz.com/services" },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I find a service provider near me?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Use the filters on this page to select your city and service category. You can also enable location services to find providers closest to you.",
        },
      },
      {
        "@type": "Question",
        name: "Are all service providers verified?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, all service providers on Service Markaz go through a verification process before being listed. You can also read customer reviews and ratings.",
        },
      },
      {
        "@type": "Question",
        name: "Is it free to contact service providers?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, contacting service providers through Service Markaz is completely free. There are no booking fees or commissions.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}

// ── Page component ────────────────────────────────────────────────────────────
export default async function ServicesPage({ searchParams }) {
  const params = await searchParams;

  const category = params?.category?.trim() || "";
  const city = params?.city?.trim() || "";
  const sort = params?.sort?.trim() || "rating";
  const available = params?.available === "1";
  const verified = params?.verified === "1";
  const page = Math.max(1, parseInt(params?.page || "1", 10));
  const lat = params?.lat ? parseFloat(params.lat) : null;
  const lng = params?.lng ? parseFloat(params.lng) : null;

  return (
    <>
      <ServiceListingSchema category={category} city={city} />

      {/* Suspense because BusinessesClient reads searchParams via useSearchParams */}
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={36} />
          </div>
        }
      >
        <BusinessesClient
          initialCategory={category}
          initialCity={city}
          initialSort={sort}
          initialAvailable={available}
          initialVerified={verified}
          initialPage={page}
          initialLat={lat}
          initialLng={lng}
        />
      </Suspense>
    </>
  );
}
