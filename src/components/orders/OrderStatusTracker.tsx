import {
  CheckCircle2Icon,
  ClockIcon,
  HomeIcon,
  PackageIcon,
  TruckIcon,
  XCircleIcon,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/types/order"

const STEPS: {
  key: Exclude<OrderStatus, "cancelled">
  label: string
  description: string
  Icon: typeof ClockIcon
}[] = [
  {
    key: "pending",
    label: "Pending",
    description: "Order received",
    Icon: ClockIcon,
  },
  {
    key: "confirmed",
    label: "Confirmed",
    description: "Seller confirmed",
    Icon: CheckCircle2Icon,
  },
  {
    key: "processing",
    label: "Processing",
    description: "Being prepared",
    Icon: PackageIcon,
  },
  {
    key: "shipped",
    label: "Shipped",
    description: "On the way",
    Icon: TruckIcon,
  },
  {
    key: "delivered",
    label: "Delivered",
    description: "Completed",
    Icon: HomeIcon,
  },
]

function currentStepIndex(status: OrderStatus): number {
  if (status === "cancelled") return -1
  const order: Exclude<OrderStatus, "cancelled">[] = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
  ]
  return order.indexOf(status as Exclude<OrderStatus, "cancelled">)
}

export function OrderStatusTracker({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <Alert variant="destructive" role="alert">
        <XCircleIcon aria-hidden className="size-4" />
        <AlertTitle>Order cancelled</AlertTitle>
        <AlertDescription>
          This order has been cancelled. Progress tracking is not shown for
          cancelled orders.
        </AlertDescription>
      </Alert>
    )
  }

  const current = currentStepIndex(status)
  const lastIdx = STEPS.length - 1

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <h3 className="text-sm font-medium text-foreground">Order progress</h3>
      <p className="text-muted-foreground mt-0.5 text-xs">
        Follow each stage from pending through delivery.
      </p>
      <ol
        className="mt-6 flex flex-col gap-5 md:mt-8 md:flex-row md:flex-wrap md:items-stretch md:justify-between md:gap-4 lg:gap-6"
        aria-label="Order tracking steps"
      >
        {STEPS.map((step, i) => {
          const stepComplete =
            i < current || (status === "delivered" && i === lastIdx)
          const stepActive = i === current && status !== "delivered"
          const Icon = step.Icon

          return (
            <li
              key={step.key}
              className="relative flex gap-3 md:max-w-[18%] md:flex-1 md:flex-col md:items-center md:gap-2 md:text-center"
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  stepComplete && "border-emerald-600 bg-emerald-600 text-white",
                  stepActive &&
                    "border-primary bg-primary text-primary-foreground ring-2 ring-primary/35 ring-offset-2 ring-offset-background",
                  !stepComplete &&
                    !stepActive &&
                    "border-border bg-muted text-muted-foreground"
                )}
                aria-current={stepActive ? "step" : undefined}
              >
                {stepComplete ? (
                  <CheckCircle2Icon className="size-5" aria-hidden />
                ) : (
                  <Icon className="size-5" aria-hidden />
                )}
              </span>
              <div className="min-w-0 md:px-0.5">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    stepActive && "text-foreground",
                    stepComplete && "text-emerald-900 dark:text-emerald-100",
                    !stepComplete && !stepActive && "text-muted-foreground"
                  )}
                >
                  {step.label}
                  {stepActive ? (
                    <span className="sr-only"> (current step)</span>
                  ) : null}
                </p>
                <p className="text-muted-foreground text-xs">{step.description}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
