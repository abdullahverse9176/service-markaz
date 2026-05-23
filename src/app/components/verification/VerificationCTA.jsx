"use client";

import { ShieldCheck, Clock, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useVerification } from "@/app/hooks/useVerification";

/**
 * VerificationCTA Component
 * Shows verification status and CTA button on provider dashboard.
 * Displays different states: not submitted, pending, approved, rejected, resubmission required.
 * Redirects to /verify-business page instead of opening modal.
 */
export default function VerificationCTA() {
  const { data, isLoading } = useVerification();

  if (isLoading) {
    return null; // Don't show anything while loading
  }

  // Already verified - don't show CTA
  if (data?.isVerified) {
    return null;
  }

  // No verification submitted yet - show primary CTA
  if (!data?.hasVerification) {
    return (
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 bg-white/20 rounded-xl flex-shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Get Verified</h3>
            <p className="text-sm text-blue-100 leading-snug">
              Boost your credibility and get more customers by verifying your business. It only takes 2 minutes!
            </p>
          </div>
        </div>
        <Link
          href="/verify-business"
          className="block w-full bg-white text-blue-600 font-semibold py-2.5 px-4 rounded-xl hover:bg-blue-50 transition active:scale-[0.98] text-center"
        >
          Start Verification
        </Link>
      </div>
    );
  }

  const verification = data.verification;

  // Pending review
  if (verification.status === "pending") {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-xl flex-shrink-0">
            <Clock size={22} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-900 mb-1">Verification Pending</h3>
            <p className="text-sm text-amber-700 leading-snug">
              Your verification request is under review. We'll notify you once it's approved.
            </p>
            <p className="text-xs text-amber-600 mt-2">
              Submitted: {new Date(verification.submittedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Rejected
  if (verification.status === "rejected") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 bg-red-100 rounded-xl flex-shrink-0">
            <XCircle size={22} className="text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-red-900 mb-1">Verification Rejected</h3>
            <p className="text-sm text-red-700 leading-snug mb-2">
              {verification.rejectionReason || "Your verification request was rejected."}
            </p>
            <p className="text-xs text-red-600">
              You can resubmit with corrected documents.
            </p>
          </div>
        </div>
        <Link
          href="/verify-business"
          className="block w-full bg-red-600 text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-red-700 transition active:scale-[0.98] text-center"
        >
          Resubmit Documents
        </Link>
      </div>
    );
  }

  // Resubmission required
  if (verification.status === "resubmission_required") {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 bg-orange-100 rounded-xl flex-shrink-0">
            <AlertCircle size={22} className="text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-orange-900 mb-1">Resubmission Required</h3>
            <p className="text-sm text-orange-700 leading-snug mb-2">
              {verification.rejectionReason || "Please resubmit your documents with corrections."}
            </p>
          </div>
        </div>
        <Link
          href="/verify-business"
          className="block w-full bg-orange-600 text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-orange-700 transition active:scale-[0.98] text-center"
        >
          Resubmit Documents
        </Link>
      </div>
    );
  }

  return null;
}
