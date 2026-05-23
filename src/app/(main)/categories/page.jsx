"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import IntroSection from "@/app/components/ui/IntroSection";
import CategoriesGrid from "@/app/components/CategoriesGrid";
import CategorySearchBox from "@/app/components/CategorySearchBox";
import { useCategories } from "@/hooks/useCategories";
import BusinessCard from "@/app/components/ui/BusinessCard";

const introTitle = "Popular Categories";
const introSubtitle =
  "Find trusted professionals near you. Select a category to explore verified service providers available in your city.";

const MAX_CATEGORIES = 15;

export default function CategoriesPage() {
  const router = useRouter();
  const { data: categories = [], isLoading, error } = useCategories();

  const [searchInput, setSearchInput] = useState("");

  // JSON-LD for categories collection
  const categoriesJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Service Categories",
    description: "Browse all service categories available on Service Markaz",
    url: "https://servicemarkaz.com/categories",
    publisher: {
      "@type": "Organization",
      name: "Service Markaz",
      url: "https://servicemarkaz.com",
    },
  };

  // Filter or limit categories based on search
  const filteredCategories = searchInput.trim()
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(searchInput.toLowerCase())
      )
    : categories.slice(0, MAX_CATEGORIES);

  function handleSelect(slug) {
    router.push(`/categories/${slug}`);
  }

  function handleInputChange(text) {
    setSearchInput(text);
  }

  function handleClear() {
    setSearchInput("");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(categoriesJsonLd) }} />

      {/* Hero Section */}
      <IntroSection
        title={introTitle}
        subtitle={introSubtitle}
      />


      {/* Categories Grid */}
      <section className="max-w-6xl mx-auto px-6 lg:pt-4 xl:pt-6 pb-14">

        {/* Search Box */}
        <div className="max-w-xl mx-auto mb-8">
          <CategorySearchBox
            inputValue={searchInput}
            onInputChange={handleInputChange}
            onSelect={handleSelect}
            onClear={handleClear}
            placeholder="Search categories (plumber, electrician…)"
          />
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <p className="text-gray-600">Loading categories...</p>
          </div>
        )}

        {error && (
          <div className="flex justify-center py-12">
            <p className="text-red-600">Failed to load categories</p>
          </div>
        )}

        {!isLoading && !error && filteredCategories.length > 0 && (
          <CategoriesGrid categories={filteredCategories} />
        )}

        {!isLoading && !error && filteredCategories.length === 0 && searchInput && (
          <div className="flex justify-center py-12">
            <p className="text-gray-500">No categories found for &quot;{searchInput}&quot;</p>
          </div>
        )}

      </section>


      {/* CTA Section */}

      <BusinessCard
        title="Are You a Service Provider?"
        subtitle="List your services on Service Markaz and connect with new customers every day."
        buttonText="Add Your Business"
        buttonHref="/add-business"
        buttonText2="Browse Services"
        buttonHref2="/services"
      />

    </div>
  );
}