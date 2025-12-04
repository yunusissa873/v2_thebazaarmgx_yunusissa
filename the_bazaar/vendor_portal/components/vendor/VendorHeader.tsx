/**
 * Vendor Header Component
 * Logo left, tabs center, hamburger right
 * 
 * @author The Bazaar Development Team
 * @schema vendor_portal_spec.json
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const tabs = [
  { name: "Profile", href: "/vendor/dashboard/profile" },
  { name: "Commerce", href: "/vendor/dashboard/commerce" },
  { name: "Analytics", href: "/vendor/dashboard/analytics" },
  { name: "Finance", href: "/vendor/dashboard/finance" },
];

export default function VendorHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold">
              <span className="text-[#E50914]">The</span> Bazaar
            </span>
          </Link>

          {/* Center Tabs - Desktop */}
          <nav className="hidden md:flex space-x-8">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3 py-2 text-sm font-medium ${
                  pathname === tab.href
                    ? "text-[#E50914] border-b-2 border-[#E50914]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.name}
              </Link>
            ))}
          </nav>

          {/* Hamburger Menu */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/vendor/support" className="text-gray-600 hover:text-gray-900 text-sm">
              Support
            </Link>
            <Link href="/vendor/support" className="text-gray-600 hover:text-gray-900 text-sm">
              Help
            </Link>
            <button className="text-gray-600 hover:text-gray-900 text-sm">Logout</button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-3 py-2 text-sm font-medium ${
                    pathname === tab.href ? "text-[#E50914]" : "text-gray-600"
                  }`}
                >
                  {tab.name}
                </Link>
              ))}
              <Link href="/vendor/support" className="block px-3 py-2 text-sm text-gray-600">
                Support
              </Link>
              <Link href="/vendor/support" className="block px-3 py-2 text-sm text-gray-600">
                Help
              </Link>
              <button className="block px-3 py-2 text-sm text-gray-600 w-full text-left">Logout</button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
