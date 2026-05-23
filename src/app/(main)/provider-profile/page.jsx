"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, AlertCircle, Plus, Pencil, Gift } from "lucide-react";
import Link from "next/link";
import ProfileHeader from "@/app/components/profile-components/ProfileHeader";
import AboutSection from "@/app/components/profile-components/AboutSection";
import ServicesSection from "@/app/components/profile-components/ServicesSection";
import ExperienceSection from "@/app/components/profile-components/ExperienceSection";
import ServiceAreasSection from "@/app/components/profile-components/ServiceAreasSection";
import PricingSection from "@/app/components/profile-components/PricingSection";
import ReviewsSection from "@/app/components/profile-components/ReviewsSection";
import ContactSection from "@/app/components/profile-components/ContactSection";
import LeadsSection from "@/app/components/profile-components/LeadsSection";
import AnalyticsSection from "@/app/components/profile-components/AnalyticsSection";
import SocialLinksSection from "@/app/components/profile-components/SocialLinksSection";
import VerificationCTA from "@/app/components/verification/VerificationCTA";
import { useBusiness } from "@/app/hooks/useBusiness";
import ProtectedRoute from "@/app/components/ui/ProtectedRoute";
import GreenBtn from "@/app/components/buttons/GreenBtn";
import { useAuth } from "@/app/context/AuthContext";
import { updateAvailability } from "@/app/lib/api/business";

/** Maps the Business DB document to the shape expected by profile components */
function mapBusinessToProvider(business) {
  return {
    name: business.name,
    category: business.category,
    city: business.city,
    area: business.area,
    image: business.profileImage || "",
    bannerImage: business.bannerImage || "",
    rating: business.rating ?? 0,
    reviews: business.reviewsCount ?? 0,
    experience: business.experience,
    availability: business.availability,
    verification: business.verification,
    about: business.about,
    services: business.services,
    experience_details: {
      years: business.experience,
    },
    serviceAreas: business.serviceAreas,
    pricing: {
      calloutFee: business.pricing?.calloutFee ? `Rs ${business.pricing.calloutFee}` : "",
      minCharge: business.pricing?.minCharge ? `Rs ${business.pricing.minCharge}` : "",
    },
    reviews_list: [],
    contact: {
      phone: business.phone,
      whatsapp: business.whatsapp || business.phone,
      email: business.email,
    },
    socialLinks: {
      facebook:  business.socialLinks?.facebook  || "",
      instagram: business.socialLinks?.instagram || "",
      youtube:   business.socialLinks?.youtube   || "",
      website:   business.socialLinks?.website   || "",
      linkedin:  business.socialLinks?.linkedin  || "",
      tiktok:    business.socialLinks?.tiktok    || "",
    },
  };
}

function ProfileContent() {
  const { data: business, isLoading, isError, error } = useBusiness();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [localAvailability, setLocalAvailability] = useState(null);

  const availabilityMutation = useMutation({
    mutationFn: (newStatus) => updateAvailability(newStatus, token),
    onMutate: (newStatus) => setLocalAvailability(newStatus),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-business"] }),
    onError: () => setLocalAvailability(null),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (isError) {
    // 404 means no business yet — guide the user to create one
    if (error?.message?.includes("No business")) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 px-4 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Plus size={28} className="text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Business Listing Yet</h2>
            <p className="text-gray-500 text-sm max-w-sm">
              You haven't created a business listing yet. Add your business to start receiving customers.
            </p>
          </div>

          <GreenBtn title="Add Your Business" href="/add-business" />

        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center gap-3 text-red-600">
        <AlertCircle size={22} />
        <span>{error?.message || "Failed to load profile"}</span>
      </div>
    );
  }

  const provider = mapBusinessToProvider(business);

  // localAvailability tracks optimistic state after toggle; falls back to business data
  const currentAvailability = localAvailability ?? provider.availability;
  const isAvailable = currentAvailability === "Available";

  const handleAvailabilityToggle = () => {
    const newStatus = isAvailable ? "Unavailable" : "Available";
    availabilityMutation.mutate(newStatus);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8 lg:py-8 pt-0 sm:pt-4">
      {/* Mobile Sticky Bar — availability toggle + edit profile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 px-4 py-3 bg-white border-t border-gray-100 z-50 shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.15)] flex items-center gap-3">
        {/* ON/OFF pill toggle */}
        <button
          onClick={handleAvailabilityToggle}
          disabled={availabilityMutation.isPending}
          aria-label={isAvailable ? "Set Unavailable" : "Set Available"}
          className={`relative w-24 h-10 rounded-full transition-colors duration-300 active:scale-95 shrink-0 focus:outline-none ${
            isAvailable ? "bg-green-500" : "bg-red-400"
          }`}
        >
          <span className={`absolute top-1 w-8 h-8 rounded-full bg-white shadow-md transition-all duration-300 ${
            isAvailable ? "right-1" : "left-1"
          }`}>
            {availabilityMutation.isPending && (
              <span className="flex items-center justify-center w-full h-full">
                <Loader2 size={14} className="animate-spin text-gray-400" />
              </span>
            )}
          </span>
          <span className={`absolute inset-y-0 flex items-center text-white font-bold text-sm tracking-widest pointer-events-none ${
            isAvailable ? "left-3.5" : "right-3"
          }`}>
            {isAvailable ? "ON" : "OFF"}
          </span>
        </button>

        <Link
          href="/edit-business"
          className="flex flex-1 items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white text-base font-semibold px-4 py-3 rounded-xl transition active:scale-[0.98]"
        >
          <Pencil size={18} />
          Edit Profile
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-0 sm:px-4 lg:px-6 relative">
        {/* Desktop: availability toggle + edit button */}
        <div className="hidden lg:flex items-center gap-3 mb-4 absolute top-4 right-10 z-10">
          {/* ON/OFF pill toggle */}
          <button
            onClick={handleAvailabilityToggle}
            disabled={availabilityMutation.isPending}
            aria-label={isAvailable ? "Set Unavailable" : "Set Available"}
            className={`relative w-24 h-10 rounded-full transition-colors duration-300 hover:-translate-y-0.5 focus:outline-none ${
              isAvailable ? "bg-green-500 shadow-[0_4px_14px_rgba(34,197,94,0.4)]" : "bg-red-400 shadow-[0_4px_14px_rgba(248,113,113,0.4)]"
            }`}
          >
            <span className={`absolute top-1 w-8 h-8 rounded-full bg-white shadow-md transition-all duration-300 ${
              isAvailable ? "right-1" : "left-1"
            }`}>
              {availabilityMutation.isPending && (
                <span className="flex items-center justify-center w-full h-full">
                  <Loader2 size={14} className="animate-spin text-gray-400" />
                </span>
              )}
            </span>
            <span className={`absolute inset-y-0 flex items-center text-white font-bold text-sm tracking-widest pointer-events-none ${
              isAvailable ? "left-3.5" : "right-3"
            }`}>
              {isAvailable ? "ON" : "OFF"}
            </span>
          </button>
          <Link
            href="/edit-business"
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover shadow-md text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition hover:-translate-y-0.5"
          >
            <Pencil size={16} />
            Edit Profile
          </Link>
        </div>

        <ProfileHeader provider={{ ...provider, availability: currentAvailability }} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-0">
          <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
            <AboutSection provider={provider} />
            <ServicesSection provider={provider} />
            <ExperienceSection provider={provider} />
            <ServiceAreasSection provider={provider} />
            <PricingSection provider={provider} />
            <SocialLinksSection provider={provider} />
            <ReviewsSection businessId={business._id} isOwner={true} />
            <AnalyticsSection />
            <LeadsSection />
          </div>

          <div className="lg:sticky lg:top-6 lg:h-fit flex flex-col gap-4 sm:gap-6">
            <ContactSection provider={provider} businessId={business._id} />

            {/* Verification CTA */}
            <VerificationCTA />

            {/* Referral programme teaser */}
            <Link
              href="/referrals"
              className="block p-4 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl text-white hover:opacity-90 transition-opacity"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Gift size={18} />
                </div>
                <h3 className="font-semibold text-base">Referral Programme</h3>
              </div>
              <p className="text-sm text-purple-200 leading-snug mb-3">
                Invite other providers and earn free subscription months, featured badges, and more!
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/20 px-3 py-1.5 rounded-lg">
                View my invite link →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProviderProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

