import Link from 'next/link'
import React from 'react'

const GreenOutlineBtn = ({ title, href }) => {
    return (
        <>
            <Link href={href} className="w-full sm:w-auto px-8 py-3.5 bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold rounded-xl text-lg transition shadow-sm">
                {title}
            </Link>
        </>
    )
}

export default GreenOutlineBtn