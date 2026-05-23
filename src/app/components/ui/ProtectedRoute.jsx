"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

/**
 * Wraps any page or layout to enforce authentication / role requirements.
 *
 * Props:
 *   requiredRole  – if set, user must have this role (e.g. "admin")
 *                   can also be an array of allowed roles (e.g. ["provider", "admin"])
 *                   if omitted, any authenticated user is allowed
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const allowedRoles = requiredRole
    ? Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole]
    : null;

  const roleAllowed = !allowedRoles || (user && allowedRoles.includes(user.role));

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!roleAllowed) {
      router.replace("/");
    }
  }, [user, loading, roleAllowed, router, pathname]);

  // Show spinner while auth state is hydrating or redirect is in-flight
  if (loading || !user || !roleAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return children;
}
