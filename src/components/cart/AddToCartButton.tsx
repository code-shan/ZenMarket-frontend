"use client"

import type { ComponentProps } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { getAuthToken } from "@/lib/auth"
import { notifyCartToast } from "@/lib/cart-toast"
import { cn } from "@/lib/utils"
import { addCartItem, cartClientErrorMessage } from "@/services/cartService"

type ButtonProps = ComponentProps<typeof Button>

export function AddToCartButton({
  productId,
  disabled = false,
  disabledLabel = "Unavailable",
  variant = "outline",
  size = "sm",
  wrapperClassName,
  buttonClassName,
  loginRedirectPath = "/login?redirect=/products",
}: {
  productId: number
  disabled?: boolean
  disabledLabel?: string
  variant?: ButtonProps["variant"]
  size?: ButtonProps["size"]
  wrapperClassName?: string
  buttonClassName?: string
  loginRedirectPath?: string
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function handleClick() {
    if (!getAuthToken()) {
      router.push(loginRedirectPath)
      return
    }
    if (disabled || pending) return

    setPending(true)
    try {
      await addCartItem({ product_id: productId, quantity: 1 })
      notifyCartToast({
        variant: "success",
        title: "Added to cart",
        description:
          "Item saved to your cart. Use the cart button in the header when you're ready.",
      })
    } catch (err) {
      notifyCartToast({
        variant: "error",
        title: "Couldn't add to cart",
        description: cartClientErrorMessage(err),
      })
    } finally {
      setPending(false)
    }
  }

  const busy = pending
  const showUnavailable = disabled && !busy

  return (
    <div className={cn("flex w-full min-w-0 flex-col", wrapperClassName)}>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn("min-w-0 shrink-0", buttonClassName)}
        disabled={disabled}
        aria-busy={busy}
        aria-label={
          showUnavailable
            ? "Unavailable"
            : busy
              ? "Adding to cart"
              : "Add to cart"
        }
        onClick={() => void handleClick()}
      >
        {showUnavailable ? disabledLabel : busy ? "Adding..." : "Add to Cart"}
      </Button>
    </div>
  )
}
