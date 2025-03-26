"use client";
import React, { useState, useEffect, useRef } from "react";
import { Music2, Menu, X, LogOut, ChevronDown } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import SignInButton from "./signin";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const pathname = usePathname();
  const session = useSession();

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (
      session.status === "authenticated" &&
      (pathname === "/" || pathname === "/auth/signin")
    ) {
      router.push("/dashboard"); 
    } else if (session.status === "unauthenticated" && pathname !== "/") {
      router.push("/");
    }
  }, [session.status, router]);

  const handleLogout = () => {
    signOut()
    router.push("/")
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "py-2 bg-black/80 backdrop-blur-xl border-b border-red-600/20"
            : "py-4 bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute -inset-2 bg-red-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Music2 className="w-8 h-8 text-red-600 transform group-hover:scale-110 group-hover:rotate-180 transition-all duration-700" />
                <div className="absolute inset-0 bg-red-600/20 blur-xl rounded-full group-hover:bg-red-600/40 transition-colors duration-500"></div>
              </div>
              <h1 className="text-3xl font-bold neon-text relative">
                Muzeerrr
                <span className="absolute -inset-1 bg-red-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
              </h1>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-6">
              {session?.data?.user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 px-4 py-2 rounded-full bg-black/70 hover:bg-red-600/20 border border-red-600/30 transition-all duration-300"
                  >
                    <Image
                      src={session.data.user.image || "/default-avatar.png"}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-white">{session.data.user.name || "User"}</span>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-black/90 border border-red-600/20 rounded-lg shadow-lg overflow-hidden z-50 animate-fade-in">
                      <button
                        onClick={() => handleLogout()}
                        className="w-full cursor-pointer text-left px-4 py-3 text-gray-300 hover:bg-red-600/20 transition-all duration-300"
                      >
                        <LogOut size={18} className="inline mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <SignInButton label="Sign In / Log In" variant="default" />
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden nav-icon-btn group"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <div className="relative w-6 h-6 flex items-center justify-center">
                <div
                  className={`transition-all duration-300 ${
                    isMobileMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <Menu className="w-6 h-6 absolute inset-0" />
                </div>
                <div
                  className={`transition-all duration-300 ${
                    isMobileMenuOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <X className="w-6 h-6 absolute inset-0" />
                </div>
              </div>
              <span className="nav-icon-glow"></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/95 backdrop-blur-xl"></div>
        <div className="relative h-full container mx-auto px-4 py-20">
          <div className="flex flex-col gap-6">
            {["Explore", "Trending", "Library", "About"].map((item, index) => (
              <MobileNavLink
                key={item}
                href="#"
                label={item}
                style={{
                  transform: `translateX(${isMobileMenuOpen ? "0" : "100px"})`,
                  opacity: isMobileMenuOpen ? 1 : 0,
                  transition: `all 0.3s ease ${index * 0.1}s`,
                }}
              />
            ))}
            <div className="h-px bg-red-600/20 my-4"></div>

            {session?.data?.user ? (
              <button
                onClick={() => signOut()}
                className="w-full py-3 rounded-full border border-red-600 hover:bg-red-600/20 transition-all duration-300 relative group overflow-hidden"
              >
                <span className="relative z-10">Logout</span>
              </button>
            ) : (
              <SignInButton label="Sign In / Log In" variant="fullWidth" />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// MobileNavLink component
function MobileNavLink({ href, label, style = {} }: { href: string; label: string; style?: React.CSSProperties }) {
  return (
    <a
      href={href}
      className="text-2xl font-semibold text-gray-300 hover:text-white transition-colors flex items-center gap-4 group"
      style={style}
    >
      <span className="w-2 h-2 rounded-full bg-red-600 group-hover:scale-150 transition-transform duration-300"></span>
      {label}
    </a>
  );
}
