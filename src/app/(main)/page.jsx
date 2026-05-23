import HeroSection from "../components/home/HeroSection";
import HowItWorks from "../components/home/HowItWorks";
import FeaturedProviders from "../components/home/FeaturedProviders";
import ChooseUs from "../components/home/ChooseUs";
import CategoriesSection from "../components/home/CategoriesSection";
import CitiesSection from "../components/home/CitiesSection";
import AddBusinessCTA from "../components/home/AddBusinessCTA";
import StatsSection from "../components/home/StatsSection";
import FaqSection from "../components/home/FaqSection";
import StartJourney from "../components/home/StartJourney";
import TrustSection from "../components/home/TrustSection";
import { getSiteSettings } from "@/lib/settings";

export const revalidate = 1800;

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const title = `${settings.siteName} – Find Local Service Providers in Pakistan`;
  const description =
    "Find trusted electricians, plumbers, AC repair, carpenters and more in your city. Service Markaz connects you with verified professionals across Pakistan.";
  return {
    title,
    description,
    alternates: { canonical: settings.siteUrl },
    openGraph: {
      title,
      description:
        "Find trusted electricians, plumbers, AC repair, carpenters and more in your city across Pakistan.",
      url: settings.siteUrl,
    },
  };
}

export default async function Home() {
  const settings = await getSiteSettings();

  const sameAs = Object.values(settings.socialLinks).filter(Boolean);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteName,
    alternateName: ["ServiceMarkaz", "سروس مرکز", "Service Markaz Pakistan"],
    url: settings.siteUrl,
    description:
      "Service Markaz is Pakistan's trusted local services marketplace connecting homeowners and businesses with verified electricians, plumbers, AC repair technicians, carpenters, painters, and other professionals across 30+ cities.",
    areaServed: {
      "@type": "Country",
      name: "Pakistan",
    },
    knowsAbout: [
      "Local Services Pakistan",
      "Home Services",
      "Service Providers",
      "Electricians Pakistan",
      "Plumbers Pakistan",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Home & Local Services",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Electrician Services" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Plumber Services" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "AC Repair Services" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Carpenter Services" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Painter Services" } },
      ],
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Urdu"],
    },
    ...(sameAs.length > 0 && { sameAs }),
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.siteName,
    url: settings.siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${settings.siteUrl}/services?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is ${settings.siteName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${settings.siteName} is Pakistan's local services marketplace where you can find and hire verified electricians, plumbers, AC repair technicians, carpenters, painters, and other professionals across 30+ cities.`,
        },
      },
      {
        "@type": "Question",
        name: `Is ${settings.siteName} free to use?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes. Finding and contacting service providers on ${settings.siteName} is completely free. There are no booking fees or commissions charged to customers.`,
        },
      },
      {
        "@type": "Question",
        name: "How do I find a service provider near me in Pakistan?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Visit ${settings.siteName}, select your city, choose the service you need, and browse verified professionals in your area. You can contact them directly via phone or WhatsApp.`,
        },
      },
      {
        "@type": "Question",
        name: `Which cities does ${settings.siteName} cover?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${settings.siteName} covers Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, and 20+ other cities across Pakistan.`,
        },
      },
      {
        "@type": "Question",
        name: `Are service providers on ${settings.siteName} verified?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes. All service providers go through a review process before being listed on ${settings.siteName}. You can also read real customer reviews and check ratings before hiring.`,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HeroSection />
      <CategoriesSection />
      <TrustSection />
      <FeaturedProviders />
      <CitiesSection />
      <HowItWorks />
      <StatsSection />
      <ChooseUs />
      <AddBusinessCTA />
      <FaqSection />
      <StartJourney />
    </>
  );
}
