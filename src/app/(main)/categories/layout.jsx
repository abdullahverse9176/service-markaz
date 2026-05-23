export const metadata = {
  title: "Service Categories | Service Markaz",
  description:
    "Browse all service categories on Service Markaz — electricians, plumbers, AC repair, carpenters, home cleaning, tutors and more. Find trusted professionals across Pakistan.",
  keywords: [
    "service categories Pakistan",
    "home services Pakistan",
    "local services categories",
    "electrician plumber Pakistan",
    "AC repair carpenter Pakistan",
  ],
  alternates: { canonical: "/categories" },
  openGraph: {
    title: "Service Categories | Service Markaz",
    description: "Browse all service categories and find trusted professionals across Pakistan",
    url: "/categories",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Service Categories | Service Markaz",
    description: "Browse all service categories across Pakistan",
  },
};

export default function CategoriesLayout({ children }) {
  return children;
}
