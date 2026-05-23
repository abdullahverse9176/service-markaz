import { Wrench, CheckCircle2 } from "lucide-react";

export default function ServicesSection({ provider }) {
  if (!provider.services || provider.services.length === 0) return null;

  return (
    <div className="bg-white sm:shadow-sm sm:rounded-2xl p-5 sm:p-6 border-b sm:border-none border-gray-100">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div className="p-1.5 sm:p-2 bg-orange-50 rounded-lg">
          <Wrench size={18} className="text-orange-500" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Services Offered</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {provider.services.map((service, index) => (
          <div
            key={index}
            className="flex items-start gap-2.5 p-3 bg-gray-50/50 sm:bg-gradient-to-r sm:from-blue-50 sm:to-indigo-50 border border-gray-100 sm:border-blue-100 rounded-xl hover:border-blue-300 transition"
          >
            <CheckCircle2 size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700 text-sm font-medium leading-relaxed">{service}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
