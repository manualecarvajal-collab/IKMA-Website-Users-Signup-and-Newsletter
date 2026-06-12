"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Footer() {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")
  return (
    <footer className={`bg-surface-container-low border-t border-outline-variant ${isAdmin ? "hidden" : ""}`}>
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-section-padding grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-gutter font-body-md text-body-md">
        <div className="sm:col-span-2">
          <Image src="/logo.png" alt="IKMA Logo" width={160} height={48} className="h-8 w-auto mb-4" />
          <p className="text-on-surface-variant mb-6 max-w-md">
            We have God’s grace and wisdom to bring solutions to the problems facing our society.
          </p>
          <p className="text-on-surface-variant text-sm">
            &copy; 2025 International Kingdom Medical Association. Healing through faith and excellence.
          </p>
        </div>
        <div>
          <h4 className="text-on-background font-bold mb-4">Legal</h4>
          <ul className="space-y-3">
            <li>
              <Link
                href="#"
                className="text-on-surface-variant hover:text-primary hover:underline transition-all duration-200 hover:opacity-80"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-on-surface-variant hover:text-primary hover:underline transition-all duration-200 hover:opacity-80"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-on-background font-bold mb-4">Resources</h4>
          <ul className="space-y-3">
            <li>
              <Link
                href="#"
                className="text-on-surface-variant hover:text-primary hover:underline transition-all duration-200 hover:opacity-80"
              >
                Donor Rights
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-on-surface-variant hover:text-primary hover:underline transition-all duration-200 hover:opacity-80"
              >
                Annual Report
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
