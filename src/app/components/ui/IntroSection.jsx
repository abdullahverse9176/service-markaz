import React from 'react'

const IntroSection = ({title, subtitle}) => {
    return (
        <>
            <section className="text-center py-14 px-4">
                <h1 className="lg:text-3xl text-2xl font-bold text-gray-800">{title}</h1>
                <p className="mt-4 text-gray-600">{subtitle}</p>
            </section>

        </>
    )
}

export default IntroSection