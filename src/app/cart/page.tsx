"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { PageContainer } from "@/components/layout/PageContainer"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AUTH_CHANGED_EVENT,
  getAuthToken,
} from "@/lib/auth"
import { isLoopbackHttpUrl, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/media"
import {
  clearCart,
  getCart,
  removeCartItem,
} from "@/services/cartService"
import type { CartData, CartItem } from "@/types/cart"

const EMPTY_CART: CartData = {
  items_count: 0,
  subtotal: "0.00",
  total: "0.00",
  items: [],
}

/** Rs. formatter — invalid numbers fall back to Rs. 0.00 */
function formatPrice(value: string | number): string {
  const n = typeof value === "string" ? Number.parseFloat(value) : value
  const safe = Number.isFinite(n) ? n : 0
  return `Rs. ${safe.toFixed(2)}`
}

function parseMoney(value: string): number {
  const n = Number.parseFloat(value)
  return Number.isFinite(n) ? n : NaN
}

function isItemUnavailable(item: CartItem): boolean {
  return (
    item.product_status !== "AVAILABLE" ||
    item.product_is_active === false ||
    item.category_is_active === false
  )
}

function discountBadgeLabel(item: CartItem): string | null {
  const raw =
    typeof item.discount_value === "string" ? item.discount_value.trim() : ""
  if (!raw) return null
  if (item.discount_type === "percentage") return `${raw}% OFF`
  if (item.discount_type === "fixed") {
    const n = Number.parseFloat(raw)
    const shown = Number.isFinite(n) ? n.toFixed(2) : raw
    return `Rs. ${shown} OFF`
  }
  return null
}

function cartImageSrc(item: CartItem): string {
  const resolved = item.image_url?.trim() ?? ""
  return resolved !== "" ? resolved : PRODUCT_IMAGE_PLACEHOLDER
}

function isAuthFailureMessage(message: string): boolean {
  const m = message.toLowerCase()
  return (
    message === "Authentication required" ||
    m.includes("unauthenticated") ||
    m.includes("unauthorized") ||
    m.includes("401") ||
    (m.includes("token") && m.includes("invalid"))
  )
}

type Gate = "pending" | "guest" | "member"

type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: CartData }
  | { status: "error"; message: string }

function CartLineSkeleton() {
  return (
    <div className="flex gap-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm">
      <Skeleton className="size-24 shrink-0 rounded-lg sm:size-28" />
      <div className="min-w-0 flex-1 space-y-3">
        <Skeleton className="h-4 w-[min(100%,14rem)]" />
        <Skeleton className="h-4 w-24" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
    </div>
  )
}

function SummarySkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/30 pb-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-2 h-4 w-full max-w-[18rem]" />
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="flex justify-between gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Separator />
        <div className="flex justify-between gap-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

export default function CartPage() {
  const router = useRouter()
  const [gate, setGate] = useState<Gate>("pending")
  const [fetchState, setFetchState] = useState<FetchState>({ status: "idle" })
  const [removingProductId, setRemovingProductId] = useState<number | null>(
    null
  )
  const [clearing, setClearing] = useState(false)
  const [removeError, setRemoveError] = useState<string | null>(null)
  const [clearError, setClearError] = useState<string | null>(null)
  const [clearSuccess, setClearSuccess] = useState(false)

  const syncGateFromStorage = useCallback(() => {
    if (!getAuthToken()) {
      setGate("guest")
      router.replace("/login?redirect=/cart")
      return false
    }
    setGate("member")
    return true
  }, [router])

  const loadCart = useCallback(async () => {
    if (!getAuthToken()) {
      router.replace("/login?redirect=/cart")
      return
    }
    setFetchState({ status: "loading" })
    try {
      const data = await getCart()
      setFetchState({ status: "success", data })
      setClearSuccess(false)
      setClearError(null)
      setRemoveError(null)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong."
      if (message === "Authentication required" || isAuthFailureMessage(message)) {
        router.replace("/login?redirect=/cart")
        return
      }
      setFetchState({ status: "error", message })
    }
  }, [router])

  const handleRemoveItem = useCallback(
    async (productId: number) => {
      setRemoveError(null)
      setClearSuccess(false)
      setClearError(null)
      setRemovingProductId(productId)
      try {
        const next = await removeCartItem(productId)
        setFetchState({ status: "success", data: next })
      } catch (err) {
        const message =
          err instanceof Error ? err.message : ""
        if (
          message === "Authentication required" ||
          isAuthFailureMessage(message)
        ) {
          router.replace("/login?redirect=/cart")
          return
        }
        setRemoveError("Failed to remove item.")
      } finally {
        setRemovingProductId(null)
      }
    },
    [router]
  )

  const handleClearCart = useCallback(async () => {
    if (fetchState.status !== "success") return
    if (fetchState.data.items.length === 0) return
    if (
      typeof window !== "undefined" &&
      !window.confirm("Are you sure you want to clear your cart?")
    ) {
      return
    }
    setClearError(null)
    setRemoveError(null)
    setClearSuccess(false)
    setClearing(true)
    try {
      await clearCart()
      setFetchState({ status: "success", data: { ...EMPTY_CART } })
      setClearSuccess(true)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : ""
      if (
        message === "Authentication required" ||
        isAuthFailureMessage(message)
      ) {
        router.replace("/login?redirect=/cart")
        return
      }
      setClearError("Failed to clear cart.")
    } finally {
      setClearing(false)
    }
  }, [fetchState, router])

  useEffect(() => {
    function onAuthChange() {
      const ok = syncGateFromStorage()
      if (ok) void loadCart()
      else setFetchState({ status: "idle" })
    }
    const ok = syncGateFromStorage()
    if (!ok) setFetchState({ status: "idle" })
    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChange)
    window.addEventListener("storage", onAuthChange)
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChange)
      window.removeEventListener("storage", onAuthChange)
    }
  }, [syncGateFromStorage, loadCart])

  useEffect(() => {
    if (gate === "member") void loadCart()
  }, [gate, loadCart])

  const cartData = fetchState.status === "success" ? fetchState.data : null

  const hasUnavailable = useMemo(() => {
    if (!cartData) return false
    return cartData.items.some(isItemUnavailable)
  }, [cartData])
  const isEmpty =
    cartData !== null && cartData.items.length === 0

  const canCheckout =
    cartData !== null &&
    cartData.items.length > 0 &&
    !hasUnavailable

  const awaitingCart =
    gate === "member" &&
    (fetchState.status === "idle" || fetchState.status === "loading")

  if (gate === "pending") {
    return (
      <PageContainer className="py-10 md:py-14">
        <div className="space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-9 w-56 max-w-full" />
            <Skeleton className="h-4 w-[min(100%,28rem)]" />
          </div>
          <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start xl:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <CartLineSkeleton />
              <CartLineSkeleton />
              <CartLineSkeleton />
            </div>
            <SummarySkeleton />
          </div>
        </div>
      </PageContainer>
    )
  }

  if (gate === "guest") {
    return (
      <PageContainer className="py-12">
        <p className="text-muted-foreground">
          Please log in to view your cart. Redirecting…
        </p>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="py-10 md:py-14">
      <div className="mb-8 space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          Shopping Cart
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Review your selected items before checkout.
        </p>
      </div>

      {removeError ? (
        <Alert variant="destructive" className="mb-6 max-w-2xl">
          <AlertTitle>Remove failed</AlertTitle>
          <AlertDescription>{removeError}</AlertDescription>
        </Alert>
      ) : null}

      {clearError ? (
        <Alert variant="destructive" className="mb-6 max-w-2xl">
          <AlertTitle>Clear cart failed</AlertTitle>
          <AlertDescription>{clearError}</AlertDescription>
        </Alert>
      ) : null}

      {clearSuccess ? (
        <Alert className="mb-6 max-w-2xl border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-50">
          <AlertTitle>Cart cleared</AlertTitle>
          <AlertDescription>Cart cleared successfully.</AlertDescription>
        </Alert>
      ) : null}

      {awaitingCart ? (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start xl:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <CartLineSkeleton />
            <CartLineSkeleton />
            <CartLineSkeleton />
          </div>
          <SummarySkeleton />
        </div>
      ) : null}

      {fetchState.status === "error" ? (
        <Card className="max-w-lg border-destructive/40 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Failed to load cart</CardTitle>
            <CardDescription>Please try again.</CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-wrap gap-2 border-t bg-muted/40">
            <Button type="button" onClick={() => void loadCart()}>
              Retry
            </Button>
          </CardFooter>
        </Card>
      ) : null}

      {fetchState.status === "success" && isEmpty ? (
        <Card className="mx-auto max-w-lg text-center">
          <CardHeader className="space-y-2 pb-2">
            <CardTitle className="font-heading text-xl">Your cart is empty</CardTitle>
            <CardDescription className="text-base">
              Looks like you haven&apos;t added anything yet.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center pb-6 pt-2">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/products" />}
            >
              Browse Products
            </Button>
          </CardFooter>
        </Card>
      ) : null}

      {fetchState.status === "success" && cartData && !isEmpty ? (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start xl:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {cartData.items.map((item) => {
              const avail = !isItemUnavailable(item)
              const imgSrc = cartImageSrc(item)
              const unoptimized = isLoopbackHttpUrl(imgSrc)
              const discountLabel = discountBadgeLabel(item)
              const priceN = parseMoney(item.price)
              const finalN = parseMoney(item.final_price)
              const showStrike =
                Number.isFinite(priceN) &&
                Number.isFinite(finalN) &&
                finalN < priceN

              const removingThis = removingProductId === item.product_id

              return (
                <article
                  key={`${item.product_id}-${item.name}`}
                  className="flex flex-col gap-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm sm:flex-row sm:gap-5"
                >
                  <div className="relative mx-auto size-28 shrink-0 overflow-hidden rounded-lg bg-muted sm:mx-0 sm:size-32">
                    <Image
                      src={imgSrc}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="128px"
                      unoptimized={unoptimized}
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h2 className="font-heading text-base font-semibold leading-snug md:text-lg">
                        {item.name}
                      </h2>
                      <Badge variant={avail ? "secondary" : "destructive"}>
                        {avail ? "Available" : "Unavailable"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {discountLabel ? (
                        <Badge className="shadow-sm">{discountLabel}</Badge>
                      ) : null}
                      <span className="text-xs text-muted-foreground">
                        Status: {item.product_status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-xl font-semibold tabular-nums text-foreground">
                        {formatPrice(item.final_price)}
                      </span>
                      {showStrike ? (
                        <span className="text-sm tabular-nums text-muted-foreground line-through">
                          {formatPrice(item.price)}
                        </span>
                      ) : (
                        <span className="text-sm tabular-nums text-muted-foreground">
                          List {formatPrice(item.price)}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-3">
                      <p className="text-sm text-muted-foreground">
                        Qty{" "}
                        <span className="font-medium tabular-nums text-foreground">
                          {item.quantity}
                        </span>
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Line total
                          </p>
                          <p className="text-lg font-semibold tabular-nums text-foreground">
                            {formatPrice(item.line_total)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={
                            clearing || removingProductId !== null
                          }
                          aria-busy={removingThis}
                          onClick={() => void handleRemoveItem(item.product_id)}
                        >
                          {removingThis ? "Removing..." : "Remove"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          <aside className="lg:sticky lg:top-24">
            <Card className="overflow-hidden shadow-md ring-1 ring-border/60">
              <CardHeader className="border-b bg-muted/40 pb-4">
                <CardTitle className="font-heading text-lg">Order summary</CardTitle>
                <CardDescription>
                  {cartData.items_count} item
                  {cartData.items_count === 1 ? "" : "s"} in your cart
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">Items</span>
                  <span className="tabular-nums font-medium">{cartData.items_count}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums font-medium">
                    {formatPrice(cartData.subtotal)}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                  <span className="text-base font-semibold">Total</span>
                  <span className="text-xl font-semibold tabular-nums text-foreground">
                    {formatPrice(cartData.total)}
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={
                    clearing ||
                    removingProductId !== null
                  }
                  aria-busy={clearing}
                  onClick={() => void handleClearCart()}
                >
                  {clearing ? "Clearing..." : "Clear Cart"}
                </Button>

                {hasUnavailable ? (
                  <Alert variant="destructive" className="mt-2">
                    <AlertTitle>Checkout blocked</AlertTitle>
                    <AlertDescription>
                      Remove unavailable items before checkout.
                    </AlertDescription>
                  </Alert>
                ) : null}

                {canCheckout ? (
                  <Button
                    className="mt-2 h-11 w-full text-base shadow-sm"
                    size="lg"
                    nativeButton={false}
                    render={<Link href="/checkout" />}
                  >
                    Proceed to Checkout
                  </Button>
                ) : (
                  <Button className="mt-2 h-11 w-full text-base" size="lg" disabled>
                    Proceed to Checkout
                  </Button>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      ) : null}
    </PageContainer>
  )
}
