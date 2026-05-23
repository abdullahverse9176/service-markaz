"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Mail, Lock, KeyRound, CheckCircle2, ShieldCheck, RotateCcw } from "lucide-react";
import Link from "next/link";
import InputField from "@/app/components/Form/InputField";
import OtpBoxInput from "@/app/components/Form/OtpBoxInput";
import { useForgotPassword } from "@/app/hooks/useForgotPassword";
import { useVerifyForgotOtp } from "@/app/hooks/useVerifyForgotOtp";
import { useResetPassword } from "@/app/hooks/useResetPassword";

const OTP_LENGTH = 6;

function StepHeader({ icon: Icon, iconBg, iconColor, title, subtitle }) {
  return (
    <div className="text-center mb-8">
      <div className={`inline-flex items-center justify-center w-14 h-14 ${iconBg} rounded-full mb-4`}>
        <Icon size={26} className={iconColor} />
      </div>
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      <p className="text-sm text-gray-500 mt-2">{subtitle}</p>
    </div>
  );
}

function ErrorBanner({ error }) {
  if (!error) return null;
  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center">
      {error.message}
    </div>
  );
}

const btnClass =
  "w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password, 4=done
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState(null);

  // Step 2 OTP state
  const [otp, setOtp] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRef = useRef(null);
  const cooldownRef = useRef(null);

  const { register: reg1, handleSubmit: submit1, formState: { errors: e1 } } = useForm();
  const { register: reg3, handleSubmit: submit3, watch, formState: { errors: e3 } } = useForm();

  const { mutate: sendOtp,   isPending: isSending,   error: sendError   } = useForgotPassword();
  const { mutate: verifyOtp, isPending: isVerifying, error: verifyError } = useVerifyForgotOtp();
  const { mutate: resetPass, isPending: isResetting, error: resetError  } = useResetPassword();

  function startCooldown(seconds = 60) {
    clearInterval(cooldownRef.current);
    setResendCooldown(seconds);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  const onSendOtp = ({ email: mail }) =>
    sendOtp({ email: mail }, {
      onSuccess: () => { setEmail(mail); setStep(2); startCooldown(); },
    });

  const onVerifyOtp = () =>
    verifyOtp({ email, otp }, {
      onSuccess: (res) => { setResetToken(res.resetToken); setStep(3); },
    });

  const handleResend = () => {
    setResendMsg("");
    sendOtp({ email }, {
      onSuccess: () => {
        setResendMsg("A new OTP has been sent to your email.");
        otpRef.current?.reset();
        setOtp("");
        startCooldown();
      },
      onError: (err) => setResendMsg(err.message || "Failed to resend OTP."),
    });
  };

  const onReset = ({ newPassword }) =>
    resetPass({ resetToken, newPassword }, { onSuccess: () => setStep(4) });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-md p-8">

          {/* ─── Step 1: Enter Email ─── */}
          {step === 1 && (
            <>
              <StepHeader
                icon={KeyRound}
                iconBg="bg-purple-100"
                iconColor="text-purple-600"
                title="Forgot Password?"
                subtitle="Enter your registered email and we'll send you a 6-digit OTP."
              />
              <ErrorBanner error={sendError} />
              <form onSubmit={submit1(onSendOtp)} noValidate className="space-y-5">
                <InputField
                  label="Email Address"
                  icon={Mail}
                  type="email"
                  placeholder="you@example.com"
                  registration={reg1("email", {
                    required: "Email is required",
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" },
                  })}
                  error={e1.email?.message}
                />
                <button type="submit" disabled={isSending} className={btnClass}>
                  {isSending ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-6">
                Remember your password?{" "}
                <Link href="/sign-in" className="text-purple-600 font-semibold hover:underline">Sign In</Link>
              </p>
            </>
          )}

          {/* ─── Step 2: Enter OTP ─── */}
          {step === 2 && (
            <>
              <StepHeader
                icon={ShieldCheck}
                iconBg="bg-blue-100"
                iconColor="text-blue-600"
                title="Enter OTP"
                subtitle={<>We sent a 6-digit code to <span className="font-medium text-gray-700">{email}</span>. It expires in 5 minutes.</>}
              />
              <ErrorBanner error={verifyError} />

              {resendMsg && (
                <p className="text-sm text-center text-purple-700 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 mb-5">
                  {resendMsg}
                </p>
              )}

              <form onSubmit={(e) => { e.preventDefault(); onVerifyOtp(); }} noValidate className="space-y-6">
                <OtpBoxInput ref={otpRef} onChange={setOtp} disabled={isVerifying} />
                <button type="submit" disabled={isVerifying || otp.length < OTP_LENGTH} className={btnClass}>
                  {isVerifying ? "Verifying..." : "Verify OTP"}
                </button>
              </form>

              <div className="mt-5 text-center">
                {resendCooldown > 0 ? (
                  <p className="text-sm text-gray-500">
                    Resend OTP in <span className="font-semibold">{resendCooldown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isSending}
                    className="inline-flex items-center gap-1.5 text-sm text-purple-600 font-semibold hover:underline disabled:opacity-60 cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    {isSending ? "Sending..." : "Resend OTP"}
                  </button>
                )}
              </div>
            </>
          )}

          {/* ─── Step 3: Set New Password ─── */}
          {step === 3 && (
            <>
              <StepHeader
                icon={Lock}
                iconBg="bg-green-100"
                iconColor="text-green-600"
                title="Set New Password"
                subtitle="OTP verified! Choose a strong new password."
              />
              <ErrorBanner error={resetError} />
              <form onSubmit={submit3(onReset)} noValidate className="space-y-5">
                <InputField
                  label="New Password"
                  icon={Lock}
                  type="password"
                  placeholder="Min. 8 characters"
                  registration={reg3("newPassword", {
                    required: "New password is required",
                    minLength: { value: 8, message: "Password must be at least 8 characters" },
                    pattern: { value: /^(?=.*[A-Za-z])(?=.*\d).+$/, message: "Must contain at least one letter and one number" },
                  })}
                  error={e3.newPassword?.message}
                />
                <InputField
                  label="Confirm New Password"
                  icon={Lock}
                  type="password"
                  placeholder="Re-enter new password"
                  registration={reg3("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (val) => val === watch("newPassword") || "Passwords do not match",
                  })}
                  error={e3.confirmPassword?.message}
                />
                <button type="submit" disabled={isResetting} className={btnClass}>
                  {isResetting ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}

          {/* ─── Step 4: Success ─── */}
          {step === 4 && (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-5">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Password Reset!</h1>
              <p className="text-sm text-gray-500 mb-8">
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <Link href="/sign-in" className={`inline-block text-center ${btnClass}`}>
                Go to Sign In
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
