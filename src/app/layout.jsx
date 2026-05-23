import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/app/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://servicemarkaz.com"),
  title: {
    default: "Service Markaz – Find Local Service Providers in Pakistan",
    template: "%s | Service Markaz",
  },
  description:
    "Service Markaz connects you with trusted local service providers — electricians, plumbers, AC repair, carpenters and more — across cities in Pakistan. Compare ratings, read reviews, and book today.",
  keywords: [
    "service providers Pakistan",
    "electrician in Pakistan",
    "plumber near me",
    "home services Pakistan",
    "local services booking Pakistan",
  ],
  authors: [{ name: "Service Markaz" }],
  creator: "Service Markaz",
  icons: {
    icon: "/images/fav-icon.png",
    shortcut: "/images/fav-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    siteName: "Service Markaz",
    type: "website",
    locale: "en_PK",
    images: [
      {
        url: "/images/meta-img.webp",
        width: 1200,
        height: 630,
        alt: "Service Markaz – Find Local Service Providers in Pakistan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@servicemarkaz",
    images: ["/images/meta-img.webp"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
