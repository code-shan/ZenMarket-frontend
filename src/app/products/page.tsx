import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { PageContainer } from "@/components/layout/PageContainer"
import { ProductCard } from "@/components/products/ProductCard"
import { ProductFilters } from "@/components/products/ProductFilters"
import { ProductPagination } from "@/components/products/ProductPagination"
import { Button } from "@/components/ui/button"
import { getCategories } from "@/services/categoryService"
import { getProducts } from "@/services/productService"
import type { ProductSort } from "@/types/product"

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse quality products and find the best deals across all categories on ZenMarket.",
}

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function parseSort(raw: string | undefined): ProductSort {
  if (
    raw === "newest" ||
    raw === "price_low_to_high" ||
    raw === "price_high_to_low"
  ) {
    return raw
  }
  return "newest"
}

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

function hasActiveFilters(sp: Record<string, string | string[] | undefined>): boolean {
  const search = (firstParam(sp.search) ?? "").trim()
  const category =
    firstParam(sp.category_id) ?? firstParam(sp.category) ?? ""
  const minP = (firstParam(sp.min_price) ?? "").trim()
  const maxP = (firstParam(sp.max_price) ?? "").trim()
  const sort = parseSort(firstParam(sp.sort))
  return (
    search.length > 0 ||
    String(category).trim().length > 0 ||
    minP.length > 0 ||
    maxP.length > 0 ||
    sort !== "newest"
  )
}

function PaginationSkeleton() {
  return (
    <div className="flex h-14 animate-pulse justify-between rounded-lg border border-border/40 bg-muted/30" />
  )
}

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams

  const search = (firstParam(sp.search) ?? "").trim()
  const categoryRaw =
    firstParam(sp.category_id) ?? firstParam(sp.category) ?? ""
  const category_id =
    categoryRaw.trim() !== "" ? categoryRaw.trim() : undefined
  const min_price = (firstParam(sp.min_price) ?? "").trim()
  const max_price = (firstParam(sp.max_price) ?? "").trim()
  const sort = parseSort(firstParam(sp.sort))
  const pageRaw = firstParam(sp.page) ?? "1"
  const page = Math.max(1, Number.parseInt(pageRaw, 10) || 1)

  let categoryOptions: { id: number; name: string }[] = []
  try {
    const { items } = await getCategories({ per_page: 100, page: 1 })
    categoryOptions = items
      .filter((c) => c.is_active)
      .map((c) => ({ id: c.id, name: c.name }))
  } catch {
    categoryOptions = []
  }

  const { items, pagination } = await getProducts({
    search: search || undefined,
    category_id,
    min_price: min_price || undefined,
    max_price: max_price || undefined,
    sort,
    per_page: 12,
    page,
  })

  const filtersActive = hasActiveFilters(sp)
  const { current_page, total_pages, per_page, total } = pagination
  const rangeStart = total === 0 ? 0 : (current_page - 1) * per_page + 1
  const rangeEnd = Math.min(current_page * per_page, total)

  return (
    <main className="min-h-[60vh] border-b border-border/40 bg-gradient-to-b from-muted/25 to-background pb-16 pt-10 md:pb-24 md:pt-14">
      <PageContainer className="space-y-8 md:space-y-10">
        <header className="mx-auto max-w-3xl space-y-3 text-center md:space-y-4">
          <h1 className="font-heading text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Shop Products
          </h1>
          <p className="text-pretty text-base text-muted-foreground md:text-lg">
            Browse quality products and find the best deals across all categories.
          </p>
        </header>

        <ProductFilters
          categories={categoryOptions}
          initialSearch={search}
          initialCategoryId={category_id ?? ""}
          initialMinPrice={min_price}
          initialMaxPrice={max_price}
          initialSort={sort}
        />

        <p className="text-sm tabular-nums text-muted-foreground">
          {total === 0 ? (
            <>No products match your criteria.</>
          ) : (
            <>
              Showing {rangeStart}–{rangeEnd} of {total}{" "}
              {total === 1 ? "product" : "products"}
            </>
          )}
        </p>

        {items.length === 0 ? (
          <div
            className="rounded-2xl border border-border/60 bg-muted/20 px-6 py-14 text-center shadow-sm"
            role="status"
          >
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              {filtersActive ? "No products found" : "No products available"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              {filtersActive
                ? "Try adjusting your search or filters to find what you are looking for."
                : "Please check again later."}
            </p>
            {filtersActive ? (
              <Button
                className="mt-8"
                nativeButton={false}
                render={<Link href="/products" />}
              >
                Clear filters
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>

            {total_pages > 1 ? (
              <Suspense fallback={<PaginationSkeleton />}>
                <ProductPagination pagination={pagination} />
              </Suspense>
            ) : null}
          </>
        )}
      </PageContainer>
    </main>
  )
}
