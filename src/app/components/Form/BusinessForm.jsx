"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  User,
  MapPin,
  FileText,
  Briefcase,
  Award,
  Star,
  Map,
  DollarSign,
  Clock,
  Share2,
  ImageIcon,
  Loader2,
  X,
  Upload,
  Pencil,
  Check,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { useImageUpload } from "@/app/hooks/useImageUpload";
import { useCategories } from "@/hooks/useCategories";
import { useCities } from "@/hooks/useCities";
import FormSection from "./FormSection";
import InputField from "./InputField";
import TextAreaField from "./TextAreaField";
import SelectBox from "./SelectBox";
import DynamicListField from "./DynamicListField";
import LocationPickerWrapper from "./LocationPickerWrapper";

const AVAILABILITY_OPTIONS = [
  { label: "Available", value: "Available" },
  { label: "Unavailable", value: "Unavailable" },
];

const RESPONSE_TIME_OPTIONS = [
  "Within 1 hour",
  "Within 2 hours",
  "Within 4 hours",
  "Same day",
  "Next day",
];

const IMAGE_FOLDER = "service-markaz/businesses";

// Pakistani phone: 03XX-XXXXXXX (11 digits), or +923XX-XXXXXXX (with country code)
const PK_PHONE_REGEX = /^(\+92|0092|0)3[0-9]{9}$/;
function validatePkPhone(v) {
  if (!v) return true; // let required handle empty
  const clean = v.replace(/[\s\-()]/g, "");
  return PK_PHONE_REGEX.test(clean) || "Enter a valid Pakistani number (e.g. 03001234567)";
}

/**
 * Inline category search field integrated with react-hook-form.
 * Shows 8 popular categories by default; filters on type.
 */
function CategorySearchField({ categories, value, onChange, onBlur, error }) {
  const [inputText, setInputText] = useState(value || "");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Keep inputText in sync when form resets (edit prefill)
  useEffect(() => { setInputText(value || ""); }, [value]);

  const suggestions = inputText.trim()
    ? categories.filter((c) => c.name.toLowerCase().includes(inputText.toLowerCase()))
    : categories.slice(0, 8);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSelect(cat) {
    setInputText(cat.name);
    onChange(cat.name);
    setOpen(false);
  }

  function handleClear(e) {
    e.stopPropagation();
    setInputText("");
    onChange("");
    setOpen(true);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        Category <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={inputText}
          onChange={(e) => { setInputText(e.target.value); onChange(""); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={onBlur}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter" && suggestions.length > 0) { e.preventDefault(); handleSelect(suggestions[0]); }
          }}
          placeholder="Search category (plumber, electrician…)"
          autoComplete="off"
          className={`w-full pl-10 pr-8 py-2.5 text-sm border rounded-lg outline-none transition focus:ring-2 ${error
              ? "border-red-400 focus:ring-red-300 bg-red-50"
              : "border-gray-200 focus:ring-primary/40 focus:border-primary"
            }`}
        />
        {inputText && (
          <button type="button" onClick={handleClear} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          {!inputText.trim() && (
            <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Popular Categories</p>
          )}
          <ul className="py-1 max-h-56 overflow-y-auto">
            {suggestions.map((cat) => (
              <li key={cat.slug ?? cat.name}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(cat)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition text-left group"
                >
                  <span className="text-sm text-gray-800 flex-1">{cat.name}</span>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-primary transition" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const STEPS = [
  { id: 1, label: "Basic Information" },
  { id: 2, label: "Location" },
  { id: 3, label: "Services & Details" },
  { id: 4, label: "Media & Extras" },
];

function StepIndicator({ currentStep }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {STEPS.map((s, idx) => {
          const isCompleted = currentStep > s.id;
          const isActive = currentStep === s.id;
          return (
            <div key={s.id} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${isCompleted
                      ? "bg-primary text-white"
                      : isActive
                        ? "bg-primary text-white ring-4 ring-primary/20"
                        : "bg-gray-100 text-gray-400"
                    }`}
                >
                  {isCompleted ? <Check size={15} /> : s.id}
                </div>
                <span
                  className={`mt-1.5 text-[10px] sm:text-xs font-medium text-center leading-tight max-w-[60px] sm:max-w-[80px] ${isActive ? "text-primary" : isCompleted ? "text-gray-600" : "text-gray-400"
                    }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 sm:mx-2 mb-5 transition-all duration-300 ${currentStep > s.id ? "bg-primary" : "bg-gray-200"
                    }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Shared business form used by both /add-business and /edit-business pages.
 *
 * Props:
 *  - defaultValues  : initial form values (required)
 *  - onSubmit       : called with the cleaned payload after validation
 *  - isSubmitting   : controls the submit button loading state
 *  - isEdit         : changes the submit button label and page context
 */
export default function BusinessForm({ defaultValues, onSubmit, isSubmitting, isEdit = false }) {
  const [step, setStep] = useState(1);
  const [locationError, setLocationError] = useState("");
  const [profileImageError, setProfileImageError] = useState("");

  const { data: categoriesData = [], isLoading: categoriesLoading } = useCategories();
  const { data: citiesData = [], isLoading: citiesLoading } = useCities();

  const profileUpload = useImageUpload(IMAGE_FOLDER);
  const bannerUpload = useImageUpload(IMAGE_FOLDER);
  const profileInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({ defaultValues });

  // Re-populate form when pre-filled edit data arrives (async)
  useEffect(() => {
    if (defaultValues) reset(defaultValues);
  }, [defaultValues, reset]);

  const profileImage = watch("profileImage");
  const bannerImage = watch("bannerImage");
  const location = watch("location");

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({ control, name: "services" });
  const { fields: specializationFields, append: appendSpecialization, remove: removeSpecialization } = useFieldArray({ control, name: "specializations" });
  const { fields: serviceAreaFields, append: appendServiceArea, remove: removeServiceArea } = useFieldArray({ control, name: "serviceAreas" });

  const categoryOptions = categoriesData.map((c) => ({ label: c.name, value: c.name }));
  const cityOptions = citiesData.map((c) => ({ label: c.name, value: c.name }));
  const categoryValue = watch("category");

  function handleProfileImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    profileUpload.mutate(file, {
      onSuccess: (url) => {
        setValue("profileImage", url);
        setProfileImageError("");
      },
    });
    e.target.value = "";
  }

  function handleBannerImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    bannerUpload.mutate(file, { onSuccess: (url) => setValue("bannerImage", url) });
    e.target.value = "";
  }

  async function handleNext() {
    let valid = false;
    if (step === 1) {
      valid = await trigger(["name", "title", "phone", "email"]);
    } else if (step === 2) {
      valid = await trigger(["category", "city", "area"]);
      if (valid) {
        const loc = getValues("location");
        if (!loc) {
          setLocationError("Please pin your exact location on the map or use 'Use My Location'.");
          return;
        }
        setLocationError("");
      }
    } else if (step === 3) {
      valid = await trigger(["services"]);
    }
    if (valid) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleBack() {
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleFormSubmit(data) {
    if (!data.profileImage) {
      setProfileImageError("Profile photo is required.");
      return;
    }
    setProfileImageError("");
    const payload = {
      ...data,
      services: data.services.map((s) => s.value).filter(Boolean),
      specializations: data.specializations.map((s) => s.value).filter(Boolean),
      serviceAreas: data.serviceAreas.map((s) => s.value).filter(Boolean),
      experience: Number(data.experience) || 0,
      completedProjects: Number(data.completedProjects) || 0,
      // API expects flat lat/lng fields, not a nested location object
      lat: data.location?.lat ?? null,
      lng: data.location?.lng ?? null,
    };
    // Remove the location field — API doesn't read it
    delete payload.location;
    onSubmit(payload);
  }

  const isUploadPending = profileUpload.isPending || bannerUpload.isPending;

  return (
    <div className="space-y-5">

      {/* ── Step Indicator ─────────────────────────────────────────── */}
      <StepIndicator currentStep={step} />

      {/* ══════════════════════════════════════════════════════════════
          STEP 1 — Basic Information
      ══════════════════════════════════════════════════════════════ */}
      {step === 1 && (
        <FormSection icon={User} title="Basic Information" subtitle="Your identity and contact details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Full Name"
              placeholder="Muhammad Ali"
              registration={register("name", { required: "Name is required" })}
              error={errors.name?.message}
            />
            <InputField
              label="Business Title"
              placeholder="Expert Electrician with 10+ years"
              registration={register("title", { required: "Title is required" })}
              error={errors.title?.message}
              hint="Short tagline shown on your profile card"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Phone Number"
              type="tel"
              placeholder="03001234567"
              registration={register("phone", {
                required: "Phone number is required",
                validate: validatePkPhone,
              })}
              error={errors.phone?.message}
              hint="Pakistani number only (e.g. 03001234567)"
            />
            <InputField
              label="WhatsApp Number"
              type="tel"
              placeholder="03001234567"
              registration={register("whatsapp", {
                validate: (v) => !v || validatePkPhone(v) === true || validatePkPhone(v),
              })}
              error={errors.whatsapp?.message}
              hint="Leave blank to use phone number"
            />
          </div>
          <InputField
            label="Email Address"
            type="email"
            placeholder="you@email.com"
            registration={register("email", { required: "Email is required" })}
            error={errors.email?.message}
            hint="Visible on your public profile"
          />
        </FormSection>
      )}

      {/* ══════════════════════════════════════════════════════════════
          STEP 2 — Location
      ══════════════════════════════════════════════════════════════ */}
      {step === 2 && (
        <FormSection icon={MapPin} title="Location" subtitle="Where you operate — used for nearby search and maps">
          {/* Category — at top of location step */}
          <div>
            {(() => {
              const { onBlur: rhfOnBlur } = register("category", { required: "Category is required" });
              return (
                <CategorySearchField
                  categories={categoriesData}
                  value={categoryValue}
                  onChange={(val) => setValue("category", val, { shouldValidate: true })}
                  onBlur={rhfOnBlur}
                  error={errors.category?.message}
                />
              );
            })()}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectBox
              label="City"
              placeholder={citiesLoading ? "Loading cities…" : "Select a city"}
              options={cityOptions}
              registration={register("city", { required: "City is required" })}
              error={errors.city?.message}
            />
            <InputField
              label="Area / Neighbourhood"
              placeholder="e.g. Blue Area, Satellite Town"
              registration={register("area", { required: "Area is required" })}
              error={errors.area?.message}
            />
          </div>

          {/* Map location picker */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
              <MapPin size={14} className="text-primary" />
              Exact Location
              <span className="text-red-500 ml-0.5">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Allow location access to auto-fill the map, or click anywhere on the map to pin your exact location manually.
            </p>
            <LocationPickerWrapper
              value={location}
              onChange={(coords) => {
                setValue("location", coords);
                if (coords) setLocationError("");
              }}
            />
            {locationError && (
              <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                <X size={11} /> {locationError}
              </p>
            )}
          </div>
        </FormSection>
      )}

      {/* ══════════════════════════════════════════════════════════════
          STEP 3 — Services & Details
      ══════════════════════════════════════════════════════════════ */}
      {step === 3 && (
        <div className="space-y-5">
          {/* Services */}
          <FormSection icon={Briefcase} title="Services Offered" subtitle="Minimum 1 service required">
            <DynamicListField
              name="services"
              fields={serviceFields}
              append={appendService}
              remove={removeService}
              placeholder="e.g. Electrical wiring"
              register={register}
              errors={errors}
            />
          </FormSection>

          {/* About */}
          <FormSection icon={FileText} title="About Your Business" subtitle="Optional — tell customers what makes you stand out">
            <TextAreaField
              label="About"
              rows={4}
              placeholder="Describe your business, expertise, and what sets you apart…"
              registration={register("about")}
              error={errors.about?.message}
            />
          </FormSection>

          {/* Experience */}
          <FormSection icon={Award} title="Experience" subtitle="Optional — your professional background">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Years of Experience"
                type="number"
                placeholder="5"
                registration={register("experience", { min: { value: 0, message: "Cannot be negative" } })}
                error={errors.experience?.message}
              />
              <InputField
                label="Completed Projects"
                type="number"
                placeholder="100"
                registration={register("completedProjects", { min: { value: 0, message: "Cannot be negative" } })}
                error={errors.completedProjects?.message}
              />
            </div>
          </FormSection>

          {/* Specializations */}
          <FormSection icon={Star} title="Specializations" subtitle="Optional — highlight what you specialise in">
            <DynamicListField
              name="specializations"
              fields={specializationFields}
              append={appendSpecialization}
              remove={removeSpecialization}
              placeholder="e.g. Solar panel installation"
              register={register}
              errors={errors}
              required={false}
            />
          </FormSection>

          {/* Service Areas */}
          <FormSection icon={Map} title="Service Areas" subtitle="Optional — areas or cities where you provide service">
            <DynamicListField
              name="serviceAreas"
              fields={serviceAreaFields}
              append={appendServiceArea}
              remove={removeServiceArea}
              placeholder="e.g. Rawalpindi, Islamabad"
              register={register}
              errors={errors}
              required={false}
            />
          </FormSection>

          {/* Availability */}
          <FormSection icon={Clock} title="Availability & Response" subtitle="Optional — let customers know your schedule">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectBox
                label="Availability Status"
                options={AVAILABILITY_OPTIONS}
                placeholder="Select status"
                registration={register("availability")}
              />
              <SelectBox
                label="Typical Response Time"
                options={RESPONSE_TIME_OPTIONS}
                placeholder="Select response time"
                registration={register("responseTime")}
              />
            </div>
          </FormSection>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          STEP 4 — Media & Extras
      ══════════════════════════════════════════════════════════════ */}
      {step === 4 && (
        <div className="space-y-5">
          {/* Images */}
          <FormSection icon={ImageIcon} title="Profile Images" subtitle="Profile photo is required">

            {/* Profile Photo */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <ImageIcon size={14} className="text-primary" />
                Profile Photo
                <span className="text-red-500 ml-0.5">*</span>
              </label>

              <input
                ref={profileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleProfileImageChange}
                disabled={profileUpload.isPending}
                className="hidden"
              />

              <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4 sm:gap-6 bg-gray-50/50 p-4 sm:p-5 rounded-2xl border border-gray-100">
                {profileImage ? (
                  <div className="relative w-32 h-32 sm:w-36 sm:h-36 shrink-0 group">
                    <img
                      src={profileImage}
                      alt="Profile preview"
                      className="w-full h-full object-cover rounded-2xl border-2 border-gray-200 shadow-sm"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-black/5 sm:bg-black/0 group-hover:bg-black/45 transition-all duration-200 flex items-center justify-center gap-2 sm:opacity-0 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => profileInputRef.current?.click()}
                        className="p-2 bg-white/90 hover:bg-white rounded-xl shadow transition"
                        title="Change photo"
                      >
                        <Pencil size={14} className="text-gray-700" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setValue("profileImage", "")}
                        className="p-2 bg-white/90 hover:bg-white rounded-xl shadow transition"
                        title="Remove photo"
                      >
                        <X size={14} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                ) : profileUpload.isPending ? (
                  <div className="w-32 h-32 sm:w-36 sm:h-36 shrink-0 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 flex flex-col items-center justify-center gap-2 shadow-sm">
                    <Loader2 size={24} className="animate-spin text-blue-400" />
                    <span className="text-xs text-blue-400 font-medium">Uploading…</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => profileInputRef.current?.click()}
                    className={`w-32 h-32 sm:w-36 sm:h-36 shrink-0 rounded-2xl border-2 border-dashed bg-white hover:bg-primary/5 transition-all duration-200 flex flex-col items-center justify-center gap-2 group shadow-sm ${profileImageError ? "border-red-400" : "border-gray-300 hover:border-primary"
                      }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                      <Upload size={20} className="text-gray-400 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-sm font-semibold text-gray-500 group-hover:text-primary transition-colors">Upload</span>
                  </button>
                )}

                <div className="flex flex-col justify-center gap-2 pt-1 flex-1">
                  <p className="text-base sm:text-sm text-gray-800 sm:text-gray-600 font-semibold sm:font-medium">Profile Photo</p>
                  <p className="text-sm sm:text-xs text-gray-500 sm:text-gray-400 leading-relaxed max-w-sm">
                    Square image recommended.<br className="hidden sm:block" /> Shown on your profile card and search results.
                  </p>
                  <p className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg w-fit mx-auto sm:mx-0">
                    JPG, PNG or WebP · Max 5 MB
                  </p>
                  {!profileImage && !profileUpload.isPending && (
                    <button
                      type="button"
                      onClick={() => profileInputRef.current?.click()}
                      className="hidden sm:inline-flex self-start mt-2 text-sm font-semibold text-primary hover:text-primary-hover transition"
                    >
                      Choose file
                    </button>
                  )}
                </div>
              </div>

              {profileImageError && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                  <X size={11} /> {profileImageError}
                </p>
              )}
              {profileUpload.isError && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                  <X size={11} /> {profileUpload.error?.message}
                </p>
              )}
            </div>

            <div className="border-t border-gray-100" />

            {/* Banner Photo */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <ImageIcon size={14} className="text-primary" />
                Banner Photo
                <span className="text-gray-400 font-normal text-xs ml-1">(optional)</span>
              </label>

              <input
                ref={bannerInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleBannerImageChange}
                disabled={bannerUpload.isPending}
                className="hidden"
              />

              {bannerImage ? (
                <div className="relative w-full group rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm">
                  <img
                    src={bannerImage}
                    alt="Banner preview"
                    className="w-full h-36 sm:h-44 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-all duration-200 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white/90 hover:bg-white rounded-xl text-xs font-semibold text-gray-700 shadow transition"
                    >
                      <Pencil size={13} /> Change
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue("bannerImage", "")}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white/90 hover:bg-white rounded-xl text-xs font-semibold text-red-500 shadow transition"
                    >
                      <X size={13} /> Remove
                    </button>
                  </div>
                </div>
              ) : bannerUpload.isPending ? (
                <div className="w-full h-36 sm:h-44 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 flex flex-col items-center justify-center gap-2">
                  <Loader2 size={26} className="animate-spin text-blue-400" />
                  <span className="text-sm text-blue-400 font-medium">Uploading banner…</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  className="w-full h-36 sm:h-44 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-primary hover:bg-primary/5 transition-all duration-200 flex flex-col items-center justify-center gap-3 group"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                    <ImageIcon size={22} className="text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-center space-y-0.5">
                    <p className="text-sm font-semibold text-gray-500 group-hover:text-primary transition-colors">
                      Click to upload banner
                    </p>
                    <p className="text-xs text-gray-400">Recommended: 1200 × 400 px · Max 5 MB</p>
                  </div>
                </button>
              )}

              {bannerUpload.isError && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                  <X size={11} /> {bannerUpload.error?.message}
                </p>
              )}
            </div>
          </FormSection>

          {/* Pricing */}
          <FormSection icon={DollarSign} title="Pricing" subtitle="Optional — give customers an idea of your rates">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputField
                label="Callout Fee (Rs)"
                placeholder="500"
                registration={register("pricing.calloutFee")}
              />
              <InputField
                label="Hourly Rate (Rs)"
                placeholder="1000"
                registration={register("pricing.hourlyRate")}
              />
              <InputField
                label="Minimum Charge (Rs)"
                placeholder="800"
                registration={register("pricing.minCharge")}
              />
            </div>
          </FormSection>

          {/* Social Links */}
          <FormSection icon={Share2} title="Social Media & Links" subtitle="Optional — connect your social profiles">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Facebook" placeholder="https://facebook.com/yourpage" registration={register("socialLinks.facebook")} />
              <InputField label="Instagram" placeholder="https://instagram.com/yourhandle" registration={register("socialLinks.instagram")} />
              <InputField label="YouTube" placeholder="https://youtube.com/yourchannel" registration={register("socialLinks.youtube")} />
              <InputField label="Website" placeholder="https://yourwebsite.com" registration={register("socialLinks.website")} />
              <InputField label="LinkedIn" placeholder="https://linkedin.com/in/you" registration={register("socialLinks.linkedin")} />
              <InputField label="TikTok" placeholder="https://tiktok.com/@you" registration={register("socialLinks.tiktok")} />
            </div>
          </FormSection>
        </div>
      )}

      {/* ── Navigation Buttons ─────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-2 md:gap-4 pb-8 pt-2">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="w-full sm:w-auto px-4 md:px-12 py-3.5 bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold rounded-xl text-lg transition shadow-sm"
          >
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="w-full sm:w-auto px-4 md:px-12 py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl text-lg transition shadow-lg shadow-primary/30 cursor-pointer"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleSubmit(handleFormSubmit)()}
            disabled={isSubmitting || isUploadPending}
            className="flex items-center justify-center gap-3 w-full sm:w-auto px-5 md:px-12 py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl text-lg transition shadow-lg shadow-primary/30 cursor-pointer"
          >
            {(isSubmitting || isUploadPending) && (
              <Loader2 size={16} className="hidden sm:block animate-spin" />
            )}

            {isEdit ? "Save Changes" : "Create Listing"}
          </button>
        )}
      </div>
    </div>
  );
}
