import { CheckCircle, ShieldCheck } from "lucide-react";

/**
 * VerifiedBadge Component
 * Displays a verified badge for verified businesses.
 * Can be used in different sizes and styles.
 * 
 * @param {string} variant - "icon" | "text" | "full" (default: "icon")
 * @param {string} size - "sm" | "md" | "lg" (default: "md")
 * @param {string} className - Additional CSS classes
 */
export default function VerifiedBadge({ variant = "icon", size = "md", className = "" }) {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  // Icon only (checkmark)
  if (variant === "icon") {
    return (
      <div
        className={`inline-flex items-center justify-center ${className}`}
        title="Verified Business"
      >
        <CheckCircle
          size={iconSizes[size]}
          className="text-green-500 fill-green-100"
        />
      </div>
    );
  }

  // Text badge only
  if (variant === "text") {
    return (
      <span
        className={`inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium ${sizeClasses[size]} ${className}`}
      >
        Verified
      </span>
    );
  }

  // Full badge with icon and text
  return (
    <span
      className={`inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium ${sizeClasses[size]} ${className}`}
    >
      <CheckCircle size={iconSizes[size]} className="text-green-600" />
      Verified
    </span>
  );
}

/**
 * VerifiedShieldBadge Component
 * Alternative badge style with shield icon (for premium/featured look).
 */
export function VerifiedShieldBadge({ size = "md", className = "" }) {
  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2.5 py-1 rounded-full font-semibold shadow-sm ${sizeClasses[size]} ${className}`}
    >
      <ShieldCheck size={iconSizes[size]} className="text-white" />
      Verified
    </span>
  );
}
