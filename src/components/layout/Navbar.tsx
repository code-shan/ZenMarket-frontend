"use client"

import type { ReactNode } from "react"
import { useLayoutEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingBagIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/#about", label: "About" },
] as const

function NavLink({
  href,
  children,
  pathname,
  routeHash,
}: {
  href: string
  children: ReactNode
  pathname: string
  routeHash: string
}) {
  const productsActive =
    pathname === "/products" || pathname.startsWith("/products/")

  let active = false
  if (href === "/") {
    active = pathname === "/" && routeHash === ""
  } else if (href.startsWith("/#")) {
    active = pathname === "/" && routeHash === href.slice(1)
  } else if (href === "/categories") {
    active = pathname === "/categories" || pathname.startsWith("/categories/")
  } else if (href === "/products") {
    active = productsActive
  } else {
    active = pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-1 py-0.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground",
        active && "text-foreground"
      )}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  )
}

export function Navbar({ className }: { className?: string }) {
  const pathname = usePathname()
  const [routeHash, setRouteHash] = useState("")

  useLayoutEffect(() => {
    const syncHash = () => setRouteHash(window.location.hash)
    syncHash()
    window.addEventListener("hashchange", syncHash)
    return () => window.removeEventListener("hashchange", syncHash)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/80 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 dark:bg-background/90 dark:supports-[backdrop-filter]:bg-background/75",
        className
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6 lg:gap-x-8 lg:px-8 lg:py-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-foreground lg:text-xl"
          >
            ZenMarket
          </Link>
          <p className="hidden text-xs text-muted-foreground sm:block sm:max-w-[14rem] lg:max-w-none">
            Smart shopping, simple checkout
          </p>
        </div>

        <nav
          aria-label="Primary"
          className="order-3 flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:order-none sm:flex-1 lg:justify-center lg:gap-x-8"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <NavLink
              key={`${href}-${label}`}
              href={href}
              pathname={pathname}
              routeHash={routeHash}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            size="sm"
            className="gap-1.5 shadow-sm ring-1 ring-primary/15"
            nativeButton={false}
            render={<Link href="/cart" />}
            aria-label="Shopping cart"
          >
            <ShoppingBagIcon className="size-4" aria-hidden />
            Cart
          </Button>
        </div>
      </div>
    </header>
  )
}
