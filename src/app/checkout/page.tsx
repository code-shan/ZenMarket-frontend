"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { z } from "zod"

import { PageContainer } from "@/components/layout/PageContainer"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { fetchSession } from "@/lib/auth"
import { isLoopbackHttpUrl, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/media"
import { clearCart, getCart } from "@/services/cartService"
import { createOrder, orderClientErrorMessage } from "@/services/orderService"
import type { CartData, CartItem } from "@/types/cart"

const CHECKOUT_IMAGE_FALLBACK = PRODUCT_IMAGE_PLACEHOLDER

const emptyCart: CartData = {
  items_count: 0,
  subtotal: "0.00",
  total: "0.00",
  items: [],
}

const checkoutSchema = z.object({
  customer_name: z.string().min(1, "Full name is required."),
  customer_email: z
    .string()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  customer_contact: z.string().min(1, "Contact number is required."),
  shipping_address: z.string().min(1, "Shipping address is required."),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

function formatRs(value: string | number): string {
  const n = typeof value === "string" ? Number.parseFloat(value) : value
  const safe = Number.isFinite(n) ? n : 0
  return `Rs. ${safe.toFixed(2)}`
}

function lineImageSrc(item: CartItem): string {
  const u = item.image_url?.trim() ?? ""
  return u !== "" ? u : CHECKOUT_IMAGE_FALLBACK
}

export default function CheckoutPage() {
  const router = useRouter()
  const [guard, setGuard] = useState<"pending" | "ok" | "unauthed">("pending")
  const [cart, setCart] = useState<CartData | null>(null)
  const [cartLoading, setCartLoading] = useState(true)
  const [cartError, setCartError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const prefillDone = useRef(false)

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer_name: "",
      customer_email: "",
      customer_contact: "",
      shipping_address: "",
    },
  })

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const user = await fetchSession()
      if (cancelled) return
      if (!user) {
        router.replace("/login?redirect=/checkout")
        setGuard("unauthed")
        return
      }
      setGuard("ok")
    })()
    return () => {
      cancelled = true
    }
  }, [router])

  useEffect(() => {
    if (guard !== "ok") return
    if (prefillDone.current) return
    prefillDone.current = true
    void (async () => {
      const u = await fetchSession()
      if (u) {
        form.reset({
          customer_name: u.name,
          customer_email: u.email,
          customer_contact: (u.phone ?? "").trim(),
          shipping_address: (u.address ?? "").trim(),
        })
      }
    })()
  }, [guard, form])

  useEffect(() => {
    if (guard !== "ok") return
    let cancelled = false
    setCartLoading(true)
    setCartError(null)
    void (async () => {
      try {
        const data = await getCart()
        if (!cancelled) setCart(data)
      } catch (err) {
        if (!cancelled) {
          setCartError(
            err instanceof Error && err.message
              ? err.message
              : "Could not load your cart."
          )
          setCart(emptyCart)
        }
      } finally {
        if (!cancelled) setCartLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [guard])

  const items = cart?.items ?? []
  const isEmpty = !cartLoading && (items.length === 0 || cart?.items_count === 0)
  const hasCartData = Boolean(cart) && !cartLoading && !cartError

  async function onSubmit(values: CheckoutFormValues) {
    if (isEmpty) return
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const order = await createOrder({
        ...values,
        payment_type: "cod",
      })
      try {
        await clearCart()
      } catch {
        // Order already created; cart clear is best-effort
      }
      const q = new URLSearchParams({
        order: order.order_number,
        total: order.total,
      })
      router.push(`/order-success?${q.toString()}`)
    } catch (err) {
      setSubmitError(orderClientErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (guard === "pending" || guard === "unauthed") {
    return (
      <PageContainer className="space-y-6 py-8">
        <div className="space-y-3">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <Skeleton className="h-[480px] w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="space-y-8 py-8">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Checkout
        </h1>
        <p className="text-sm text-muted-foreground">
          Cash on delivery (COD). Enter your details to place the order.
        </p>
        <Button
          size="sm"
          variant="ghost"
          className="mt-2 h-auto px-0 text-muted-foreground"
          nativeButton={false}
          render={<Link href="/cart" />}
        >
          ← Back to cart
        </Button>
      </div>

      {cartError ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn’t load cart</AlertTitle>
          <AlertDescription>{cartError}</AlertDescription>
        </Alert>
      ) : null}

      {hasCartData && isEmpty ? (
        <Card>
          <CardHeader>
            <CardTitle>Your cart is empty</CardTitle>
            <CardDescription>
              Add products before you can check out.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button nativeButton={false} render={<Link href="/products" />}>
              Go to products
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!cartLoading && !cartError && !isEmpty ? (
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <Card>
            <CardHeader>
              <CardTitle>Delivery details</CardTitle>
              <CardDescription>
                We’ll use this for delivery and order updates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                  noValidate
                >
                  {submitError ? (
                    <Alert variant="destructive">
                      <AlertTitle>Order not placed</AlertTitle>
                      <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                  ) : null}

                  <FormField
                    control={form.control}
                    name="customer_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="name"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customer_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            autoComplete="email"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customer_contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact number</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            autoComplete="tel"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shipping_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping address</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={4}
                            autoComplete="street-address"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Payment
                    </label>
                    <div className="rounded-lg border bg-muted/40 px-3 py-2.5 text-sm">
                      <span className="font-medium">Cash on delivery (COD)</span>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        Pay when your order arrives.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full sm:w-auto"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Placing order..." : "Place order"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle>Order summary</CardTitle>
                <CardDescription>
                  {cart!.items_count}{" "}
                  {cart!.items_count === 1 ? "item" : "items"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="max-h-[min(50vh,320px)] space-y-3 overflow-y-auto pr-1">
                  {cart!.items.map((item) => {
                    const src = lineImageSrc(item)
                    const unopt = isLoopbackHttpUrl(src)
                    return (
                      <li
                        key={item.product_id}
                        className="flex gap-3 text-sm"
                      >
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                          <Image
                            src={src}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="56px"
                            unoptimized={unopt}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 font-medium leading-snug">
                            {item.name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {formatRs(item.final_price)} × {item.quantity}
                          </p>
                        </div>
                        <p className="shrink-0 tabular-nums font-medium">
                          {formatRs(item.line_total)}
                        </p>
                      </li>
                    )
                  })}
                </ul>
                <Separator />
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="tabular-nums">{formatRs(cart!.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="font-medium">Total</dt>
                    <dd className="tabular-nums text-base font-semibold">
                      {formatRs(cart!.total)}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </aside>
        </div>
      ) : null}

      {cartLoading && guard === "ok" ? (
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <Skeleton className="h-[480px] w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      ) : null}
    </PageContainer>
  )
}
