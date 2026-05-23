/**
 * SEO Schema Utilities
 * Helper functions for building JSON-LD structured data across pages.
 * All functions are pure — no DB calls, no side effects.
 */

/**
 * Map a Pakistani city name or slug to its province/region.
 * Handles both display names ("Islamabad") and slugs ("islamabad").
 */
export function getCityRegion(city) {
  if (!city) return "Pakistan";
  const key = city.toLowerCase().replace(/-/g, "");
  const map = {
    karachi: "Sindh",
    hyderabad: "Sindh",
    sukkur: "Sindh",
    larkana: "Sindh",
    lahore: "Punjab",
    faisalabad: "Punjab",
    rawalpindi: "Punjab",
    gujranwala: "Punjab",
    multan: "Punjab",
    sialkot: "Punjab",
    bahawalpur: "Punjab",
    sargodha: "Punjab",
    gujrat: "Punjab",
    sheikhupura: "Punjab",
    islamabad: "Islamabad Capital Territory",
    peshawar: "Khyber Pakhtunkhwa",
    abbottabad: "Khyber Pakhtunkhwa",
    mardan: "Khyber Pakhtunkhwa",
    quetta: "Balochistan",
    turbat: "Balochistan",
    muzaffarabad: "Azad Kashmir",
  };
  return map[key] || "Pakistan";
}

/**
 * Build a human-readable price range string from a provider's pricing object.
 * Returns undefined if no valid pricing data exists.
 * Pricing values are stored as strings in DB — always parseFloat().
 */
export function buildPriceRange(pricing) {
  if (!pricing) return undefined;
  const callout = parseFloat(pricing.calloutFee);
  const hourly = parseFloat(pricing.hourlyRate);
  const minimum = parseFloat(pricing.minCharge);

  if (callout > 0 && hourly > 0)
    return `Rs. ${callout.toLocaleString()} – Rs. ${hourly.toLocaleString()}/hr`;
  if (callout > 0) return `Rs. ${callout.toLocaleString()} callout fee`;
  if (hourly > 0) return `Rs. ${hourly.toLocaleString()}/hr`;
  if (minimum > 0) return `From Rs. ${minimum.toLocaleString()}`;
  return undefined;
}

/**
 * Normalize a Pakistani phone number to E.164 (+92xxxxxxxxxx) format.
 * Accepts: "03001234567", "923001234567", "+923001234567"
 * Returns undefined if the input cannot be normalized.
 */
export function formatPakistaniPhone(phone) {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("92") && digits.length >= 12) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 11) return `+92${digits.slice(1)}`;
  return undefined;
}

/**
 * Build a full LocalBusiness JSON-LD object for a provider page.
 * Pass `reviews` as top-N review docs (populated with user.name).
 * Pass `siteUrl` from getSiteSettings().siteUrl.
 */
export function buildProviderSchema({ provider, reviews = [], siteUrl, pageUrl }) {
  const phone = formatPakistaniPhone(provider.contact?.phone);
  const priceRange = buildPriceRange(provider.pricing);

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",

    name: provider.name,
    description:
      provider.about ||
      `${provider.title || provider.name} – ${provider.category} service provider in ${provider.city}, Pakistan.`,
    url: pageUrl,

    ...(phone && { telephone: phone }),

    address: {
      "@type": "PostalAddress",
      ...(provider.area && { streetAddress: provider.area }),
      addressLocality: provider.city,
      addressRegion: getCityRegion(provider.city),
      addressCountry: "PK",
    },

    // GeoJSON — coordinates stored as [longitude, latitude]
    ...(provider.location?.coordinates?.length === 2 && {
      geo: {
        "@type": "GeoCoordinates",
        longitude: provider.location.coordinates[0],
        latitude: provider.location.coordinates[1],
      },
    }),

    ...(priceRange && { priceRange }),

    // AggregateRating — only include when there are real reviews
    ...(provider.reviews > 0 && provider.rating > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: Number(provider.rating).toFixed(1),
        reviewCount: provider.reviews,
        bestRating: "5",
        worstRating: "1",
      },
    }),

    // Top reviews (max 3) from DB
    ...(reviews.length > 0 && {
      review: reviews.slice(0, 3).map((r) => ({
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: String(r.rating),
          bestRating: "5",
          worstRating: "1",
        },
        author: {
          "@type": "Person",
          name: r.user?.name || "Verified Customer",
        },
        reviewBody: r.comment,
        ...(r.createdAt && {
          datePublished: new Date(r.createdAt).toISOString().split("T")[0],
        }),
      })),
    }),

    // Services offered as OfferCatalog
    ...(provider.services?.length > 0 && {
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: `${provider.category} Services`,
        itemListElement: provider.services.map((svc) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: svc },
        })),
      },
    }),

    // Opening hours — only when provider is marked Available
    ...(provider.availability === "Available" && {
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
        ],
        opens: "08:00",
        closes: "20:00",
      },
    }),

    ...(provider.profileImage && { image: provider.profileImage }),

    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "verified",
        value: provider.verification ? "true" : "false",
      },
      ...(provider.experience > 0
        ? [{ "@type": "PropertyValue", name: "experience", value: `${provider.experience} years` }]
        : []),
    ],
  };

  return schema;
}
