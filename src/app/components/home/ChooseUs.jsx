import React from 'react'
import { Shield, Zap, Users, ThumbsUp } from "lucide-react";

const ChooseUs = () => {

  const features = [
    {
      Icon: Shield,
      title: "Verified Providers",
      desc: "All service providers are background-checked and verified for your safety and peace of mind.",
      iconBg: "bg-[#d1f9e5]",
      iconColor: "text-[#059669]",
    },
    {
      Icon: Zap,
      title: "Fast Response",
      desc: "Get quick responses from nearby professionals. Most providers respond within minutes.",
      iconBg: "bg-[#ffecd7]",
      iconColor: "text-[#f97316]",
    },
    {
      Icon: Users,
      title: "Trusted Community",
      desc: "Join thousands of satisfied customers who have found reliable services through our platform.",
      iconBg: "bg-[#ccfbf1]",
      iconColor: "text-[#0d9488]",
    },
    {
      Icon: ThumbsUp,
      title: "Quality Assured",
      desc: "Read genuine reviews and ratings to make informed decisions about your service provider.",
      iconBg: "bg-[#fef3c7]",
      iconColor: "text-[#d97706]",
    },
  ];

  return (
    <>
      <section className="bg-[#fffdf9] py-10 lg:py-16 xl:py-24 px-6 relative">
        <div className="max-w-6xl w-full mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#111827]">Why Choose Service Markaz?</h2>
            <p className="mt-3 text-gray-500 text-lg">Your trusted partner for local services</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {features.map(({ Icon: FeatureIcon, title, desc, iconBg, iconColor }) => (
              <div key={title} className="flex flex-col items-center text-center group">
                <div className={`w-20 h-20 ${iconBg} rounded-[1.5rem] flex items-center justify-center mb-6 transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-105 shadow-sm`}>
                  <FeatureIcon size={32} strokeWidth={2} className={iconColor} />
                </div>
                <h3 className="font-bold text-[#111827] text-lg mb-3">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed px-2 lg:px-0">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default ChooseUs