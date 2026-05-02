"use client"

import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { getApiBaseUrl } from "@/lib/api"
import { isLoopbackHttpUrl, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/media"
import { cn } from "@/lib/utils"
import type { OrderItem } from "@/types/order"

const FALLBACK_IMAGE = PRODUCT_IMAGE_PLACEHOLDER

function resolveItemImageUrl(url: string | null | undefined): string {
  const s = typeof url === "string" ? url.trim() : ""
  if (s === "") return FALLBACK_IMAGE
  if (/^https?:\/\//i.test(s)) return s
  try {
    const origin = new URL(getApiBaseUrl()).origin
    return s.startsWith("/") ? `${origin}${s}` : `${origin}/${s}`
  } catch {
    return FALLBACK_IMAGE
  }
}

function formatRs(value: string): string {
  const n = Number.parseFloat(value)
  const safe = Number.isFinite(n) ? n : 0
  return `Rs. ${safe.toFixed(2)}`
}

function discountLabel(item: OrderItem): string | null {
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

function hasDiscount(item: OrderItem): boolean {
  const u = Number.parseFloat(item.unit_price)
  const f = Number.parseFloat(item.final_unit_price)
  return Number.isFinite(u) && Number.isFinite(f) && f < u
}

export function OrderItemsList({
  items,
  className,
}: {
  items: OrderItem[]
  className?: string
}) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No line items in this order.</p>
    )
  }

  return (
    <ul className={cn("space-y-4", className)}>
      {items.map((item, index) => {
        const src = resolveItemImageUrl(item.product_image_url)
        const unopt = isLoopbackHttpUrl(src)
        const label = discountLabel(item)
        const strike = hasDiscount(item)

        return (
          <li
            key={`${item.product_id}-${index}`}
            className="flex gap-3 rounded-lg border bg-card p-3 shadow-sm"
          >
            <div className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-md bg-muted">
              <Image
                src={src}
                alt={item.product_name}
                fill
                className="object-cover"
                sizes="72px"
                unoptimized={unopt}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium leading-snug">{item.product_name}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {item.category_name}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums">
                  {formatRs(item.line_total)}
                </p>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-muted-foreground">
                  Qty <span className="tabular-nums">{item.quantity}</span>
                </span>
                <span className="text-muted-foreground" aria-hidden>
                  ·
                </span>
                <span className="text-muted-foreground">
                  Unit{" "}
                  {strike ? (
                    <>
                      <span className="tabular-nums line-through opacity-70">
                        {formatRs(item.unit_price)}
                      </span>{" "}
                      <span className="font-medium text-foreground tabular-nums">
                        {formatRs(item.final_unit_price)}
                      </span>
                    </>
                  ) : (
                    <span className="tabular-nums font-medium text-foreground">
                      {formatRs(item.final_unit_price)}
                    </span>
                  )}
                </span>
                {label ? (
                  <Badge variant="secondary" className="text-[0.65rem]">
                    {label}
                  </Badge>
                ) : null}
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
