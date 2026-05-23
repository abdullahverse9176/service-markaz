"use client";

import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { User, Mail, Phone, Lock, UserPlus, MessageCircle, Gift } from "lucide-react";
import Link from "next/link";
import InputField from "@/app/components/Form/InputField";
import { useSignUp } from "@/app/hooks/useSignUp";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import toast from "react-hot-toast";

const phonePattern = {
  value: /^03[0-9]{9}$/,
  message: "Enter a valid Pakistani number (03XXXXXXXXX)",
};

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const refCode = searchParams.get("ref") ?? "";
  const { mutate: signUp, isPending, isError, isSuccess, error } = useSignUp();
  const { login, user, loading } = useAuth();
  const [referrerName, setReferrerName] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: { referralCode: refCode },
  });

  // Redirect already-logged-in users away from this page
  useEffect(() => {
    if (!loading && user) router.replace(redirectTo);
  }, [user, loading, router, redirectTo]);

  // Validate the referral code and display the referrer's name
  useEffect(() => {
    if (!refCode) return;
    fetch(`/api/referrals/validate?code=${encodeURIComponent(refCode)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setReferrerName(json.data.name);
      })
      .catch(() => {});
  }, [refCode]);

  if (loading || user) return null;

  const onSubmit = (data) =>
    signUp({ ...data, referralCode: data.referralCode || refCode || undefined }, {
      onSuccess: ({ user, token }) => {
        reset();
        login({ user, token });
        toast.success("Account created! Verify your email when prompted for full access.");
        router.push(redirectTo);
      },
    });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 rounded-full mb-4">
              <UserPlus size={26} className="text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Create an Account</h1>
            <p className="text-sm text-gray-500 mt-2">Sign up to get started with Service Markaz</p>
          </div>

          {/* Referral banner */}
          {referrerName && (
            <div className="mb-6 flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-700">
              <Gift size={16} className="shrink-0" />
              <span>
                You were invited by <strong>{referrerName}</strong>. Complete your profile to unlock rewards!
              </span>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg text-center">
              Account created successfully! You can now{" "}
              <Link href="/sign-in" className="font-semibold underline">
                sign in
              </Link>
              .
            </div>
          )}

          {/* Error Message */}
          {isError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center">
              {error?.message || "Something went wrong. Please try again."}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="First Name"
                icon={User}
                placeholder="Ali"
                registration={register("firstName", {
                  required: "First name is required",
                  minLength: { value: 2, message: "At least 2 characters" },
                })}
                error={errors.firstName?.message}
              />
              <InputField
                label="Last Name"
                icon={User}
                placeholder="Khan"
                registration={register("lastName", {
                  required: "Last name is required",
                  minLength: { value: 2, message: "At least 2 characters" },
                })}
                error={errors.lastName?.message}
              />
            </div>

            {/* Email */}
            <InputField
              label="Email Address"
              icon={Mail}
              type="email"
              placeholder="you@example.com"
              registration={register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
              error={errors.email?.message}
            />

            {/* Phone */}
            <InputField
              label="Phone Number"
              icon={Phone}
              type="tel"
              placeholder="03001234567"
              registration={register("phone", {
                required: "Phone number is required",
                pattern: phonePattern,
              })}
              error={errors.phone?.message}
            />

            {/* WhatsApp */}
            <InputField
              label="WhatsApp Number (Optional)"
              icon={MessageCircle}
              type="tel"
              placeholder="03001234567"
              hint="Leave blank if same as phone number"
              registration={register("whatsapp", {
                pattern: { ...phonePattern, message: "Enter a valid Pakistani number (03XXXXXXXXX)" },
              })}
              error={errors.whatsapp?.message}
            />

            {/* Password */}
            <InputField
              label="Password"
              icon={Lock}
              type="password"
              placeholder="Min. 8 characters"
              registration={register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "Password must be at least 8 characters" },
                pattern: {
                  value: /^(?=.*[A-Za-z])(?=.*\d).+$/,
                  message: "Must contain at least one letter and one number",
                },
              })}
              error={errors.password?.message}
            />

            {/* Referral code (hidden if pre-filled, editable if blank) */}
            <InputField
              label="Referral Code (Optional)"
              icon={Gift}
              placeholder="e.g. AB12CD34"
              hint="Enter a referral code if you have one"
              registration={register("referralCode")}
              error={errors.referralCode?.message}
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-purple-600 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
