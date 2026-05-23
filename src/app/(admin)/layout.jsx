"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/app/components/ui/ProtectedRoute";
import {
  LayoutDashboard, Users, Building2, ListChecks, MapPin,
  Star, MessageSquare, Settings, Menu, X, LogOut, Bell, TrendingUp, BookOpen, Gift, ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { images } from "@/data/assets";
import Image from "next/image";

const sidebarLinks = [
  { name: "Dashboard",      href: "/admin/dashboard",      icon: LayoutDashboard },
  { name: "Users",          href: "/admin/users",          icon: Users },
  { name: "Businesses",     href: "/admin/businesses",     icon: Building2 },
  { name: "Verifications",  href: "/admin/verifications",  icon: ShieldCheck },
  { name: "Categories",     href: "/admin/categories",     icon: ListChecks },
  { name: "Cities",         href: "/admin/cities",         icon: MapPin },
  { name: "Blogs",          href: "/admin/blogs",          icon: BookOpen },
  { name: "Reviews",        href: "/admin/reviews",        icon: Star },
  { name: "Leads",          href: "/admin/leads",          icon: TrendingUp },
  { name: "Referrals",      href: "/admin/referrals",      icon: Gift },
  { name: "Messages",       href: "/admin/messages",       icon: MessageSquare },
  { name: "Settings",       href: "/admin/settings",       icon: Settings },
];

function Sidebar({ onClose }) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div>
          <Link href="/">
            <Image
              src={images.official_logo}
              alt="ServiceMarkaz Logo"
              width={120}
              height={40} />
          </Link>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon size={18} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">Super Admin</p>
            <p className="text-xs text-gray-400 truncate">admin@servicemarkaz.com</p>
          </div>
          <button className="text-gray-400 hover:text-red-500 transition" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const pageTitle = sidebarLinks.find((l) => l.href === pathname)?.name ?? "Admin Panel";

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white shadow-sm border-r border-gray-100 hidden md:flex flex-col flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-50 w-64 bg-white flex flex-col shadow-xl">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-gray-500 hover:text-gray-800"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={22} />
            </button>
            <h1 className="text-base font-semibold text-gray-800">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative text-gray-500 hover:text-gray-800 transition">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">3</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
