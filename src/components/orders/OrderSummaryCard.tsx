import type { ComponentProps } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { Order } from "@/types/order"

import { OrderStatusBadge } from "./OrderStatusBadge"

function formatRs(value: string): string {
  const n = Number.parseFloat(value)
  const safe = Number.isFinite(n) ? n : 0
  return `Rs. ${safe.toFixed(2)}`
}

function paymentTypeLabel(type: string): string {
  const t = type.trim().toLowerCase()
  if (t === "cod") return "Cash on Delivery"
  return type
}

function transactionStatusLabel(status: string): string {
  const s = status.trim().toLowerCase()
  if (s === "paid") return "Paid"
  if (s === "pending") return "Pending"
  if (s === "failed") return "Failed"
  if (s === "cancelled") return "Cancelled"
  return status
}

function transactionBadgeVariant(
  status: string
): ComponentProps<typeof Badge>["variant"] {
  const s = status.trim().toLowerCase()
  if (s === "paid") return "default"
  if (s === "pending") return "secondary"
  if (s === "failed" || s === "cancelled") return "destructive"
  return "outline"
}

export function OrderSummaryCard({
  order,
  className,
}: {
  order: Order
  className?: string
}) {
  const { transaction } = order

  return (
    <Card className={cn(className)}>
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg">Summary</CardTitle>
            <CardDescription className="font-mono text-xs">
              {order.order_number}
            </CardDescription>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <dl className="space-y-2">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Items</dt>
            <dd className="tabular-nums font-medium">{order.items_count}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="tabular-nums">{formatRs(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Discount</dt>
            <dd className="tabular-nums text-emerald-700 dark:text-emerald-400">
              − {formatRs(order.discount_total)}
            </dd>
          </div>
        </dl>
        <Separator />
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-base font-semibold">Total</span>
          <span className="text-2xl font-bold tabular-nums tracking-tight">
            {formatRs(order.total)}
          </span>
        </div>
        <Separator />
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-muted-foreground">Payment</span>
            <span className="font-medium">
              {paymentTypeLabel(String(transaction.payment_type))}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-muted-foreground">Payment status</span>
            <Badge variant={transactionBadgeVariant(String(transaction.status))}>
              <span className="sr-only">Payment status: </span>
              {transactionStatusLabel(String(transaction.status))}
            </Badge>
          </div>
          {transaction.currency ? (
            <p className="text-muted-foreground text-xs">
              Charged in {transaction.currency}
              {transaction.amount ? ` · ${formatRs(transaction.amount)}` : ""}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
