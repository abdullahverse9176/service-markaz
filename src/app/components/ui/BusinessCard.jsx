import React from 'react'
import WhiteBtn from '../buttons/WhiteBtn'
import WhiteOutlineBtn from '../buttons/WhiteOutlineBtn';

const BusinessCard = ({ title, subtitle, buttonText, buttonHref, buttonText2, buttonHref2 }) => {
    return (
        <>
            <section className="py-10 lg:py-20 px-6 max-w-6xl w-full mx-auto">
                <div className="bg-gradient-to-r from-[#00a676] to-[#008c99] text-white rounded-3xl py-14 px-6 sm:px-12 text-center shadow-[0_25px_50px_-12px_rgba(0,166,118,0.35)] relative overflow-hidden">
                    {/* Decorative background light splat */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute -top-24 -right-10 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-24 -left-10 w-72 h-72 bg-white opacity-5 rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative z-10">
                        {title && <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            {title}
                        </h2>}

                        {subtitle && <p className="text-base md:text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                            {subtitle}
                        </p>}

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

                            {buttonText && <WhiteBtn title={buttonText} href={buttonHref} />}
                            {buttonText2 && <WhiteOutlineBtn title={buttonText2} href={buttonHref2} />}

                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default BusinessCard