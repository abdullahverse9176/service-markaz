"use client";

import { images } from '@/data/assets'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import WhiteBtn from './buttons/WhiteBtn'
import { useAuth } from '@/app/context/AuthContext'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const { user } = useAuth()

  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: 'Cities', href: '/cities' },
    { label: 'Blog', href: '/blog' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact Us', href: '/contact-us' },
  ]

  // Dynamic business links based on authentication
  const getBusinessLinks = () => {
    if (!user) {
      // Not logged in - show sign in/up
      return [
        { label: 'List Your Business', href: '/add-business' },
        { label: 'Sign In', href: '/sign-in' },
        { label: 'Sign Up', href: '/sign-up' },
      ]
    }

    if (user.role === 'admin') {
      // Admin user
      return [
        { label: 'Admin Dashboard', href: '/admin/dashboard' },
        { label: 'Manage Businesses', href: '/admin/businesses' },
        { label: 'Manage Users', href: '/admin/users' },
        { label: 'Settings', href: '/admin/settings' },
      ]
    }

    if (user.role === 'provider') {
      // Provider user
      return [
        { label: 'My Dashboard', href: '/provider-profile' },
        { label: 'Referrals', href: '/referrals' },
      ]
    }

    // Customer user
    return [
      { label: 'List Your Business', href: '/add-business' },
      { label: 'My Profile', href: '/profile' },
      { label: 'My Reviews', href: '/profile/reviews' },
    ]
  }

  const businessLinks = getBusinessLinks()

  const popularCategories = [
    { label: 'Electricians', href: '/categories/electrician' },
    { label: 'Plumbers', href: '/categories/plumber' },
    { label: 'AC Repair', href: '/categories/ac-repair' },
    { label: 'Carpenters', href: '/categories/carpenter' },
    { label: 'Painters', href: '/categories/painter' },
    { label: 'Home Cleaning', href: '/categories/home-cleaning' },
  ]

  const socialLinks = [
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/service.markaz',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/service.markaz',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      label: 'Twitter / X',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: 'WhatsApp',
      href: 'https://whatsapp.com/channel/0029Vb7bvf6KWEKvfxeK4t0z',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
  ]

  return (
    <>
      <footer className="bg-gray-950 border-t-4 border-teal-500">

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-[#0ea577] to-[#018094]">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-white text-lg font-bold text-center sm:text-left">
                  Apna Business List Karein — Bilkul Free!
                </h3>
                <p className="text-teal-100 text-sm mt-1 text-center sm:text-left">
                  Hazaron customers tak pahunchein — aaj hi register karein.
                </p>
              </div>
              <WhiteBtn href="/add-business" title="Business Add Karein" />
            </div>
          </div>
        </div>

        {/* Main Footer */}
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

            {/* Brand Column */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="inline-block">
                <Image src={images.footer_logo} width={130} height={80} alt="Service Markaz Logo" style={{ height: "auto" }} />
              </Link>
              <p className="mt-5 text-sm leading-relaxed text-gray-400 max-w-xs">
                Service Markaz Pakistan ka trusted local business directory hai. Apne shehar ke best service providers dhundhein — electricians, plumbers, AC repair aur bahut kuch.
              </p>

              {/* Contact Info */}
              <ul className="mt-6 space-y-3 text-sm">
                {/* <li>
                  <a href="mailto:info@servicemarkaz.pk" className="flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    info@servicemarkaz.pk
                  </a>
                </li>
                <li>
                  <a href="tel:+923001234567" className="flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    +92 300 1234567
                  </a>
                </li> */}
                <li className="flex items-start gap-2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <address className="not-italic text-sm leading-relaxed">
                    Islamabad, Pakistan
                  </address>
                </li>
              </ul>

              {/* Social Links */}
              <ul className="flex items-center gap-3 mt-6">
                {socialLinks.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      rel="noopener noreferrer"
                      target="_blank"
                      aria-label={social.label}
                      className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-800 text-gray-400 hover:bg-teal-500 hover:text-white transition-all"
                    >
                      {social.icon}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-teal-400">
                Quick Links
              </p>
              <nav className="mt-5">
                <ul className="space-y-3">
                  {quickLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-teal-400 transition-colors group"
                      >
                        <span className="w-1 h-1 rounded-full bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Popular Categories */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-teal-400">
                Popular Categories
              </p>
              <nav className="mt-5">
                <ul className="space-y-3">
                  {popularCategories.map((cat) => (
                    <li key={cat.href}>
                      <Link
                        href={cat.href}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-teal-400 transition-colors group"
                      >
                        <span className="w-1 h-1 rounded-full bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {cat.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* For Businesses / Account */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-teal-400">
                {user ? (user.role === 'admin' ? 'Admin Panel' : user.role === 'provider' ? 'My Account' : 'My Account') : 'Businesses Ke Liye'}
              </p>
              <nav className="mt-5">
                <ul className="space-y-3">
                  {businessLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-teal-400 transition-colors group"
                      >
                        <span className="w-1 h-1 rounded-full bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-6 border-t border-gray-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-500 text-center sm:text-left">
                &copy; {currentYear} Service Markaz. All rights reserved.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
                <Link href="/terms" className="text-gray-500 hover:text-teal-400 transition-colors">
                  Terms &amp; Conditions
                </Link>
                <span className="text-gray-700">·</span>
                <Link href="/privacy" className="text-gray-500 hover:text-teal-400 transition-colors">
                  Privacy Policy
                </Link>
                <span className="text-gray-700">·</span>
                <Link href="/contact-us" className="text-gray-500 hover:text-teal-400 transition-colors">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>

        </div>
      </footer>
    </>
  )
}

export default Footer