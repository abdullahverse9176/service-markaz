import SectionHeading from "@/app/components/ui/SectionHeading";
import ProviderCard from "@/app/components/ProviderCard";
import { categories } from "@/data/categories";
import { getBusinesses } from "@/lib/businesses";

const page = async ({ params }) => {

    const { city, category } = await params;

    // Capitalize city nicely and resolve category display name
    const cityName = city ? city.charAt(0).toUpperCase() + city.slice(1) : "";
    const categoryObj = categories.find((cat) => cat.slug === category);
    const categoryName = categoryObj ? categoryObj.name : category;

    // Fetch live providers from MongoDB for this city & category
    const { businesses: providers } = await getBusinesses({ city, category });

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Hero Section */}
            <section className="bg-white py-14 text-center">
                <h1 className="text-4xl font-bold text-gray-800">
                    {categoryName} in {cityName}
                </h1>
                <p className="mt-4 text-gray-600">
                    Browse trusted {categoryName} service providers available in {cityName}.
                </p>
            </section>

            {/* Providers List */}
            <section className="max-w-6xl mx-auto px-6 py-14">
                <SectionHeading
                    title={`Available ${categoryName} in ${cityName}`}
                    subtitle="Click on a provider to view details"
                />

                {providers.length === 0 ? (
                    <p className="text-center text-gray-600">No providers found in this category for {cityName}.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {providers.map((provider) => (
                            <ProviderCard
                                key={provider.id}
                                provider={provider}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

export default page