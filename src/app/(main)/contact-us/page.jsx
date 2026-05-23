"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  MapPin,
  Clock,
  Headphones,
} from "lucide-react";
import IntroSection from "@/app/components/ui/IntroSection";
import FormSection from "@/app/components/Form/FormSection";
import InputField from "@/app/components/Form/InputField";
import TextAreaField from "@/app/components/Form/TextAreaField";
import SelectBox from "@/app/components/Form/SelectBox";
import { subjectOptions } from "@/lib/contact/constants";

const phonePattern = {
  value: /^03[0-9]{9}$/,
  message: "Enter valid Pakistani number (03XXXXXXXXX)",
};

export default function ContactUsPage() {
  const [submitState, setSubmitState] = useState("idle");

  const contactPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Service Markaz",
    description: "Contact page for Service Markaz customer support and inquiries",
    url: "https://servicemarkaz.com/contact-us",
    mainEntity: {
      "@type": "Organization",
      name: "Service Markaz",
      url: "https://servicemarkaz.com",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: ["English", "Urdu"],
        hoursAvailable: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "09:00",
          closes: "18:00",
        },
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Rawalpindi",
        addressRegion: "Punjab",
        addressCountry: "PK",
      },
    },
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    setSubmitState("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      setSubmitState("success");
      reset();
    } catch {
      setSubmitState("error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd) }} />
      <IntroSection
        title="Contact Us"
        subtitle="Have a question or need help? We're here for you. Fill out the form below and we'll get back to you shortly."
      />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 pt-2">
        {/* Info Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Our Location</p>
              <p className="text-xs text-gray-500 mt-1">Rawalpindi, Punjab, Pakistan</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Support Hours</p>
              <p className="text-xs text-gray-500 mt-1">Mon – Sat, 9:00 AM – 6:00 PM</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Headphones size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Response Time</p>
              <p className="text-xs text-gray-500 mt-1">We reply within 24 hours</p>
            </div>
          </div>
        </div>

        {/* Form Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Send Us a Message</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Fields marked <span className="text-red-500 font-semibold">*</span> are required.
          </p>
        </div>

        {/* Success / Error banners */}
        {submitState === "success" && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-4 mb-8">
            <CheckCircle size={22} className="flex-shrink-0 text-green-500" />
            <div>
              <p className="font-semibold">Message sent successfully!</p>
              <p className="text-sm text-green-600">Thank you for reaching out. We'll get back to you within 24 hours.</p>
            </div>
          </div>
        )}
        {submitState === "error" && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 mb-8">
            <AlertCircle size={22} className="flex-shrink-0" />
            <p className="font-semibold">Something went wrong. Please try again.</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-6 max-w-3xl mx-auto"
        >
          {/* Personal Info */}
          <FormSection
            icon={User}
            title="Your Information"
            subtitle="Tell us who you are"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <InputField
                label="Full Name *"
                icon={User}
                placeholder="e.g. Muhammad Ali"
                registration={register("name", {
                  required: "Full name is required",
                  minLength: { value: 3, message: "Minimum 3 characters" },
                })}
                error={errors.name?.message}
              />
              <InputField
                label="Email Address *"
                icon={Mail}
                type="email"
                placeholder="you@example.com"
                registration={register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email",
                  },
                })}
                error={errors.email?.message}
              />
            </div>
            <InputField
              label="Phone Number"
              icon={Phone}
              type="tel"
              placeholder="03XXXXXXXXX (optional)"
              registration={register("phone", { 
                pattern: phonePattern ,
                required: "Phone number is required"
            })}
              error={errors.phone?.message}
              hint="Pakistani mobile number format"
            />
          </FormSection>

          {/* Message */}
          <FormSection
            icon={MessageSquare}
            title="Your Message"
            subtitle="What can we help you with?"
          >
            <SelectBox
              label="Subject *"
              icon={MessageSquare}
              placeholder="Select a subject"
              options={subjectOptions}
              registration={register("subject", {
                required: "Please select a subject",
              })}
              error={errors.subject?.message}
            />
            <TextAreaField
              label="Message *"
              icon={MessageSquare}
              placeholder="Describe your inquiry in detail..."
              rows={5}
              registration={register("message", {
                required: "Message is required",
                minLength: { value: 20, message: "Minimum 20 characters" },
                maxLength: { value: 1000, message: "Maximum 1000 characters" },
              })}
              error={errors.message?.message}
              hint="Between 20 and 1000 characters"
            />
          </FormSection>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={submitState === "loading"}
              className="flex items-center gap-2 bg-primary text-white font-medium py-3 px-8 rounded-lg hover:bg-primary focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition duration-200"
            >
              {submitState === "loading" ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
