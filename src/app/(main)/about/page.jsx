import { getSiteSettings } from "@/lib/settings";
import Link from "next/link";

export const revalidate = 86400;

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return {
    title: `About ${settings.siteName} | Connecting Islamabad, Rawalpindi & Chiniot with Local Services`,
    description: `${settings.siteName} connects residents of Islamabad, Rawalpindi, and Chiniot with verified electricians, plumbers, AC repair technicians, and other trusted local professionals.`,
    alternates: { canonical: `${settings.siteUrl}/about` },
    openGraph: {
      title: `About ${settings.siteName}`,
      description: `${settings.siteName} connects residents of Islamabad, Rawalpindi, and Chiniot with verified local service professionals — completely free.`,
      url: `${settings.siteUrl}/about`,
    },
    twitter: {
      card: "summary_large_image",
      title: `About ${settings.siteName}`,
      description: `${settings.siteName} connects residents of Islamabad, Rawalpindi, and Chiniot with verified local service professionals.`,
    },
  };
}

export default async function AboutPage() {
  const settings = await getSiteSettings();

  const sameAs = Object.values(settings.socialLinks ?? {}).filter(Boolean);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteName,
    alternateName: ["ServiceMarkaz", "سروس مرکز", "Service Markaz Pakistan"],
    url: settings.siteUrl,
    logo: `${settings.siteUrl}/logo.png`,
    description:
      `${settings.siteName} is a local services marketplace connecting residents of Islamabad, Rawalpindi, and Chiniot with verified, trusted local professionals including electricians, plumbers, AC repair technicians, carpenters, and more.`,
    foundingDate: "2024",
    foundingLocation: { "@type": "Place", name: "Islamabad, Pakistan" },
    areaServed: [
      {
        "@type": "City",
        name: "Islamabad",
        containedIn: { "@type": "Country", name: "Pakistan" }
      },
      {
        "@type": "City",
        name: "Rawalpindi",
        containedIn: { "@type": "Country", name: "Pakistan" }
      },
      {
        "@type": "City",
        name: "Chiniot",
        containedIn: { "@type": "Country", name: "Pakistan" }
      }
    ],
    ...(sameAs.length > 0 && { sameAs }),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Urdu"],
    },
    knowsAbout: [
      "Local Services Islamabad",
      "Local Services Rawalpindi",
      "Local Services Chiniot",
      "Electricians Islamabad",
      "Plumbers Rawalpindi",
      "AC Repair Islamabad",
      "Home Services Pakistan",
      "Service Provider Directory",
    ],
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: settings.siteUrl },
      { "@type": "ListItem", position: 2, name: "About", item: `${settings.siteUrl}/about` },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <section className="max-w-5xl mx-auto px-6 lg:pt-4 xl:pt-6 pb-14">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-10">
          <Link href="/" className="hover:text-blue-600 transition">Home</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">About</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-800 mb-6">About {settings.siteName}</h1>

        {/* Primary entity paragraph */}
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          <strong>{settings.siteName}</strong> is a trusted local services marketplace,
          connecting residents and businesses in <strong>Islamabad</strong>, <strong>Rawalpindi</strong>, 
          and <strong>Chiniot</strong> with verified service professionals who can help with home repairs, 
          maintenance, and improvement projects.
        </p>

        <p className="text-gray-600 leading-relaxed mb-6">
          Our platform makes it easy to find, compare, and contact verified electricians,
          plumbers, AC repair technicians, carpenters, painters, home cleaners, and other
          local professionals — all in one place, completely free.
        </p>

        <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">Our Story</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          {settings.siteName} was founded with a simple mission: to make finding reliable local 
          service providers easier and more transparent for everyone. We started in the twin cities 
          of Islamabad and Rawalpindi, where finding trustworthy professionals was often a challenge 
          based on word-of-mouth alone.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Today, we're proud to serve residents across Islamabad, Rawalpindi, and Chiniot, 
          helping thousands of customers connect with skilled professionals every month.
        </p>

        <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">What We Do</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          {settings.siteName} is a local service discovery platform. We verify service providers
          before listing them, aggregate real customer reviews, and give users a direct
          way to contact professionals via phone or WhatsApp.
        </p>
        <p className="text-gray-600 leading-relaxed">
          <strong>We do not charge booking fees or commissions</strong> — finding a provider is 
          completely free for customers. Service providers can list their businesses for free and 
          connect directly with potential customers.
        </p>

        <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">Our Mission</h2>
        <p className="text-gray-600 leading-relaxed">
          To make finding trusted local professionals in Islamabad, Rawalpindi, and Chiniot as 
          easy, transparent, and reliable as possible — helping homeowners get quality work done 
          and helping skilled professionals grow their businesses.
        </p>

        <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">Cities We Serve</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
          <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Islamabad</h3>
            <p className="text-gray-600 text-sm">
              Pakistan's capital city, known for its modern infrastructure and planned sectors. 
              We connect residents across all sectors with verified service professionals.
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Rawalpindi</h3>
            <p className="text-gray-600 text-sm">
              The twin city of Islamabad, with a rich history and vibrant commercial areas. 
              Find trusted professionals across Saddar, Bahria Town, DHA, and more.
            </p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chiniot</h3>
            <p className="text-gray-600 text-sm">
              Famous for its furniture craftsmanship and historical architecture. 
              Connect with skilled carpenters, electricians, and other local professionals.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">What We Offer</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-teal-600 font-bold">✓</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Verified Service Providers</h3>
              <p className="text-gray-600 text-sm">
                All providers go through a verification process to ensure authenticity and quality.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-teal-600 font-bold">✓</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Real Customer Reviews</h3>
              <p className="text-gray-600 text-sm">
                Read honest reviews from real customers to make informed decisions.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-teal-600 font-bold">✓</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Direct Contact</h3>
              <p className="text-gray-600 text-sm">
                Contact providers directly via phone or WhatsApp — no middleman, no booking fees.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-teal-600 font-bold">✓</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Multiple Service Categories</h3>
              <p className="text-gray-600 text-sm">
                From electricians to plumbers, AC repair to home cleaning — find all services in one place.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-teal-600 font-bold">✓</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Bilingual Support</h3>
              <p className="text-gray-600 text-sm">
                Available in both English and Urdu for your convenience.
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">For Service Providers</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Are you a skilled professional looking to grow your business? {settings.siteName} helps 
          you reach more customers in your area.
        </p>
        <ul className="text-gray-600 space-y-2 list-disc list-inside ml-4">
          <li>List your business for free</li>
          <li>Get verified to build trust with customers</li>
          <li>Receive leads directly via phone and WhatsApp</li>
          <li>Build your reputation with customer reviews</li>
          <li>Grow your business with our referral program</li>
        </ul>
        <div className="mt-6">
          <Link 
            href="/add-business" 
            className="inline-block px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition"
          >
            List Your Business Free
          </Link>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">Our Commitment</h2>
        <p className="text-gray-600 leading-relaxed">
          We are committed to maintaining a platform that is transparent, trustworthy, and helpful 
          for both customers and service providers. We continuously work to improve our verification 
          processes, enhance user experience, and expand our coverage to serve more communities.
        </p>

        <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">Contact Us</h2>
        <p className="text-gray-600">
          Have questions or feedback? We'd love to hear from you. Visit our{" "}
          <Link href="/contact-us" className="text-teal-600 hover:text-teal-700 font-semibold underline">
            Contact page
          </Link>{" "}
          to get in touch.
        </p>
      </section>
    </div>
  );
}
