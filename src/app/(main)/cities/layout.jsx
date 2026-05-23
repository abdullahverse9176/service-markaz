export const metadata = {
  title: "Browse Services by City | Service Markaz",
  description:
    "Select your city to find trusted local service providers near you. Service Markaz covers Islamabad, Lahore, Karachi, Rawalpindi and more cities across Pakistan.",
  keywords: [
    "services by city Pakistan",
    "local service providers Islamabad",
    "local service providers Lahore",
    "local service providers Karachi",
    "home services Pakistan cities",
  ],
  alternates: { canonical: "/cities" },
  openGraph: {
    title: "Browse Services by City | Service Markaz",
    description:
      "Find trusted service providers in your city across Pakistan. Islamabad, Lahore, Karachi and more.",
    url: "/cities",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Services by City | Service Markaz",
    description: "Find trusted local service providers in your city across Pakistan.",
  },
};

export default function CitiesLayout({ children }) {
  return children;
}
