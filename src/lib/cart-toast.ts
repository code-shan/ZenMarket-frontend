export const CART_TOAST_EVENT = "zenmarket-cart-toast"

export type CartToastPayload = {
  variant: "success" | "error"
  title: string
  description?: string
}

export function notifyCartToast(payload: CartToastPayload): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(
    new CustomEvent(CART_TOAST_EVENT, { detail: payload })
  )
}
