'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Menu, X, Layers, Plus, MapPin, LogIn, UserPlus, LogOut, MessageSquare, UserCog, Briefcase, BookOpen, Gift } from 'lucide-react'
import Link from 'next/link'
import { images } from '@/data/assets'
import Image from 'next/image'
import { useAuth } from '@/app/context/AuthContext'

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { user, logout } = useAuth()

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const closeMenu = () => {
        setIsMenuOpen(false)
    }

    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const profileMenuRef = useRef(null)

    const toggleProfileMenu = () => {
        setIsProfileOpen(!isProfileOpen)
    }

    const closeProfileDropdown = () => {
        setIsProfileOpen(false)
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isMenuOpen])

    return (
        <>
            <header className="bg-white shadow-md sticky top-0 z-50">
                <nav className="flex items-center justify-between w-full py-3 px-4 md:px-8">
                    {/* Logo */}
                    <div className="flex-shrink-0 z-0">
                        <Link href="/" onClick={closeMenu}>
                            <Image
                                src={images.official_logo}
                                alt="Official Logo"
                                width={100}
                                height={40}
                                className="w-[70px] md:w-[100px]"
                                style={{ height: "auto" }}
                            />
                        </Link>
                    </div>

                    {/* Mobile Menu Button  (Right side) */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden p-2 -mr-2 rounded-xl text-gray-700 hover:bg-purple-100 transition-colors focus:outline-none"
                        aria-label="Toggle menu"
                    >
                        <Menu size={26} />
                    </button>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center">
                        <ul className="flex gap-2">
                            <li>
                                <Link
                                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-hover transition-colors rounded-lg hover:bg-purple-50"
                                    href="/categories"
                                >
                                    <Layers size={18} />
                                    <span>Categories</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-hover transition-colors rounded-lg hover:bg-purple-50"
                                    href="/services"
                                >
                                    <Briefcase size={18} />
                                    <span>Services</span>
                                </Link>
                            </li>
                            {user?.role !== "provider" && user?.role !== "admin" && (
                                <li>
                                    <Link
                                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-hover transition-colors rounded-lg hover:bg-purple-50"
                                        href="/add-business"
                                    >
                                        <Plus size={18} />
                                        <span>Add Business</span>
                                    </Link>
                                </li>
                            )}
                            <li>
                                <Link
                                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-hover transition-colors rounded-lg hover:bg-purple-50"
                                    href="/cities"
                                >
                                    <MapPin size={18} />
                                    <span>Cities</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-hover transition-colors rounded-lg hover:bg-purple-50"
                                    href="/contact-us"
                                >
                                    <MessageSquare size={18} />
                                    <span>Contact Us</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-hover transition-colors rounded-lg hover:bg-purple-50"
                                    href="/blog"
                                >
                                    <BookOpen size={18} />
                                    <span>Blog</span>
                                </Link>
                            </li>
                            {!user ? (
                                <li>
                                    <Link
                                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white font-semibold transition-colors rounded-lg font-medium"
                                        href="/sign-in"
                                    >
                                        <LogIn size={18} />
                                        <span>Sign In</span>
                                    </Link>
                                </li>
                            ) : (
                                <li ref={profileMenuRef} className="relative">
                                    {/* Profile Avatar */}
                                    <button
                                        onClick={toggleProfileMenu}
                                        className="flex items-center gap-2 focus:outline-none"
                                    >
                                        <Image
                                            src={user?.image || images.profile_picture}
                                            alt="profile"
                                            width={40}
                                            height={40}
                                            className="rounded-full border border-gray-300"
                                        />
                                    </button>

                                    {/* Dropdown */}
                                    {isProfileOpen && (
                                        <div className="absolute right-0 mt-3 w-48 bg-white shadow-lg rounded-lg border border-gray-100 overflow-hidden">

                                            <Link
                                                href={user?.role === "customer" ? "/customer-profile" : "/provider-profile"}
                                                onClick={closeProfileDropdown}
                                                className="block px-4 py-2 text-gray-700 hover:bg-purple-50"
                                            >
                                                {user?.role === "customer" ? "My Profile" : "Dashboard"}
                                            </Link>

                                            {user?.role === "provider" && (
                                                <Link
                                                    href="/referrals"
                                                    onClick={closeProfileDropdown}
                                                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-purple-50"
                                                >
                                                    {/* <Gift size={14} className="text-purple-500" /> */}
                                                    Referrals
                                                </Link>
                                            )}

                                            <button
                                                onClick={() => {
                                                    logout()
                                                    closeProfileDropdown()
                                                }}
                                                className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50"
                                            >
                                                Logout
                                            </button>

                                        </div>
                                    )}
                                </li>
                            )}

                            {user && user?.role === "admin" && (
                                <li className="ml-4">
                                    <Link
                                        className="flex items-center gap-2 px-4 py-2 text-white bg-primary hover:bg-primary-hover text-white font-semibold transition-colors rounded-lg font-medium"
                                        href="/admin"
                                    >
                                        <UserCog size={18} />
                                        <span>Admin</span>
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Mobile Navigation Drawer */}
                    {/* Overlay Backdrop */}
                    <div
                        onClick={closeMenu}
                        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[55] transition-opacity duration-300 md:hidden ${isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                            }`}
                        aria-hidden="true"
                    />

                    {/* Sliding Menu Panel */}
                    <div
                        className={`fixed top-0 right-0 h-[100dvh] w-[85vw] max-w-sm bg-white shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${isMenuOpen ? "translate-x-0" : "translate-x-full"
                            }`}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0 min-h-[72px]">
                            <h2 className="text-lg font-bold text-gray-800">Menu</h2>
                            <button
                                onClick={closeMenu}
                                className="p-2 -mr-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none flex items-center justify-center"
                                aria-label="Close menu"
                            >
                                <X size={26} className="text-gray-900" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto overscroll-contain pb-6 px-3 pt-2">
                            <ul className="flex flex-col gap-1">
                                <li>
                                    <Link
                                        className="flex items-center gap-3.5 px-4 py-3.5 text-gray-700 hover:text-primary hover:bg-primary/10 active:bg-primary/20 rounded-xl transition-all"
                                        href="/categories"
                                        onClick={closeMenu}
                                    >
                                        <Layers size={22} className="text-primary" />
                                        <span className="font-semibold text-[15px]">Categories</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className="flex items-center gap-3.5 px-4 py-3.5 text-gray-700 hover:text-primary hover:bg-primary/10 active:bg-primary/20 rounded-xl transition-all"
                                        href="/services"
                                        onClick={closeMenu}
                                    >
                                        <Briefcase size={22} className="text-primary" />
                                        <span className="font-semibold text-[15px]">Services</span>
                                    </Link>
                                </li>
                                {user && user?.role !== "provider" && user?.role !== "admin" && (
                                    <li>
                                        <Link
                                            className="flex items-center gap-3.5 px-4 py-3.5 text-gray-700 hover:text-primary hover:bg-primary/10 active:bg-primary/20 rounded-xl transition-all"
                                            href="/add-business"
                                            onClick={closeMenu}
                                        >
                                            <Plus size={22} className="text-primary" />
                                            <span className="font-semibold text-[15px]">Add Business</span>
                                        </Link>
                                    </li>
                                )}
                                <li>
                                    <Link
                                        className="flex items-center gap-3.5 px-4 py-3.5 text-gray-700 hover:text-primary hover:bg-primary/10 active:bg-primary/20 rounded-xl transition-all"
                                        href="/cities"
                                        onClick={closeMenu}
                                    >
                                        <MapPin size={22} className="text-primary" />
                                        <span className="font-semibold text-[15px]">Cities</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className="flex items-center gap-3.5 px-4 py-3.5 text-gray-700 hover:text-primary hover:bg-primary/10 active:bg-primary/20 rounded-xl transition-all"
                                        href="/contact-us"
                                        onClick={closeMenu}
                                    >
                                        <MessageSquare size={22} className="text-primary" />
                                        <span className="font-semibold text-[15px]">Contact Us</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className="flex items-center gap-3.5 px-4 py-3.5 text-gray-700 hover:text-primary hover:bg-primary/10 active:bg-primary/20 rounded-xl transition-all"
                                        href="/blog"
                                        onClick={closeMenu}
                                    >
                                        <BookOpen size={22} className="text-primary" />
                                        <span className="font-semibold text-[15px]">Blog</span>
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 border-t border-gray-100 shrink-0 pb-safe">
                            {!user ? (
                                <Link
                                    className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-primary text-white shadow-md shadow-primary/20 active:scale-[0.98] transition-all rounded-xl font-bold text-[15px]"
                                    href="/sign-in"
                                    onClick={closeMenu}
                                >
                                    <LogIn size={20} />
                                    <span>Sign In</span>
                                </Link>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3 px-2 py-1 mb-2">
                                        <Image
                                            src={user?.image || images.profile_picture}
                                            alt="profile"
                                            width={44}
                                            height={44}
                                            className="rounded-full border-2 border-white shadow-sm ring-2 ring-gray-100 object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">
                                                {user?.name || "User"}
                                            </p>
                                            <p className="text-xs text-gray-500 capitalize">
                                                {user?.role || "Member"}
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href={user?.role === "customer" ? "/customer-profile" : "/provider-profile"}
                                        onClick={closeMenu}
                                        className="flex items-center justify-center gap-2 w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl font-semibold transition-all active:scale-[0.98]"
                                    >
                                        {user?.role === "customer" ? "My Profile" : "Dashboard"}
                                    </Link>
                                    {user?.role === "provider" && (
                                        <Link
                                            href="/referrals"
                                            onClick={closeMenu}
                                            className="flex items-center justify-center gap-2 w-full py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl font-semibold transition-all active:scale-[0.98]"
                                        >
                                            {/* <Gift size={18} /> */}
                                            <span>Referrals</span>
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => { logout(); closeMenu(); }}
                                        className="flex items-center justify-center gap-2 w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-semibold transition-all active:scale-[0.98]"
                                    >
                                        <LogOut size={18} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>
            </header>
        </>
    )
}

export default Navbar