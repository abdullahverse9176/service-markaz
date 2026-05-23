import React from 'react'
import Link from 'next/link'

const GreenLinkBtn = ({ title, href }) => {
    return (
        <>
            <Link href={href} className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl text-lg transition shadow-lg shadow-primary/30">
                {title}
            </Link>
        </>
    )
}

export default GreenLinkBtn