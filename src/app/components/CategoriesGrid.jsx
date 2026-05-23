import React from 'react';
import Link from 'next/link';

const ICON_COLORS = [
  "bg-[#fff3cd] text-[#b45309]", // Yellow/Orange
  "bg-[#dbeafe] text-[#1d4ed8]", // Blue
  "bg-[#f3e8ff] text-[#7e22ce]", // Purple
  "bg-[#fce7f3] text-[#be185d]", // Pink
  "bg-[#dcfce7] text-[#15803d]", // Green
  "bg-[#ffe4e6] text-[#b91c1c]", // Rose
  "bg-[#f1f5f9] text-[#334155]", // Slate
  "bg-[#ffedd5] text-[#c2410c]", // Orange
  "bg-[#e0e7ff] text-[#4338ca]", // Indigo
  "bg-[#ccfbf1] text-[#047857]", // Teal
];

const CategoriesGrid = ({ 
  categories, 
  href = (category) => `/categories/${category.slug}`,
  className = "w-[45%] sm:w-[30%] md:w-[22%] lg:w-[22%] xl:w-[23%]"
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
      {categories.map((category, index) => {
        const Icon = category.icon;
        const colorClass = ICON_COLORS[index % ICON_COLORS.length];
        return (
          <Link
            key={category.slug}
            href={href(category)}
            className={`${className} bg-white border border-gray-100 rounded-2xl py-8 px-4 text-center transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,143,101,0.15)] hover:-translate-y-1 hover:border-[#008f65] flex flex-col items-center justify-center`}
          >
            <div className={`w-14 h-14 flex items-center justify-center rounded-2xl mb-5 ${colorClass}`}>
              <Icon strokeWidth={2} size={24} />
            </div>
            <p className="font-semibold text-gray-800 text-sm sm:text-base">
              {category.name}
            </p>
          </Link>
        );
      })}
    </div>
  );
};

export default CategoriesGrid;
