export const metadata = {
  title: "Home Service Expert Blog | Service Markaz",
  description: "Practical guides, hiring tips, and maintenance advice for home services in Pakistan. Expert articles on electricians, plumbers, AC repair, carpentry, and more.",
  keywords: [
    "home services blog Pakistan",
    "electrician tips Pakistan",
    "plumber advice",
    "AC repair guide",
    "home maintenance Pakistan",
    "service provider tips",
  ],
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Home Service Expert Blog | Service Markaz",
    description: "Expert tips and guides for finding and hiring home service professionals in Pakistan",
    url: "/blog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Home Service Expert Blog | Service Markaz",
    description: "Expert tips and guides for home services in Pakistan",
  },
};

export default function BlogLayout({ children }) {
  return children;
}
