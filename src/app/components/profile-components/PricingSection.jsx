import { DollarSign, Phone as PhoneIcon, BadgeDollarSign } from "lucide-react";

const priceCards = [
  {
    key: "calloutFee",
    label: "Service Call Fee",
    icon: PhoneIcon,
    color: "from-blue-50 to-blue-100",
    iconBg: "bg-blue-600",
    textColor: "text-blue-700",
  },
  {
    key: "minCharge",
    label: "Minimum Charge",
    icon: BadgeDollarSign,
    color: "from-purple-50 to-purple-100",
    iconBg: "bg-purple-600",
    textColor: "text-purple-700",
  },
];

export default function PricingSection({ provider }) {
  if (!provider.pricing || (!provider.pricing.calloutFee && !provider.pricing.hourlyRate && !provider.pricing.minCharge)) return null;

  return (
    <div className="bg-white sm:shadow-sm sm:rounded-2xl p-5 sm:p-6 border-b sm:border-none border-gray-100">
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <div className="p-1.5 sm:p-2 bg-green-50 rounded-lg">
          <DollarSign size={18} className="text-green-600" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Pricing</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {priceCards.map(({ key, label, icon: Icon, color, iconBg, textColor }) => {
          if (!provider.pricing[key]) return null;
          return (
            <div
              key={key}
              className={`bg-gradient-to-br ${color} p-3 sm:p-4 rounded-xl flex flex-col gap-2 sm:gap-3`}
            >
              <div className={`w-8 h-8 sm:w-9 sm:h-9 ${iconBg} rounded-lg flex items-center justify-center`}>
                <Icon size={16} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
                <p className={`text-lg sm:text-xl font-bold ${textColor} mt-0.5`}>{provider.pricing[key]}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
