import type { User } from "@/types/auth"

import { AUTH_SESSION_HINT_KEY } from "@/lib/auth-cookie"

/** @deprecated Legacy keys — cleared on load */
export const ZENMARKET_TOKEN_KEY = "zenmarket_token"
/** @deprecated Legacy keys — cleared on load */
export const ZENMARKET_USER_KEY = "zenmarket_user"

export const AUTH_CHANGED_EVENT = "zenmarket-auth-change"

export function notifyAuthChanged(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
}

export function setSessionHint(active: boolean): void {
  if (typeof window === "undefined") return
  try {
    if (active) sessionStorage.setItem(AUTH_SESSION_HINT_KEY, "1")
    else sessionStorage.removeItem(AUTH_SESSION_HINT_KEY)
  } catch {
    // ignore
  }
}

export function hasSessionHint(): boolean {
  if (typeof window === "undefined") return false
  try {
    return sessionStorage.getItem(AUTH_SESSION_HINT_KEY) === "1"
  } catch {
    return false
  }
}

/** Removes tokens saved before cookie-based auth (localStorage). */
export function clearLegacyAuthStorage(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(ZENMARKET_TOKEN_KEY)
    localStorage.removeItem(ZENMARKET_USER_KEY)
  } catch {
    // ignore
  }
}

/**
 * Loads the current user via GET /api/auth/session (HttpOnly cookie → backend profile).
 */
export async function fetchSession(): Promise<User | null> {
  try {
    const res = await fetch("/api/auth/session", {
      credentials: "include",
      cache: "no-store",
    })
    if (!res.ok) {
      setSessionHint(false)
      return null
    }
    const data = (await res.json()) as { user?: User | null }
    const user = data.user ?? null
    setSessionHint(Boolean(user))
    return user
  } catch {
    setSessionHint(false)
    return null
  }
}

/**
 * Fast synchronous hint only — real auth is always validated by the API via cookies.
 */
export function isAuthenticated(): boolean {
  return hasSessionHint()
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    })
  } catch {
    // ignore network errors
  }
  setSessionHint(false)
  clearLegacyAuthStorage()
  notifyAuthChanged()
}

/**
 * The access token is HttpOnly — never readable from JavaScript.
 * @deprecated Always returns null on the client.
 */
export function getAuthToken(): string | null {
  return null
}

/**
 * @deprecated Use `fetchSession()` — user JSON is not stored in localStorage anymore.
 */
export function getStoredUser(): User | null {
  return null
}

/** Display initials for avatar chips (e.g. "John Doe" → "JD"). */
export function getInitialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) {
    const w = parts[0]
    return w.length >= 2 ? w.slice(0, 2).toUpperCase() : w.slice(0, 1).toUpperCase()
  }
  const first = parts[0][0]
  const last = parts[parts.length - 1][0]
  return `${first}${last}`.toUpperCase()
}

/**
 * Safe internal redirect path after login (same-origin path only).
 */
export function sanitizePostLoginRedirect(raw: string | null): string {
  if (!raw || raw.trim() === "") return "/products"
  const path = raw.trim()
  if (!path.startsWith("/") || path.startsWith("//")) return "/products"
  return path
}
