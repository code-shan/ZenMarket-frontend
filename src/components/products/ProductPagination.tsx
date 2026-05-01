"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import type { ProductPaginationMeta } from "@/types/product"

type Props = {
  pagination: ProductPaginationMeta
}

export function ProductPagination({ pagination }: Props) {
  const searchParams = useSearchParams()
  const { current_page, total_pages, per_page, total } = pagination

  const makeHref = (page: number) => {
    const p = new URLSearchParams(searchParams.toString())
    p.set("page", String(page))
    const qs = p.toString()
    return qs ? `/products?${qs}` : "/products"
  }

  const rangeStart = total === 0 ? 0 : (current_page - 1) * per_page + 1
  const rangeEnd = Math.min(current_page * per_page, total)

  return (
    <nav
      className="flex flex-col gap-4 border-t border-border/60 pt-8 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Product pagination"
    >
      <p className="text-center text-sm tabular-nums text-muted-foreground sm:text-left">
        Showing {rangeStart}–{rangeEnd} of {total}{" "}
        {total === 1 ? "product" : "products"}
      </p>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-end">
        <p className="text-sm font-medium tabular-nums text-foreground">
          Page {current_page} of {Math.max(total_pages, 1)}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {current_page > 1 ? (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href={makeHref(current_page - 1)} prefetch={false} />}
            >
              Previous
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
          )}
          {current_page < total_pages ? (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href={makeHref(current_page + 1)} prefetch={false} />}
            >
              Next
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
