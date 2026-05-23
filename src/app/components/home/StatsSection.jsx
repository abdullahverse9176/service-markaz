import React from 'react'
import { Users, Briefcase, Star, MapPin } from 'lucide-react'

const StatsSection = () => {
  const stats = [
    {
      id: 1,
      icon: Users,
      iconClass: "bg-gradient-to-b from-[#00d2aa] to-[#00a676] shadow-[0_8px_20px_rgba(0,166,118,0.4)]",
      number: "50,000+",
      label: "Happy Customers",
    },
    {
      id: 2,
      icon: Briefcase,
      iconClass: "bg-gradient-to-b from-[#ff9f43] to-[#f97316] shadow-[0_8px_20px_rgba(249,115,22,0.4)]",
      number: "3,200+",
      label: "Verified Providers",
    },
    {
      id: 3,
      icon: Star,
      iconClass: "bg-gradient-to-b from-[#ffc107] to-[#f59e0b] shadow-[0_8px_20px_rgba(245,158,11,0.4)]",
      number: "4.8/5",
      label: "Average Rating",
    },
    {
      id: 4,
      icon: MapPin,
      iconClass: "bg-gradient-to-b from-[#38bdf8] to-[#0284c7] shadow-[0_8px_20px_rgba(2,132,199,0.4)]",
      number: "25+",
      label: "Cities Covered",
    },
  ];

  return (
    <section className="py-7 lg:py-12 bg-white px-6">
      <div className="max-w-6xl w-full mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.id} 
                className="bg-white border border-gray-100 rounded-[1.5rem] p-8 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-transform hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)]"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 ${stat.iconClass}`}>
                  <Icon size={28} strokeWidth={2} />
                </div>
                <h3 className="font-bold text-3xl text-[#111827] mb-2 leading-tight">
                  {stat.number}
                </h3>
                <p className="text-gray-500 font-medium text-sm">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  )
}

export default StatsSection