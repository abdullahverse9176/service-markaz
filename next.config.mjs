/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dzphanpj80cza.cloudfront.net",
      },
      {
        // Legacy: existing DB records still reference Cloudinary URLs
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "service-markaz-assets.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async redirects() {
    return [
      // 301 permanent redirects: old /cities/* URLs → new clean SEO URLs
      {
        source: "/cities/:city/:category",
        destination: "/:city/:category",
        permanent: true,
      },
      {
        source: "/cities/:city",
        destination: "/:city",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
