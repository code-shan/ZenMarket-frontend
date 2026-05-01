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

export function BuyNowButton({
  productId,
  disabled = false,
  disabledLabel = "Unavailable",
  variant = "default",
  size = "sm",
  wrapperClassName,
  buttonClassName,
  loginRedirectPath = "/login?redirect=/cart",
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
      router.push("/cart")
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
              ? "Buying now"
              : "Buy now"
        }
        onClick={() => void handleClick()}
      >
        {showUnavailable ? disabledLabel : busy ? "Buying..." : "Buy Now"}
      </Button>
    </div>
  )
}
