import Link from 'next/link'
import React from 'react'

const WhiteBtn = ({ title, href }) => {
  return (
    <Link href={href} className="w-full sm:w-auto px-8 py-3.5 bg-white text-[#00a676] font-semibold rounded-xl hover:bg-gray-50 transition shadow-md">
      {title}
    </Link>
  )
}

export default WhiteBtn