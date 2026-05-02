import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/types/order"

const LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirm: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

const STYLES: Record<OrderStatus, string> = {
  pending: "border-transparent bg-muted text-muted-foreground",
  confirm:
    "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950/60 dark:text-sky-100",
  processing:
    "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-100",
  shipped:
    "border-violet-200 bg-violet-50 text-violet-950 dark:border-violet-900 dark:bg-violet-950/50 dark:text-violet-100",
  delivered:
    "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100",
  cancelled: "",
}

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus
  className?: string
}) {
  const label = LABELS[status] ?? status
  return (
    <Badge
      variant={status === "cancelled" ? "destructive" : "outline"}
      className={cn(
        status !== "cancelled" && STYLES[status],
        className
      )}
    >
      <span className="sr-only">Order status: </span>
      {label}
    </Badge>
  )
}
