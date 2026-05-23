import React from 'react'
import Link from "next/link";

const ServiceCard = ({ id, name, category, city, href }) => {
  return (
    <Link
      href={href || `/services/${id}`}
      className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 text-center hover:shadow-md hover:-translate-y-1 transition w-[45%] sm:w-[30%] md:w-[22%]"
    >
      {/* Optional: Add an icon or image here */}
      <div className="text-gray-800 font-semibold text-lg">{name}</div>
      {category && <p className="text-gray-600 mt-1">{category}</p>}
      {city && <p className="text-gray-500 mt-1 text-sm">{city}</p>}
    </Link>

  )
}

export default ServiceCard