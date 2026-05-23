import React from 'react'
import { Shield, Clock, Award, Headphones } from 'lucide-react'

const trustFeatures = [
  {
    id: 1,
    icon: Shield,
    title: "Secure & Verified",
    desc: "100% Background Checked"
  },
  {
    id: 2,
    icon: Clock,
    title: "24/7 Support",
    desc: "Always Here to Help"
  },
  {
    id: 3,
    icon: Award,
    title: "Quality Guarantee",
    desc: "Satisfaction Assured"
  },
  {
    id: 4,
    icon: Headphones,
    title: "Easy Booking",
    desc: "Quick & Simple Process"
  }
];

const TrustSection = () => {
  return (
    <section className="bg-gradient-to-r my-10 from-[#0ba37a] to-[#0086a5] py-10 px-6">
      <div className="max-w-6xl w-full mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {trustFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.id} className="flex items-center gap-4 sm:gap-5 group">
                <div className="w-[3.5rem] h-[3.5rem] bg-white/15 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:bg-white/25">
                  <Icon className="text-white" size={26} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-white font-bold text-base md:text-[17px] leading-tight mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-white/80 text-[13px] md:text-sm leading-tight">
                    {feature.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  )
}

export default TrustSection