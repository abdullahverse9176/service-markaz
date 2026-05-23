import { Award, Clock } from "lucide-react";

export default function ExperienceSection({ provider }) {
  const years = provider.experience_details?.years ?? provider.experience;
  if (!years && years !== 0) return null;

  return (
    <div className="bg-white sm:shadow-sm sm:rounded-2xl p-5 sm:p-6 border-b sm:border-none border-gray-100">
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <div className="p-1.5 sm:p-2 bg-purple-50 rounded-lg">
          <Award size={18} className="text-purple-600" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Experience</h2>
      </div>

      <div className="flex items-center gap-4 bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
        <div className="p-3 bg-white rounded-xl shadow-sm inline-flex">
          <Clock size={20} className="text-blue-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Total Experience</p>
          <p className="text-2xl font-bold text-blue-700 leading-none">
            {years} <span className="text-sm font-medium text-blue-500">years</span>
          </p>
        </div>
      </div>
    </div>
  );
}
