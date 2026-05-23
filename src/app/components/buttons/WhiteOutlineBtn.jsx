import React from 'react'
import Link from 'next/link'

const WhiteBtn = ({ title, href }) => {
  return (
    <Link href={href} className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-white text-white font-semibold rounded-xl hover:text-[#00a676] hover:bg-white transition">
      {title}
    </Link>
  )
}

export default WhiteBtn