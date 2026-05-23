"use client";

import React from 'react'
import { useParams } from 'next/navigation';
import SectionHeading from '@/app/components/ui/SectionHeading';
import CategoriesGrid from '@/app/components/CategoriesGrid';
import { useCategories } from '@/hooks/useCategories';

const Page = () => {
    const params = useParams();
    const city = params?.city || '';
    const cityName = city.charAt(0).toUpperCase() + city.slice(1);
    
    const { data: categories = [], isLoading, error } = useCategories();

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Hero Section */}
            <section className="bg-white py-14 text-center">
                <h1 className="text-4xl font-bold text-gray-800">
                    Services in {cityName}
                </h1>
                <p className="mt-4 text-gray-600">
                    Explore trusted service providers available in {cityName}.
                </p>
            </section>

            {/* Categories Section */}
            <section className="max-w-6xl mx-auto px-6 py-14">
                <SectionHeading
                    title={`Popular Categories in ${cityName}`}
                    subtitle="Select a category to view local service providers"
                />

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

                {!isLoading && !error && (
                    <CategoriesGrid 
                        categories={categories}
                        href={(category) => `/${city}/${category.slug}`}
                    />
                )}
            </section>

        </div>
    )
}

export default Page