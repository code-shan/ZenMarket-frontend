"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react"

import { AUTH_CHANGED_EVENT, isAuthenticated } from "@/lib/auth"
import { cn } from "@/lib/utils"

const YEAR = new Date().getFullYear()

function FooterHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-sm font-semibold tracking-wide text-white">{children}</h3>
  )
}

function FooterLink({
  href,
  children,
  className,
}: {
  href: string
  children: ReactNode
  className?: string
}) {
  const isHash = href.startsWith("#")
  return (
    <Link
      href={href}
      className={cn(
        "text-sm text-gray-300 underline-offset-4 transition-colors hover:text-white hover:underline",
        className
      )}
      {...(isHash ? { scroll: false } : {})}
    >
      {children}
    </Link>
  )
}

export function Footer({ className }: { className?: string }) {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    function sync() {
      if (typeof window === "undefined") return
      setLoggedIn(isAuthenticated())
    }
    sync()
    window.addEventListener(AUTH_CHANGED_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  return (
    <footer
      className={cn(
        "border-t border-white/10 bg-slate-900 text-gray-300",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-8 lg:grid-cols-4 lg:gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block font-heading text-xl font-bold tracking-tight text-white transition-colors hover:text-white/90"
            >
              ZenMarket
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-gray-400">
              Your trusted marketplace for quality products at the best prices.
            </p>
            <p className="text-xs text-gray-500">Shop calm. Checkout simple.</p>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <FooterHeading>Quick links</FooterHeading>
            <ul className="flex flex-col gap-3">
              <li>
                <FooterLink href="/">Home</FooterLink>
              </li>
              <li>
                <FooterLink href="/products">Products</FooterLink>
              </li>
              <li>
                <FooterLink href="/categories">Categories</FooterLink>
              </li>
              <li>
                <FooterLink href="/cart">Cart</FooterLink>
              </li>
              {loggedIn ? (
                <>
                  <li>
                    <FooterLink href="/orders">My orders</FooterLink>
                  </li>
                  <li>
                    <FooterLink href="/profile">Profile</FooterLink>
                  </li>
                </>
              ) : null}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <FooterHeading>Customer support</FooterHeading>
            <ul className="flex flex-col gap-3">
              <li>
                <FooterLink href="#">Help center</FooterLink>
              </li>
              <li>
                <FooterLink href="#">Contact us</FooterLink>
              </li>
              <li>
                <FooterLink href="#">FAQs</FooterLink>
              </li>
              <li>
                <FooterLink href="#">Privacy policy</FooterLink>
              </li>
              <li>
                <FooterLink href="#">Terms &amp; conditions</FooterLink>
              </li>
            </ul>
          </div>

          {/* Contact & social */}
          <div className="space-y-4">
            <FooterHeading>Contact</FooterHeading>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <a
                  href="mailto:support@zenmarket.com"
                  className="flex items-start gap-2 text-gray-300 underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  <MailIcon
                    className="mt-0.5 size-4 shrink-0 text-gray-400"
                    aria-hidden
                  />
                  <span>support@zenmarket.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+61400000000"
                  className="flex items-start gap-2 text-gray-300 underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  <PhoneIcon
                    className="mt-0.5 size-4 shrink-0 text-gray-400"
                    aria-hidden
                  />
                  <span className="tabular-nums">+61 400 000 000</span>
                </a>
              </li>
              <li className="flex items-start gap-2 text-gray-400">
                <MapPinIcon
                  className="mt-0.5 size-4 shrink-0 text-gray-500"
                  aria-hidden
                />
                <span>123 Example Street, Melbourne VIC 3000, Australia</span>
              </li>
            </ul>
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="ZenMarket on Facebook"
              >
                <svg
                  className="size-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="ZenMarket on Instagram"
              >
                <svg
                  className="size-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="ZenMarket on X (Twitter)"
              >
                <svg
                  className="size-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-center gap-2 text-center text-xs text-gray-500 sm:text-sm">
            <p>
              © {YEAR} ZenMarket. All rights reserved.
            </p>
            <p className="text-[0.65rem] text-gray-600 sm:text-xs">
              Built with care for shoppers in the world.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
