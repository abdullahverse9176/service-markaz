"use client";

import { useMemo } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import ProtectedRoute from "@/app/components/ui/ProtectedRoute";
import BusinessForm from "@/app/components/Form/BusinessForm";
import { useAddBusiness } from "@/app/hooks/useAddBusiness";
import IntroSection from "@/app/components/ui/IntroSection";
import { useAuth } from "@/app/context/AuthContext";

const EMPTY_DEFAULTS = {
  name: "",
  title: "",
  phone: "",
  whatsapp: "",
  email: "",
  category: "",
  city: "",
  area: "",
  about: "",
  services: [{ value: "" }],
  experience: "",
  completedProjects: "",
  specializations: [{ value: "" }],
  serviceAreas: [{ value: "" }],
  pricing: { calloutFee: "", hourlyRate: "", minCharge: "" },
  availability: "Available",
  responseTime: "",
  socialLinks: {
    facebook: "",
    instagram: "",
    youtube: "",
    website: "",
    linkedin: "",
    tiktok: "",
  },
  profileImage: "",
  bannerImage: "",
  location: null,
};

function AddBusinessContent() {
  const mutation = useAddBusiness();
  const { user } = useAuth();
  const isUnverified = user && !user.isEmailVerified;

  const defaultValues = useMemo(() => ({
    ...EMPTY_DEFAULTS,
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  }), [user?.name, user?.email, user?.phone]);

  function handleSubmit(data) {
    mutation.mutate(data, {
      onError: (err) => toast.error(err.message || "Failed to create listing"),
      onSuccess: () => toast.success("Business listing created!"),
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-3xl mx-auto">

        <IntroSection
          title="Add Your Business"
          subtitle="Fill in the details below to create your business listing and start receiving customers."
        />

        {isUnverified && (
          <div className="mb-6 rounded-2xl overflow-hidden shadow-md border border-red-200">
            <div className="bg-red-500 px-4 py-2.5 flex items-center gap-2">
              <ShieldAlert size={16} className="text-white flex-shrink-0" />
              <span className="text-white text-sm font-semibold tracking-wide uppercase">Verification Required</span>
            </div>
            <div className="bg-red-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="text-sm text-red-900 flex-1">
                Please verify your email before creating a business listing. Verified accounts get better visibility and build trust with customers.
              </p>
              <Link
                href="/verify-email?redirect=/add-business"
                className="shrink-0 inline-flex items-center gap-2 bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-all duration-200"
              >
                <ShieldAlert size={14} />
                Verify Email Now
              </Link>
            </div>
          </div>
        )}

        <BusinessForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
          isEdit={false}
        />
      </div>
    </div>
  );
}

export default function AddBusinessPage() {
  return (
    <ProtectedRoute>
      <AddBusinessContent />
    </ProtectedRoute>
  );
}
