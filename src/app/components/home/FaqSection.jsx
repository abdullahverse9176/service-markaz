"use client";
import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import GreenBtn from '../buttons/GreenBtn';

const FAQs = [
  {
    question: "How do I book a service provider?",
    answer: "Simply search for the service you need, browse through verified providers, check their ratings and reviews, and click \"Book Now\". You can also contact them directly through our platform."
  },
  {
    question: "Are all service providers verified?",
    answer: "Yes, all service providers go through a strict background check and verification process before they are listed on our platform to ensure safety and quality."
  },
  {
    question: "What if I am not satisfied with the service?",
    answer: "Customer satisfaction is our priority. If you face any issues, you can file a complaint with our support team, and we will work with the provider to resolve it promptly."
  },
  {
    question: "How much does it cost to use Service Markaz?",
    answer: "Service Markaz is free for customers to browse and contact providers. The service charges are negotiated directly with the professional based on the job requirements."
  },
  {
    question: "Can I become a service provider?",
    answer: "Absolutely! Simply click on \"Register as Provider\", fill in your details, and our team will verify your profile before you can start receiving booking requests."
  },
  {
    question: "Which cities do you operate in?",
    answer: "Currently, we operate in all major cities across Pakistan. You can check provider availability in your specific area by using our location search."
  }
];

const FaqSection = () => {
  const [openIdx, setOpenIdx] = useState(0);

  const toggleFaq = (index) => {
    setOpenIdx(openIdx === index ? null : index);
  };

  return (
    <section className="bg-[#f4fcf8] py-10 lg:py-24 px-6">
      <div className="max-w-6xl w-full mx-auto">
        <div className="max-w-3xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-[#111827]">Frequently Asked Questions</h2>
          <p className="mt-3 text-gray-500 text-base">Got questions? We have got answers!</p>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          {FAQs.map((faq, index) => {
            const isOpen = openIdx === index;
            return (
              <div 
                key={index} 
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                >
                  <span className="font-semibold text-[15px] text-[#111827]">
                    {faq.question}
                  </span>
                  <ChevronDown 
                    size={20} 
                    className={`text-[#00a676] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
                  />
                </button>
                <div 
                  className={`px-5 text-sm text-gray-500 leading-relaxed transition-all duration-300 ease-in-out ${isOpen ? "pb-5 max-h-40 opacity-100" : "max-h-0 pb-0 opacity-0"}`}
                >
                  {faq.answer}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Support Box */}
        <div className="mt-10 bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-[#111827] mb-2">Still have questions?</h3>
          <p className="text-gray-500 text-sm mb-6">Our support team is here to help you 24/7</p>

          <GreenBtn title="Contact Support" href="/contact-us" />
          
        </div>

      </div>
      </div>
    </section>
  )
}

export default FaqSection