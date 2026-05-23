"use client";

import { Suspense, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Mail, Lock, LogIn } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn as nextAuthSignIn } from "next-auth/react";
import InputField from "@/app/components/Form/InputField";
import { useSignIn } from "@/app/hooks/useSignIn";
import { useAuth } from "@/app/context/AuthContext";

const OAUTH_ERRORS = {
  OAuthAccountNotLinked: "This email is already registered. Please sign in with your email and password.",
  OAuthSignin: "Could not initiate Google sign-in. Please try again.",
  OAuthCallback: "Google sign-in failed. Please try again.",
  AccessDenied: "Access denied. Your account may be suspended.",
  Default: "Google sign-in failed. Please try again.",
};

function SignInForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const oauthError = searchParams.get("error");
  const { mutate: signIn, isPending, isError, error } = useSignIn({ redirectTo });
  const [googleLoading, setGoogleLoading] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Redirect already-logged-in users away from this page
  useEffect(() => {
    if (!loading && user) router.replace(redirectTo);
  }, [user, loading, router, redirectTo]);

  const onSubmit = (data) => signIn(data);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await nextAuthSignIn("google", { callbackUrl: redirectTo });
    } catch {
      setGoogleLoading(false);
    }
  };

  if (loading || user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 rounded-full mb-4">
              <LogIn size={26} className="text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
            <p className="text-sm text-gray-500 mt-2">Sign in to your Service Markaz account</p>
          </div>

          {/* OAuth Error */}
          {oauthError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center">
              {OAUTH_ERRORS[oauthError] ?? OAUTH_ERRORS.Default}
            </div>
          )}

          {/* Email/Password Error */}
          {isError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center">
              {error?.message || "Invalid email or password. Please try again."}
            </div>
          )}

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || isPending}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mb-5"
          >
            {googleLoading ? (
              <span className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
            )}
            {googleLoading ? "Redirecting..." : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or sign in with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

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

            {/* Password */}
            <InputField
              label="Password"
              icon={Lock}
              type="password"
              placeholder="Enter your password"
              registration={register("password", {
                required: "Password is required",
              })}
              error={errors.password?.message}
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending || googleLoading}
              className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? "Signing In..." : "Sign In"}
            </button>

            <p className="text-center text-sm">
              <Link href="/forgot-password" className="text-purple-600 hover:underline">
                Forgot Password?
              </Link>
            </p>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-purple-600 font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
