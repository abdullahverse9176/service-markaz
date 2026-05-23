import { connectDB } from "@/lib/db/connect";
import City from "@/models/City";
import CitiesSlider from "./CitiesSlider";

export default async function CitiesSection() {
  await connectDB();

  const raw = await City.find({ status: "active" })
    .sort({ businessCount: -1 })
    .select("name slug image businessCount")
    .lean();

  if (!raw.length) return null;

  // Serialize: strip non-plain fields (_id, __v, etc.) before passing to Client Component
  const cities = raw.map(({ name, slug, image, businessCount }) => ({
    name,
    slug,
    image: image ?? null,
    businessCount: businessCount ?? 0,
  }));

  return (
    <section className="py-10 py-lg-16 bg-gray-50 border-t border-gray-100">
      <div className="max-w-6xl w-full mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3">
            Browse by City
          </span>
          <h2 className="text-3xl font-bold text-gray-900">
            Find Providers Near You
          </h2>
          <p className="text-gray-500 mt-2">
            Serving {raw.length} cities across Pakistan — more coming soon
          </p>
        </div>

        {/* Cities Swiper Slider */}
        <CitiesSlider cities={cities} />
      </div>
    </section>
  );
}
