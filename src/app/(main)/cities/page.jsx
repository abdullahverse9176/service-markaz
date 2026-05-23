"use client";

import React from 'react'
import IntroSection from '@/app/components/ui/IntroSection'
import SectionHeading from '@/app/components/ui/SectionHeading'
import Link from "next/link";
import { useCities } from '@/hooks/useCities';
import CitiesCard from '@/app/components/CitiesCard';
import BusinessCard from '@/app/components/ui/BusinessCard';

const CitiesPage = () => {
  const { data: cities = [], isLoading, error } = useCities();

  const citiesJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Cities We Serve",
    description: "Browse all cities where Service Markaz operates across Pakistan",
    url: "https://servicemarkaz.com/cities",
    publisher: {
      "@type": "Organization",
      name: "Service Markaz",
      url: "https://servicemarkaz.com",
    },
  };

  const introContent = {
    title: "Available Cities",
    subtitle: `Click on your city to browse services near you`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(citiesJsonLd) }} />
      <IntroSection title={introContent.title} subtitle={introContent.subtitle} />

      {/* Cities Grid */}
      <section className="max-w-6xl w-full mx-auto px-6 pb-14">

        {isLoading && (
          <div className="flex justify-center py-12">
            <p className="text-gray-600">Loading cities...</p>
          </div>
        )}

        {error && (
          <div className="flex justify-center py-12">
            <p className="text-red-600">Failed to load cities</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="flex flex-wrap justify-center gap-6">
            {cities.map((city) => (
              <CitiesCard
                key={city.slug} city={city}
                variant="simple"
              />
            ))}
          </div>
        )}
      </section>

      <BusinessCard
        title="Find Services in Your City"
        subtitle="Explore trusted service providers near you and get work done quickly and easily."
        buttonText="Add Your Business"
        buttonHref="/add-business"
        buttonText2="Browse Services"
        buttonHref2="/services"
      />

    </div>
  )
}

export default CitiesPage