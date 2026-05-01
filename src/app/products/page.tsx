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

const SORT_LABELS: Record<ProductSort, string> = {
  newest: "Newest",
  price_low_to_high: "Price: Low to High",
  price_high_to_low: "Price: High to Low",
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
    <div className="flex h-10 animate-pulse items-center justify-between border-t border-border/60 pt-6">
      <div className="h-4 w-24 rounded bg-muted" />
      <div className="flex gap-2">
        <div className="h-8 w-20 rounded-md bg-muted" />
        <div className="h-8 w-16 rounded-md bg-muted" />
      </div>
    </div>
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
    <main className="min-h-[60vh] border-b border-border/50 bg-muted/20 pb-10 pt-8 md:pb-14 md:pt-10">
      <PageContainer>
        <header className="mb-6 text-center lg:mb-8 lg:text-left">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Shop Products
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base lg:mx-0 lg:max-w-xl">
            Browse quality products and find the best deals across all categories.
          </p>
        </header>

        <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-8 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="mb-8 shrink-0 lg:sticky lg:top-24 lg:mb-0 lg:self-start">
            <ProductFilters
              categories={categoryOptions}
              initialSearch={search}
              initialCategoryId={category_id ?? ""}
              initialMinPrice={min_price}
              initialMaxPrice={max_price}
              initialSort={sort}
            />
          </aside>

          <div className="min-w-0 space-y-4">
            <div className="flex flex-col gap-2 border-b border-border/50 pb-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-4">
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
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="tabular-nums">
                  Sort:{" "}
                  <span className="font-medium text-foreground">
                    {SORT_LABELS[sort]}
                  </span>
                </span>
                {filtersActive ? (
                  <span className="rounded-full bg-background px-2 py-0.5 text-[0.7rem] font-medium ring-1 ring-border/80">
                    Filters active
                  </span>
                ) : null}
              </div>
            </div>

            {items.length === 0 ? (
              <div
                className="rounded-xl border border-border/60 bg-background px-5 py-12 text-center shadow-sm sm:py-14"
                role="status"
              >
                <h2 className="font-heading text-lg font-semibold tracking-tight">
                  {filtersActive ? "No products found" : "No products available"}
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  {filtersActive
                    ? "Try adjusting your search or filters to find what you are looking for."
                    : "Please check again later."}
                </p>
                {filtersActive ? (
                  <Button
                    className="mt-6"
                    nativeButton={false}
                    render={<Link href="/products" />}
                  >
                    Clear filters
                  </Button>
                ) : null}
              </div>
            ) : (
              <>
                <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
          </div>
        </div>
      </PageContainer>
    </main>
  )
}
