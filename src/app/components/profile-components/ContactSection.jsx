"use client";

import { Phone, MessageCircle, Mail, PhoneCall, Lock, ShieldAlert } from "lucide-react";
import { buildWhatsAppLink } from "@/utils/whatsapp";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useTrackLead } from "@/app/hooks/useLead";

const contactActions = [
  {
    key: "phone",
    source: "call",
    label: "Call Now",
    icon: PhoneCall,
    href: (v) => `tel:${v}`,
    gradient: "from-blue-500 to-blue-600",
    hoverShadow: "hover:shadow-blue-200",
  },
  {
    key: "whatsapp",
    source: "whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
    href: (v, name, category, city) => buildWhatsAppLink(v, name, category, city),
    external: true,
    gradient: "from-green-500 to-green-600",
    hoverShadow: "hover:shadow-green-200",
  },
  {
    key: "email",
    source: "form",
    label: "Send Email",
    icon: Mail,
    href: (v) => `mailto:${v}`,
    gradient: "from-purple-500 to-purple-600",
    hoverShadow: "hover:shadow-purple-200",
  },
];

export default function ContactSection({ provider, businessId }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const { mutate: trackLead } = useTrackLead(businessId);

  return (
    <div className="bg-white sm:shadow-sm sm:rounded-2xl p-5 sm:p-6 border-b sm:border-none border-gray-100">
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg">
          <Phone size={18} className="text-blue-600" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Get In Touch</h2>
      </div>

      {!loading && !user ? (
        <div className="flex flex-col items-center gap-3 sm:gap-4 py-3 sm:py-4 text-center">
          <div className="p-2.5 sm:p-3 bg-gray-50 sm:bg-gray-100 rounded-full">
            <Lock size={20} className="text-gray-500 sm:text-gray-600 sm:w-[22px] sm:h-[22px]" />
          </div>
          <div>
            <p className="font-semibold text-gray-700 text-sm sm:text-base">Sign in to view contact info</p>
            <p className="text-[11px] sm:text-xs text-gray-500 sm:text-gray-400 mt-1 max-w-[250px] mx-auto">
              Create a free account or sign in to see phone, WhatsApp, and email details.
            </p>
          </div>
          <Link
            href={`/sign-in?redirect=${encodeURIComponent(pathname)}`}
            className="w-full py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition text-center shadow-md shadow-blue-200"
          >
            Sign In to View
          </Link>
          <p className="text-[11px] sm:text-xs text-gray-500 sm:text-gray-400 mt-1">
            No account?{" "}
            <Link
              href={`/sign-up?redirect=${encodeURIComponent(pathname)}`}
              className="text-blue-600 font-semibold hover:text-blue-700 transition"
            >
              Register for free
            </Link>
          </p>
        </div>
      ) : user && !user.isEmailVerified ? (
        <div className="flex flex-col items-center gap-3 sm:gap-4 py-3 sm:py-4 text-center">
          <div className="p-2.5 sm:p-3 bg-amber-50 rounded-full">
            <ShieldAlert size={20} className="text-amber-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-700 text-sm sm:text-base">Verify your account first</p>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-1 max-w-[260px] mx-auto">
              Email verification is required to view provider contact details.
            </p>
          </div>
          <Link
            href={`/verify-email?redirect=${encodeURIComponent(pathname)}`}
            className="w-full py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition text-center shadow-md shadow-amber-200"
          >
            Verify Email
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          {contactActions.map(({ key, source, label, icon: Icon, href, external, gradient, hoverShadow }) => {
            const value = provider.contact[key];
            if (!value) return null;
            return (
              <a
                key={key}
                href={href(value, provider.name, provider.category, provider.city)}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                onClick={() => user && trackLead(source)}
                className={`flex items-center gap-3 sm:gap-3.5 px-4 sm:px-5 py-3 sm:py-3.5 bg-gradient-to-r ${gradient} text-white rounded-xl sm:rounded-2xl hover:shadow-lg ${hoverShadow} hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200`}
              >
                <div className="p-2 sm:p-2.5 bg-white/20 rounded-lg sm:rounded-xl">
                  <Icon size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                  <p className="text-[11px] sm:text-xs opacity-90 font-medium tracking-wide uppercase">{label}</p>
                  <p className="font-semibold text-sm sm:text-base tracking-wide mt-0.5">{value}</p>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
