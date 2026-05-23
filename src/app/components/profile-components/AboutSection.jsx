import { FileText } from "lucide-react";

export default function AboutSection({ provider }) {
  if (!provider.about) return null;

  return (
    <div className="bg-white sm:shadow-sm sm:rounded-2xl p-5 sm:p-6 border-b sm:border-none border-gray-100">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg">
          <FileText size={18} className="text-blue-600" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">About</h2>
      </div>
      <p className="text-gray-600 leading-relaxed text-sm sm:text-base whitespace-pre-line">{provider.about}</p>
    </div>
  );
}
