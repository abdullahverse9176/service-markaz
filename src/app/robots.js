import { getSiteSettings } from "@/lib/settings";

export default async function robots() {
  const settings = await getSiteSettings();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/sign-in",
          "/sign-up",
          "/forgot-password",
          "/verify-email",
          "/provider-profile",
          "/customer-profile",
          "/edit-business",
          "/add-business",
          "/referrals",
          "/upload-test",
          // Block URL parameter variants to protect crawl budget
          "/*?print=",
          "/*?share=",
          "/*?ref=",
          "/*?utm_",
        ],
      },
      {
        userAgent: "Googlebot-Image",
        allow: "/",
        disallow: [],
      },
    ],
    sitemap: `${settings.siteUrl}/sitemap.xml`,
    host: settings.siteUrl,
  };
}
