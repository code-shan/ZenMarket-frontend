"use client"

import { useEffect, useRef, useState } from "react"
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  CART_TOAST_EVENT,
  type CartToastPayload,
} from "@/lib/cart-toast"
import { cn } from "@/lib/utils"

const AUTO_HIDE_MS = 5200

export function CartToastHost() {
  const [toast, setToast] = useState<(CartToastPayload & { key: number }) | null>(
    null
  )
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function handler(ev: Event) {
      const e = ev as CustomEvent<CartToastPayload>
      const detail = e.detail
      if (!detail?.title) return

      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }

      setToast({ ...detail, key: Date.now() })

      hideTimerRef.current = setTimeout(() => {
        setToast(null)
        hideTimerRef.current = null
      }, AUTO_HIDE_MS)
    }

    window.addEventListener(CART_TOAST_EVENT, handler)
    return () => {
      window.removeEventListener(CART_TOAST_EVENT, handler)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [])

  function dismiss() {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
    setToast(null)
  }

  if (!toast) return null

  const success = toast.variant === "success"

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-center px-4 pb-6 sm:justify-end sm:pb-8 sm:pr-6"
      aria-live="polite"
    >
      <div
        role={success ? "status" : "alert"}
        key={toast.key}
        className={cn(
          "pointer-events-auto flex w-full max-w-md gap-3 rounded-xl border bg-popover p-4 text-popover-foreground shadow-lg ring-1 ring-foreground/10 animate-in fade-in-0 slide-in-from-bottom-4 duration-300 dark:bg-popover dark:ring-border/80",
          success
            ? "border-emerald-500/35 dark:border-emerald-500/25"
            : "border-destructive/35"
        )}
      >
        {success ? (
          <CheckCircle2Icon
            className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400"
            aria-hidden
          />
        ) : (
          <AlertCircleIcon
            className="mt-0.5 size-5 shrink-0 text-destructive"
            aria-hidden
          />
        )}
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-semibold leading-snug">{toast.title}</p>
          {toast.description ? (
            <p className="text-sm leading-snug text-muted-foreground">
              {toast.description}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="-m-1 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Dismiss notification"
          onClick={dismiss}
        >
          <XIcon className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  )
}
