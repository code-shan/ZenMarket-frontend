import { api, getApiBaseUrl } from "@/lib/api"
import { getAuthToken } from "@/lib/auth"
import type {
  AddCartItemRequest,
  CartApiResponse,
  CartData,
  CartItem,
} from "@/types/cart"

function resolveCartImageUrl(url: string | null | undefined): string | null {
  const s = typeof url === "string" ? url.trim() : ""
  if (!s) return null
  if (/^https?:\/\//i.test(s)) return s
  try {
    const origin = new URL(getApiBaseUrl()).origin
    return s.startsWith("/") ? `${origin}${s}` : `${origin}/${s}`
  } catch {
    return null
  }
}

function normalizeItem(item: CartItem): CartItem {
  return {
    ...item,
    image_url: resolveCartImageUrl(item.image_url),
  }
}

export function normalizeCartData(data: CartData): CartData {
  return {
    ...data,
    items: Array.isArray(data.items) ? data.items.map(normalizeItem) : [],
  }
}

function requireToken(): string {
  const token = getAuthToken()
  if (!token) {
    throw new Error("Authentication required")
  }
  return token
}

function isCartApiResponse(value: unknown): value is CartApiResponse {
  if (!value || typeof value !== "object") return false
  const o = value as Record<string, unknown>
  return typeof o.success === "boolean" && typeof o.message === "string"
}

function firstCartValidationLine(errors: unknown): string {
  if (!errors || typeof errors !== "object") return ""
  for (const val of Object.values(errors as Record<string, unknown>)) {
    if (!Array.isArray(val)) continue
    for (const item of val) {
      if (typeof item === "string" && item.trim() !== "") return item.trim()
    }
  }
  return ""
}

/** Prefer API `message`, then first entry under `errors`. */
function cartMutationFailureMessage(raw: Record<string, unknown>): string {
  const msg =
    typeof raw.message === "string" ? raw.message.trim() : ""
  const field = firstCartValidationLine(raw.errors)
  return msg || field || "Cart request failed."
}

/** Readable message from thrown cart/network errors for UI (toast). */
export function cartClientErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (err instanceof Error) {
    const m = err.message.trim()
    if (m) return m
  }
  return fallback
}

function parseCartMutationEnvelope(raw: unknown): CartData {
  if (!isCartApiResponse(raw)) {
    throw new Error("Unexpected response from server.")
  }
  if (!raw.success) {
    throw new Error(cartMutationFailureMessage(raw as unknown as Record<string, unknown>))
  }
  if (!raw.data || typeof raw.data !== "object") {
    throw new Error("Cart data is missing.")
  }
  return normalizeCartData(raw.data as CartData)
}

function isClearCartEnvelope(value: unknown): value is {
  success: boolean
  message: string
  data?: null
} {
  if (!value || typeof value !== "object") return false
  const o = value as Record<string, unknown>
  return typeof o.success === "boolean" && typeof o.message === "string"
}

/**
 * GET /cart — authenticated cart payload.
 */
export async function getCart(): Promise<CartData> {
  const token = requireToken()

  const raw = await api.get<unknown>("cart", { token })
  if (!isCartApiResponse(raw)) {
    throw new Error("Unexpected response from server.")
  }

  if (!raw.success) {
    throw new Error(cartMutationFailureMessage(raw as unknown as Record<string, unknown>))
  }

  if (!raw.data || typeof raw.data !== "object") {
    throw new Error("Cart data is missing.")
  }

  return normalizeCartData(raw.data as CartData)
}

/**
 * POST /cart/items — add line (default quantity from caller).
 */
export async function addCartItem(
  payload: AddCartItemRequest
): Promise<CartData> {
  const token = requireToken()
  const raw = await api.post<unknown>("cart/items", payload, { token })
  return parseCartMutationEnvelope(raw)
}

/**
 * DELETE /cart/items/{productId}
 */
export async function removeCartItem(productId: number): Promise<CartData> {
  const token = requireToken()
  const raw = await api.delete<unknown>(`cart/items/${productId}`, {
    token,
  })
  return parseCartMutationEnvelope(raw)
}

/**
 * DELETE /cart — empty cart on server.
 */
export async function clearCart(): Promise<void> {
  const token = requireToken()
  const raw = await api.delete<unknown>("cart", { token })

  if (!raw || typeof raw !== "object") {
    throw new Error("Unexpected response from server.")
  }

  if (!isClearCartEnvelope(raw)) {
    throw new Error("Unexpected response from server.")
  }

  if (!raw.success) {
    throw new Error(cartMutationFailureMessage(raw as unknown as Record<string, unknown>))
  }
}
