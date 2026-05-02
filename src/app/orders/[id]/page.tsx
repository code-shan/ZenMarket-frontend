"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { PageContainer } from "@/components/layout/PageContainer"
import { OrderItemsList } from "@/components/orders/OrderItemsList"
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge"
import { OrderStatusTracker } from "@/components/orders/OrderStatusTracker"
import { OrderSummaryCard } from "@/components/orders/OrderSummaryCard"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { getAuthToken } from "@/lib/auth"
import { getOrderById } from "@/services/orderService"
import type { Order } from "@/types/order"

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const idParam = params?.id
  const id =
    typeof idParam === "string"
      ? idParam
      : Array.isArray(idParam)
        ? idParam[0]
        : ""

  const [allowed, setAllowed] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!getAuthToken()) {
      const path = id ? `/orders/${encodeURIComponent(id)}` : "/orders"
      router.replace(`/login?redirect=${encodeURIComponent(path)}`)
      return
    }
    setAllowed(true)
  }, [id, router])

  const redirectLogin = useCallback(() => {
    const path = id ? `/orders/${encodeURIComponent(id)}` : "/orders"
    router.replace(`/login?redirect=${encodeURIComponent(path)}`)
  }, [id, router])

  const load = useCallback(async () => {
    if (!id) {
      setError("Order not found.")
      setLoading(false)
      return
    }
    if (!getAuthToken()) {
      redirectLogin()
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getOrderById(id)
      setOrder(data)
    } catch (err) {
      if (err instanceof Error && err.message === "Authentication required") {
        redirectLogin()
        return
      }
      const msg =
        err instanceof Error && err.message.trim() !== ""
          ? err.message.trim()
          : "Failed to load order details."
      const lower = msg.toLowerCase()
      if (
        lower.includes("not found") ||
        lower.includes("404") ||
        lower.includes("could not find")
      ) {
        setError("Order not found.")
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }, [id, redirectLogin])

  useEffect(() => {
    if (!allowed) return
    void load()
  }, [allowed, load])

  if (!allowed) {
    return (
      <PageContainer className="space-y-8 py-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="space-y-8 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-0 text-muted-foreground"
            nativeButton={false}
            render={<Link href="/orders" />}
          >
            ← Back to my orders
          </Button>
          {order ? (
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-heading font-mono text-xl font-semibold tracking-tight sm:text-2xl">
                {order.order_number}
              </h1>
              <OrderStatusBadge status={order.status} />
            </div>
          ) : loading ? (
            <Skeleton className="h-9 w-56" />
          ) : (
            <h1 className="font-heading text-xl font-semibold sm:text-2xl">
              Order details
            </h1>
          )}
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load order</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => void load()}>
                Retry
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                nativeButton={false}
                render={<Link href="/orders" />}
              >
                All orders
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : null}

      {loading ? (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-xl lg:sticky lg:top-24 lg:self-start" />
        </div>
      ) : null}

      {!loading && !error && order ? (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <OrderStatusTracker status={order.status} />

            <section aria-labelledby="order-items-heading">
              <h2
                id="order-items-heading"
                className="mb-4 text-lg font-semibold tracking-tight"
              >
                Items
              </h2>
              <OrderItemsList items={order.items} />
            </section>

            <Card>
              <CardHeader>
                <CardTitle>Shipping &amp; contact</CardTitle>
                <CardDescription>
                  Details used for this order.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    Name
                  </p>
                  <p>{order.customer_name}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    Email
                  </p>
                  <p>
                    <a
                      href={`mailto:${order.customer_email}`}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {order.customer_email}
                    </a>
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    Contact
                  </p>
                  <p className="tabular-nums">{order.customer_contact}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    Shipping address
                  </p>
                  <p className="whitespace-pre-wrap">{order.shipping_address}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <OrderSummaryCard order={order} />
          </aside>
        </div>
      ) : null}
    </PageContainer>
  )
}
