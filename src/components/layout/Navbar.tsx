"use client"

import type { ReactNode } from "react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDownIcon, ShoppingBagIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  AUTH_CHANGED_EVENT,
  getInitialsFromName,
  getStoredUser,
  isAuthenticated,
  logoutUser,
} from "@/lib/auth"
import { cn } from "@/lib/utils"
import type { User } from "@/types/auth"

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

function UserAccountMenu({ user }: { user: User }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const initials = getInitialsFromName(user.name)

  useEffect(() => {
    if (!open) return
    function onPointerDown(ev: MouseEvent | TouchEvent) {
      const el = wrapRef.current
      const target = ev.target as Node | null
      if (!el || !target || el.contains(target)) return
      setOpen(false)
    }
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("touchstart", onPointerDown, { passive: true })
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("touchstart", onPointerDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  function handleLogout() {
    setOpen(false)
    logoutUser()
    router.push("/")
    router.refresh()
  }

  const menuId = "navbar-user-menu"

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        id="navbar-user-menu-button"
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-[min(var(--radius-md),12px)] border border-border bg-background px-1.5 text-[0.8rem] font-medium shadow-sm outline-none transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[0.65rem] font-semibold uppercase leading-none text-primary ring-1 ring-primary/20"
          aria-hidden
        >
          {initials}
        </span>
        <span className="hidden max-w-[7rem] truncate sm:inline">
          {user.name.trim().split(/\s+/)[0] ?? user.name}
        </span>
        <ChevronDownIcon
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-labelledby="navbar-user-menu-button"
          className="absolute right-0 z-[60] mt-2 min-w-[11rem] rounded-xl border border-border bg-popover py-1 text-popover-foreground shadow-lg outline-none dark:bg-popover"
        >
          <Link
            href="/profile"
            role="menuitem"
            className="block px-3 py-2 text-sm font-medium hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            className="w-full px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function Navbar({ className }: { className?: string }) {
  const pathname = usePathname()
  const [routeHash, setRouteHash] = useState("")
  const [user, setUser] = useState<User | null | undefined>(undefined)

  useLayoutEffect(() => {
    const syncHash = () => setRouteHash(window.location.hash)
    syncHash()
    window.addEventListener("hashchange", syncHash)
    return () => window.removeEventListener("hashchange", syncHash)
  }, [])

  useEffect(() => {
    function syncAuth() {
      if (!isAuthenticated()) {
        setUser(null)
        return
      }
      const next = getStoredUser()
      setUser(next ?? null)
    }
    syncAuth()
    window.addEventListener(AUTH_CHANGED_EVENT, syncAuth)
    window.addEventListener("storage", syncAuth)
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncAuth)
      window.removeEventListener("storage", syncAuth)
    }
  }, [])

  /** Guests must sign in to open the cart; logged-in (or still hydrating) users use /cart. */
  const cartHref = user === null ? "/login?redirect=/cart" : "/cart"

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

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {user === undefined ? (
            <>
              <div className="flex items-center gap-2 sm:gap-3" aria-hidden>
                <div className="hidden h-7 w-16 animate-pulse rounded-md bg-muted sm:block" />
                <div className="h-7 w-14 animate-pulse rounded-md bg-muted" />
              </div>
              <Button
                size="sm"
                className="gap-1.5 shadow-sm ring-1 ring-primary/15"
                nativeButton={false}
                render={<Link href={cartHref} />}
                aria-label="Shopping cart"
              >
                <ShoppingBagIcon className="size-4" aria-hidden />
                Cart
              </Button>
            </>
          ) : user ? (
            <>
              <UserAccountMenu user={user} />
              <Button
                size="sm"
                className="gap-1.5 shadow-sm ring-1 ring-primary/15"
                nativeButton={false}
                render={<Link href={cartHref} />}
                aria-label="Shopping cart"
              >
                <ShoppingBagIcon className="size-4" aria-hidden />
                Cart
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Register
              </Link>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Login
              </Button>
              <Button
                size="sm"
                className="gap-1.5 shadow-sm ring-1 ring-primary/15"
                nativeButton={false}
                render={<Link href={cartHref} />}
                aria-label="Shopping cart"
              >
                <ShoppingBagIcon className="size-4" aria-hidden />
                Cart
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
