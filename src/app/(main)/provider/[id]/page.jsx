import { providers } from "@/data/providers";
import { findProviderBySlug, extractIdFromSlug } from "@/utils/slug";
import { getBusinessById, normalizeBusiness } from "@/lib/businesses";
import Review from "@/models/Review";
import { buildProviderSchema } from "@/utils/schema";
import { getSiteSettings } from "@/lib/settings";
import { connectDB } from "@/lib/db/connect";
import ProfileHeader from "@/app/components/profile-components/ProfileHeader";
import AboutSection from "@/app/components/profile-components/AboutSection";
import ServicesSection from "@/app/components/profile-components/ServicesSection";
import ExperienceSection from "@/app/components/profile-components/ExperienceSection";
import ServiceAreasSection from "@/app/components/profile-components/ServiceAreasSection";
import PricingSection from "@/app/components/profile-components/PricingSection";
import ReviewsSection from "@/app/components/profile-components/ReviewsSection";
import ContactSection from "@/app/components/profile-components/ContactSection";
import LocationSection from "@/app/components/profile-components/LocationSection";
import SocialLinksSection from "@/app/components/profile-components/SocialLinksSection";
import ViewTracker from "@/app/components/ViewTracker";

// ISR: provider profile pages are cached for 5 minutes; stale-while-revalidate
export const revalidate = 300;

/**
 * Scores a normalised provider object 0–100.
 * Profiles scoring below 60 are thin and should not be indexed by search engines.
 */
function getCompletenessScore(provider) {
  let score = 0;
  if (provider.name) score += 10;
  if (provider.image) score += 15;
  if (provider.about && provider.about.length >= 100) score += 15;
  if (provider.services && provider.services.length >= 3) score += 15;
  if (provider.contact?.phone) score += 15;
  if (parseFloat(provider.pricing?.calloutFee) > 0) score += 10;
  if (provider.reviews >= 1) score += 20;
  return score; // max 100
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const extracted = extractIdFromSlug(id);
  let provider = null;

  if (extracted?.type === "mongo") {
    provider = await getBusinessById(extracted.id);
  } else {
    const staticProvider = findProviderBySlug(id, providers);
    provider = staticProvider ? normalizeBusiness(staticProvider) : null;
  }

  if (!provider) {
    return { title: "Provider Not Found | Service Markaz" };
  }

  // Thin profiles (< 60 completeness score) should not consume crawl budget
  if (getCompletenessScore(provider) < 60) {
    return {
      title: `${provider.name} | Service Markaz`,
      robots: { index: false, follow: true },
    };
  }

  const title = `${provider.name} – ${provider.category} in ${provider.city} | Service Markaz`;
  const description =
    provider.about ||
    `${provider.name} is a trusted ${provider.category} provider in ${provider.city}. View profile, ratings, reviews and contact details on Service Markaz.`;
  const canonical = `/provider/${id}`;

  return {
    title,
    description,
    keywords: [
      `${provider.name}`,
      `${provider.category} in ${provider.city}`,
      `best ${provider.category} ${provider.city}`,
    ],
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "profile" },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const page = async ({ params }) => {
  const { id } = await params;

  // Try MongoDB first (slug ends with 24-char ObjectId)
  // Fall back to static data for legacy numeric slugs
  const extracted = extractIdFromSlug(id);
  let provider = null;
  let topReviews = [];

  if (extracted?.type === "mongo") {
    await connectDB();
    const [biz, revs] = await Promise.all([
      getBusinessById(extracted.id),
      Review.find({ business: extracted.id, status: "published" })
        .populate("user", "name")
        .select("rating comment createdAt user")
        .sort({ createdAt: -1 })
        .limit(3)
        .lean(),
    ]);
    provider = biz;
    topReviews = revs;
  } else {
    const staticProvider = findProviderBySlug(id, providers);
    // Normalize static data to ensure all expected fields exist
    provider = staticProvider ? normalizeBusiness(staticProvider) : null;
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Provider Not Found</h1>
          <a href="/" className="text-blue-600 hover:underline">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  const settings = await getSiteSettings();
  const pageUrl = `${settings.siteUrl}/provider/${id}`;

  const providerJsonLd = buildProviderSchema({
    provider,
    reviews: topReviews,
    siteUrl: settings.siteUrl,
    pageUrl,
  });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: settings.siteUrl },
      { "@type": "ListItem", position: 2, name: provider.city, item: `${settings.siteUrl}/${provider.citySlug || provider.city?.toLowerCase().replace(/\s+/g, "-")}` },
      { "@type": "ListItem", position: 3, name: provider.category, item: `${settings.siteUrl}/${provider.citySlug || provider.city?.toLowerCase().replace(/\s+/g, "-")}/${provider.category?.toLowerCase().replace(/\s+/g, "-")}` },
      { "@type": "ListItem", position: 4, name: provider.name, item: pageUrl },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8 lg:py-8 pt-0 sm:pt-4">
      {/* Silent view tracker — fires once per session */}
      {provider.id && <ViewTracker businessId={provider.id} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(providerJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div className="max-w-6xl mx-auto px-0 sm:px-4 lg:px-6 relative">
        {/* Profile Header */}
        <ProfileHeader provider={provider} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-0">
          {/* Left Column */}
          <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
            <div className="lg:hidden">
              <ContactSection provider={provider} businessId={provider.id} />
            </div>
            <AboutSection provider={provider} />
            <ServicesSection provider={provider} />
            <ExperienceSection provider={provider} />
            <ServiceAreasSection provider={provider} />
            <LocationSection provider={provider} />
            <PricingSection provider={provider} />
            <SocialLinksSection provider={provider} />
            <ReviewsSection
              businessId={provider.id}
              ownerId={provider.owner?._id}
            />
          </div>

          {/* Right Column - Sticky Contact */}
          <div className="hidden lg:block lg:sticky lg:top-6 lg:h-fit">
            <ContactSection provider={provider} businessId={provider.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
