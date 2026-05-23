"use client";

import { useMemo } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import ProtectedRoute from "@/app/components/ui/ProtectedRoute";
import BusinessForm from "@/app/components/Form/BusinessForm";
import { useBusiness } from "@/app/hooks/useBusiness";
import { useEditBusiness } from "@/app/hooks/useEditBusiness";
import IntroSection from "@/app/components/ui/IntroSection";

/** Convert a plain string array to the shape react-hook-form useFieldArray expects. */
function toFieldArray(arr) {
  if (!arr?.length) return [];
  return arr.map((v) => ({ value: v }));
}

/** Map a Business document (from the API) to BusinessForm's defaultValues shape. */
function businessToFormValues(business) {
  return {
    name: business.name || "",
    title: business.title || "",
    phone: business.phone || "",
    whatsapp: business.whatsapp || "",
    email: business.email || "",
    category: business.category || "",
    city: business.city || "",
    area: business.area || "",
    about: business.about || "",
    services: toFieldArray(business.services).length
      ? toFieldArray(business.services)
      : [{ value: "" }],
    experience: business.experience ?? "",
    completedProjects: business.completedProjects ?? "",
    specializations: toFieldArray(business.specializations).length
      ? toFieldArray(business.specializations)
      : [{ value: "" }],
    serviceAreas: toFieldArray(business.serviceAreas).length
      ? toFieldArray(business.serviceAreas)
      : [{ value: "" }],
    pricing: {
      calloutFee: business.pricing?.calloutFee || "",
      hourlyRate: business.pricing?.hourlyRate || "",
      minCharge: business.pricing?.minCharge || "",
    },
    availability: business.availability || "Available",
    responseTime: business.responseTime || "",
    socialLinks: {
      facebook: business.socialLinks?.facebook || "",
      instagram: business.socialLinks?.instagram || "",
      youtube: business.socialLinks?.youtube || "",
      website: business.socialLinks?.website || "",
      linkedin: business.socialLinks?.linkedin || "",
      tiktok: business.socialLinks?.tiktok || "",
    },
    profileImage: business.profileImage || "",
    bannerImage: business.bannerImage || "",
    location:
      business.location?.coordinates?.length === 2
        ? { lat: business.location.coordinates[1], lng: business.location.coordinates[0] }
        : null,
  };
}

function EditBusinessContent() {
  const { data: business, isLoading, isError, error } = useBusiness();
  const mutation = useEditBusiness();

  const defaultValues = useMemo(
    () => (business ? businessToFormValues(business) : null),
    [business]
  );

  function handleSubmit(data) {
    mutation.mutate(data, {
      onError: (err) => toast.error(err.message || "Failed to update listing"),
      onSuccess: () => toast.success("Business listing updated!"),
    });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center gap-3 text-red-600">
        <AlertCircle size={22} />
        <span>{error?.message || "Failed to load business listing"}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-3xl mx-auto">


        <IntroSection
          title="Update Business Profile"
          subtitle="Keep your business details fresh and help customers find accurate information."
        />


        {defaultValues && (
          <BusinessForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            isSubmitting={mutation.isPending}
            isEdit={true}
          />
        )}
      </div>
    </div>
  );
}

export default function EditBusinessPage() {
  return (
    <ProtectedRoute>
      <EditBusinessContent />
    </ProtectedRoute>
  );
}
