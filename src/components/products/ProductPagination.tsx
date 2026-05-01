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
  const { current_page, total_pages } = pagination

  const makeHref = (page: number) => {
    const p = new URLSearchParams(searchParams.toString())
    p.set("page", String(page))
    const qs = p.toString()
    return qs ? `/products?${qs}` : "/products"
  }

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-6"
      aria-label="Product pagination"
    >
      <p className="text-sm font-medium tabular-nums text-muted-foreground">
        Page {current_page} of {Math.max(total_pages, 1)}
      </p>

      <div className="flex gap-2">
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
    </nav>
  )
}
