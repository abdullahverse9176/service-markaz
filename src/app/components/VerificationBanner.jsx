"use client";

import { ShieldAlert, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

/**
 * Shown below the Navbar for any locally-registered user whose email is not yet verified.
 * Hidden on the verify-email page itself.
 */
export default function VerificationBanner() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);

  if (
    loading ||
    dismissed ||
    !user ||
    user.isEmailVerified ||
    pathname.startsWith("/verify-email")
  ) {
    return null;
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-amber-800">
        <ShieldAlert size={16} className="flex-shrink-0 text-amber-500" />
        <span>
          Your email is not verified.{" "}
          <Link
            href={`/verify-email?redirect=${encodeURIComponent(pathname)}`}
            className="font-semibold underline hover:text-amber-900"
          >
            Verify now
          </Link>{" "}
          for full access.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="p-1 rounded hover:bg-amber-100 text-amber-600 flex-shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}
