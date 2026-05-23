import React from 'react'
import Link from 'next/link'
import { Search, UserPlus, ArrowRight } from 'lucide-react'

const StartJourney = () => {
  return (
    <section className="bg-gradient-to-r from-[#0ea577] to-[#018094] py-10 lg:py-20 xl:py-23 px-6 relative overflow-hidden">
      <div className="max-w-6xl w-full mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight tracking-tight">
            Start Your Service Journey Today
          </h2>
          <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Whether you need a service or want to offer your expertise, Service Markaz<br className="hidden md:block" /> is here for you
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          {/* Card 1 */}
          <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_15px_40px_-5px_rgba(0,0,0,0.15)] flex flex-col h-full transform transition duration-300 hover:-translate-y-1">
            <div className="w-16 h-16 bg-[#d1f9e5] text-[#00a676] rounded-2xl flex items-center justify-center mb-8">
              <Search size={28} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl md:text-[1.7rem] font-bold text-[#111827] mb-3">Looking for Services?</h3>
            <p className="text-gray-500 mb-10 leading-relaxed grow text-[15px]">
              Browse thousands of verified professionals ready to help with your needs
            </p>
            <Link 
              href="/services" 
              className="inline-flex items-center gap-2 bg-[#00a676] hover:bg-[#008f65] text-white px-7 py-3.5 rounded-xl font-semibold w-fit transition shadow-md shadow-[#00a676]/20"
            >
              Search Services
              <ArrowRight size={18} strokeWidth={2.5} />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_15px_40px_-5px_rgba(0,0,0,0.15)] flex flex-col h-full transform transition duration-300 hover:-translate-y-1">
            <div className="w-16 h-16 bg-[#ffecd7] text-[#ea580c] rounded-2xl flex items-center justify-center mb-8">
              <UserPlus size={28} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl md:text-[1.7rem] font-bold text-[#111827] mb-3">Want to Offer Services?</h3>
            <p className="text-gray-500 mb-10 leading-relaxed grow text-[15px]">
              Join our platform and connect with customers looking for your skills
            </p>
            <Link 
              href="/add-business" 
              className="inline-flex items-center gap-2 bg-[#ea580c] hover:bg-[#d84e03] text-white px-7 py-3.5 rounded-xl font-semibold w-fit transition shadow-md shadow-[#ea580c]/20"
            >
              Register Now
              <ArrowRight size={18} strokeWidth={2.5} />
            </Link>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-12">
          <p className="text-white/90 text-sm">
            Have questions?{' '}
            <Link href="/contact-us" className="font-semibold underline hover:text-white transition decoration-white/70 underline-offset-4">
              Contact our support team
            </Link>
          </p>
        </div>

      </div>
    </section>
  )
}

export default StartJourney