"use client"

import Link from "next/link"
import { Suspense, useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { PageContainer } from "@/components/layout/PageContainer"
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge"
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
import { getAuthToken } from "@/lib/auth"
import { getOrders } from "@/services/orderService"
import type { Order, OrderPaginationMeta } from "@/types/order"

function formatRs(value: string): string {
  const n = Number.parseFloat(value)
  const safe = Number.isFinite(n) ? n : 0
  return `Rs. ${safe.toFixed(2)}`
}

function paymentStatusLabel(status: string): string {
  const s = status.trim().toLowerCase()
  if (s === "paid") return "Paid"
  if (s === "pending") return "Pending"
  if (s === "failed") return "Failed"
  if (s === "cancelled") return "Cancelled"
  return status
}

function transactionStatusBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  const s = status.trim().toLowerCase()
  if (s === "paid") return "default"
  if (s === "pending") return "secondary"
  if (s === "failed" || s === "cancelled") return "destructive"
  return "outline"
}

function OrdersPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pageParam = searchParams.get("page")
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1)

  const [allowed, setAllowed] = useState(false)
  const [items, setItems] = useState<Order[]>([])
  const [pagination, setPagination] = useState<OrderPaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!getAuthToken()) {
      router.replace("/login?redirect=/orders")
      return
    }
    setAllowed(true)
  }, [router])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getOrders({ page, per_page: 10 })
      setItems(res.items)
      setPagination(res.pagination)
    } catch (err) {
      if (err instanceof Error && err.message === "Authentication required") {
        router.replace("/login?redirect=/orders")
        return
      }
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Failed to load orders."
      )
    } finally {
      setLoading(false)
    }
  }, [page, router])

  useEffect(() => {
    if (!allowed) return
    void load()
  }, [allowed, load])

  const totalPages = pagination?.total_pages ?? 1
  const canPrev = page > 1
  const canNext = page < totalPages

  function goToPage(next: number) {
    if (next < 1 || next > totalPages) return
    router.push(next === 1 ? "/orders" : `/orders?page=${next}`)
  }

  if (!allowed) {
    return <OrdersPageFallback />
  }

  return (
    <PageContainer className="space-y-8 py-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          My orders
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Track your purchases and view order details.
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            <Button type="button" size="sm" variant="outline" onClick={() => void load()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {loading ? (
        <ul className="space-y-4" aria-hidden>
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i}>
              <Skeleton className="h-40 w-full rounded-xl" />
            </li>
          ))}
        </ul>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No orders yet</CardTitle>
            <CardDescription>
              Your orders will appear here after checkout.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button nativeButton={false} render={<Link href="/products" />}>
              Start shopping
            </Button>
          </CardFooter>
        </Card>
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <>
          <ul className="space-y-4">
            {items.map((order) => (
              <li key={order.id}>
                <Card>
                  <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <CardTitle className="font-mono text-base">
                        {order.order_number}
                      </CardTitle>
                      <CardDescription>
                        {order.items_count}{" "}
                        {order.items_count === 1 ? "item" : "items"}
                      </CardDescription>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </CardHeader>
                  <Separator />
                  <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <dl className="grid gap-2 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-muted-foreground">Total</dt>
                        <dd className="text-lg font-semibold tabular-nums">
                          {formatRs(order.total)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Payment</dt>
                        <dd className="mt-0.5">
                          <Badge
                            variant={transactionStatusBadgeVariant(
                              String(order.transaction.status)
                            )}
                          >
                            <span className="sr-only">Payment status: </span>
                            {paymentStatusLabel(String(order.transaction.status))}
                          </Badge>
                        </dd>
                      </div>
                    </dl>
                    <Button
                      nativeButton={false}
                      render={<Link href={`/orders/${order.id}`} />}
                      className="w-full shrink-0 sm:w-auto"
                    >
                      View details
                    </Button>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>

          {pagination && totalPages > 1 ? (
            <div className="flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
              <p className="text-muted-foreground text-sm">
                Page {pagination.current_page} of {pagination.total_pages}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canPrev}
                  onClick={() => goToPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canNext}
                  onClick={() => goToPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </PageContainer>
  )
}

function OrdersPageFallback() {
  return (
    <PageContainer className="space-y-8 py-8">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <ul className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i}>
            <Skeleton className="h-40 w-full rounded-xl" />
          </li>
        ))}
      </ul>
    </PageContainer>
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersPageFallback />}>
      <OrdersPageInner />
    </Suspense>
  )
}
