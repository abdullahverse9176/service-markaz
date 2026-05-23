import React from 'react'
import { Search, UserCheck, BadgeCheck, ChevronRight } from 'lucide-react'

const HowItWorks = () => {

 const steps = [
  { 
    id: 1, 
    title: "Choose Your City", 
    desc: "Select the city where you need the service.",
    icon: Search,
    iconColor: "text-[#00a676]",
    iconBg: "bg-[#d8f9e8]"
  },
  { 
    id: 2, 
    title: "Browse Providers", 
    desc: "View verified professionals with ratings and reviews.",
    icon: UserCheck,
    iconColor: "text-[#f37c35]",
    iconBg: "bg-[#ffecd7]"
  },
  { 
    id: 3, 
    title: "Contact Directly", 
    desc: "Reach out via phone or WhatsApp — no middlemen.",
    icon: BadgeCheck,
    iconColor: "text-[#008f65]",
    iconBg: "bg-[#d4f3ed]"
  },
 ];

  return (
    <>
      <section className="bg-[#f4fcf8] py-16 py-lg-24 px-6 relative overflow-hidden">
        <div className="max-w-6xl w-full mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#111827]">How It Works</h2>
            <p className="mt-3 text-gray-500 text-lg">Get started in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="relative flex">
                  {/* Card Main */}
                  <div className="bg-white rounded-[2rem] p-8 pb-10 text-center shadow-[0_15px_40px_-10px_rgba(0,166,118,0.1)] border border-gray-50 w-full relative z-10 flex flex-col items-center">
                    
                    {/* Number Badge */}
                    <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#00a676] text-white flex items-center justify-center font-bold text-sm shadow-md">
                      {step.id}
                    </div>

                    {/* Circular Icon */}
                    <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-6 mt-4 ${step.iconBg} ${step.iconColor}`}>
                      <Icon size={32} strokeWidth={2.5} />
                    </div>

                    {/* Content */}
                    <h3 className="font-bold text-[#111827] text-xl mb-3">{step.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed px-2">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  )
}

export default HowItWorks