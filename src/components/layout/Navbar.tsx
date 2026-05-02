"use client"

import type { ReactNode } from "react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronDownIcon,
  ClipboardListIcon,
  LogOutIcon,
  ShoppingBagIcon,
  UserRoundIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  AUTH_CHANGED_EVENT,
  clearLegacyAuthStorage,
  fetchSession,
  getInitialsFromName,
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
  const displayName = user.name.trim() || "Account"
  const firstName = displayName.split(/\s+/)[0] ?? displayName

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

  async function handleLogout() {
    setOpen(false)
    await logoutUser()
    router.push("/")
    router.refresh()
  }

  const menuId = "navbar-user-menu"

  return (
    <div className="relative" ref={wrapRef}>
      <Button
        type="button"
        id="navbar-user-menu-button"
        variant="outline"
        size="sm"
        className={cn(
          "h-8 max-w-full gap-2 rounded-lg border-border/90 bg-background px-1.5 pr-2 shadow-sm transition-colors sm:pr-2.5",
          open && "border-primary/35 bg-muted/60"
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-label={`Account menu for ${displayName}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/25 to-primary/10 text-[0.65rem] font-semibold uppercase leading-none text-primary ring-1 ring-primary/15"
          aria-hidden
        >
          {initials}
        </span>
        <span className="hidden min-w-0 flex-1 flex-col items-start text-left sm:flex">
          <span className="max-w-[7rem] truncate text-[0.75rem] font-semibold leading-tight">
            {firstName}
          </span>
          <span className="text-muted-foreground max-w-[7rem] truncate text-[0.65rem] font-normal leading-tight">
            {user.email}
          </span>
        </span>
        <ChevronDownIcon
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </Button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-labelledby="navbar-user-menu-button"
          className="animate-in fade-in-0 zoom-in-95 absolute right-0 z-[60] mt-2 min-w-[13.5rem] origin-top-right rounded-xl border border-border/90 bg-popover p-1.5 text-popover-foreground shadow-lg outline-none duration-100 dark:bg-popover"
        >
          <div className="border-border/80 mb-1.5 rounded-lg border bg-muted/40 px-3 py-2">
            <p className="truncate text-sm font-semibold text-foreground">
              {displayName}
            </p>
            <p className="text-muted-foreground truncate text-xs">{user.email}</p>
          </div>
          <Link
            href="/profile"
            role="menuitem"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
            onClick={() => setOpen(false)}
          >
            <UserRoundIcon
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            Profile
          </Link>
          <div
            role="separator"
            className="bg-border my-1 h-px"
            aria-hidden
          />
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:bg-destructive/10 focus-visible:outline-none"
            onClick={handleLogout}
          >
            <LogOutIcon className="size-4 shrink-0 opacity-90" aria-hidden />
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
    clearLegacyAuthStorage()
  }, [])

  useEffect(() => {
    async function syncAuth() {
      const next = await fetchSession()
      setUser(next ?? null)
    }
    void syncAuth()
    window.addEventListener(AUTH_CHANGED_EVENT, syncAuth)
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncAuth)
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
                <div className="hidden h-8 w-[10.5rem] animate-pulse rounded-lg bg-muted sm:block" />
                <div className="h-8 w-24 animate-pulse rounded-lg bg-muted sm:hidden" />
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
                variant="outline"
                size="sm"
                className={cn(
                  "gap-1.5 shadow-sm",
                  (pathname === "/orders" || pathname.startsWith("/orders/")) &&
                    "border-primary/45 bg-primary/[0.06] text-foreground dark:bg-primary/10"
                )}
                nativeButton={false}
                render={<Link href="/orders" />}
                aria-label="My orders"
              >
                <ClipboardListIcon className="size-4 shrink-0" aria-hidden />
                <span className="hidden sm:inline">My orders</span>
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
