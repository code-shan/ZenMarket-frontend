import type { User } from "@/types/auth"

export const ZENMARKET_TOKEN_KEY = "zenmarket_token"
export const ZENMARKET_USER_KEY = "zenmarket_user"

export const AUTH_CHANGED_EVENT = "zenmarket-auth-change"

export function notifyAuthChanged(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    const t = localStorage.getItem(ZENMARKET_TOKEN_KEY)
    return t && t.trim() !== "" ? t : null
  } catch {
    return null
  }
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(ZENMARKET_USER_KEY)
    if (!raw?.trim()) return null
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== "object") return null
    const u = parsed as Record<string, unknown>
    if (typeof u.id !== "number" || typeof u.name !== "string" || typeof u.email !== "string") {
      return null
    }
    return parsed as User
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken() && getStoredUser())
}

export function logoutUser(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(ZENMARKET_TOKEN_KEY)
    localStorage.removeItem(ZENMARKET_USER_KEY)
  } catch {
    // ignore
  }
  notifyAuthChanged()
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
