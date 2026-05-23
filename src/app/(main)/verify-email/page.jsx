"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useSendOtp } from "@/app/hooks/useSendOtp";
import { useVerifyOtp } from "@/app/hooks/useVerifyOtp";
import OtpBoxInput from "@/app/components/Form/OtpBoxInput";

const OTP_LENGTH = 6;

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const { user, loading } = useAuth();
  const { mutate: sendOtp, isPending: sending } = useSendOtp();
  const { mutate: verifyOtp, isPending: verifying, isSuccess, isError, error } = useVerifyOtp();

  const [otp, setOtp] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRef = useRef(null);
  const cooldownRef = useRef(null);

  // Auto-send OTP on mount (only for local users who are not yet verified)
  useEffect(() => {
    if (!loading && user && !user.isEmailVerified) {
      sendOtp();
      startCooldown();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Redirect if already verified
  useEffect(() => {
    if (!loading && user?.isEmailVerified) {
      router.replace(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/sign-in?redirect=${encodeURIComponent("/verify-email")}`);
    }
  }, [user, loading, router]);

  // Redirect after successful verification
  useEffect(() => {
    if (isSuccess) {
      const t = setTimeout(() => router.replace(redirectTo), 1800);
      return () => clearTimeout(t);
    }
  }, [isSuccess, router, redirectTo]);

  function startCooldown(seconds = 60) {
    clearInterval(cooldownRef.current);
    setResendCooldown(seconds);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  const handleResend = () => {
    setResendMsg("");
    sendOtp(undefined, {
      onSuccess: () => {
        setResendMsg("A new OTP has been sent to your email.");
        otpRef.current?.reset();
        startCooldown();
      },
      onError: (err) => {
        setResendMsg(err.message || "Failed to resend OTP.");
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.length < OTP_LENGTH) return;
    verifyOtp(otp);
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 rounded-full mb-4">
              <ShieldCheck size={26} className="text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Verify Your Email</h1>
            <p className="text-sm text-gray-500 mt-2">
              A 6-digit code was sent to{" "}
              <span className="font-semibold text-gray-700">{user?.email}</span>
            </p>
          </div>

          {/* Success */}
          {isSuccess && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-4 mb-6">
              <CheckCircle2 size={20} className="flex-shrink-0 text-green-500" />
              <div>
                <p className="font-semibold">Email verified!</p>
                <p className="text-sm text-green-600">Redirecting you now…</p>
              </div>
            </div>
          )}

          {/* Error */}
          {isError && !isSuccess && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6">
              <AlertCircle size={18} className="flex-shrink-0" />
              <p className="text-sm">{error?.message || "Verification failed. Try again."}</p>
            </div>
          )}

          {/* Resend message */}
          {resendMsg && (
            <p className="text-sm text-center text-purple-700 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 mb-5">
              {resendMsg}
            </p>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-6">
              <OtpBoxInput ref={otpRef} onChange={setOtp} disabled={verifying || isSuccess} />
            </div>

            <button
              type="submit"
              disabled={verifying || isSuccess || otp.length < OTP_LENGTH}
              className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {verifying ? "Verifying…" : "Verify Email"}
            </button>
          </form>

          {/* Resend */}
          {!isSuccess && (
            <div className="mt-5 text-center">
              {resendCooldown > 0 ? (
                <p className="text-sm text-gray-500">
                  Resend OTP in <span className="font-semibold">{resendCooldown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={sending}
                  className="inline-flex items-center gap-1.5 text-sm text-purple-600 font-semibold hover:underline disabled:opacity-60"
                >
                  <RotateCcw size={14} />
                  {sending ? "Sending…" : "Resend OTP"}
                </button>
              )}
            </div>
          )}

          {/* Skip link */}
          {!isSuccess && (
            <p className="text-center text-xs text-gray-400 mt-5">
              <button
                type="button"
                onClick={() => router.replace(redirectTo)}
                className="hover:underline text-gray-400"
              >
                Skip for now (limited access)
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
