import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { CategoryCard } from "@/components/categories/CategoryCard"
import { CategorySearch } from "@/components/categories/CategorySearch"
import { PageContainer } from "@/components/layout/PageContainer"
import { Button } from "@/components/ui/button"
import { getCategories } from "@/services/categoryService"

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse active product categories on ZenMarket and jump to filtered products.",
}

type Props = {
  searchParams: Promise<{ search?: string; page?: string }>
}

function SearchFallback() {
  return (
    <div className="h-11 max-w-xl flex-1 animate-pulse rounded-xl bg-muted md:h-12" />
  )
}

function buildCategoriesHref(search: string, page: number): string {
  const params = new URLSearchParams()
  if (search.trim()) params.set("search", search.trim())
  params.set("page", String(page))
  return `/categories?${params.toString()}`
}

export default async function CategoriesPage({ searchParams }: Props) {
  const sp = await searchParams
  const search = typeof sp.search === "string" ? sp.search : ""
  const pageRaw = typeof sp.page === "string" ? sp.page : "1"
  const page = Math.max(1, Number.parseInt(pageRaw, 10) || 1)

  const { items, pagination } = await getCategories({
    search,
    page,
    per_page: 8,
  })

  const { current_page, total_pages, per_page, total } = pagination
  const hasSearch = search.trim().length > 0

  const rangeStart = total === 0 ? 0 : (current_page - 1) * per_page + 1
  const rangeEnd = Math.min(current_page * per_page, total)

  return (
    <main className="min-h-[60vh] border-b border-border/40 bg-gradient-to-b from-muted/30 to-background pb-20 pt-12 md:pb-24 md:pt-16">
      <PageContainer className="space-y-10">
        <header className="mx-auto max-w-3xl space-y-4 text-center md:space-y-5">
          <h1 className="font-heading text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Shop by Categories
          </h1>
          <p className="text-pretty text-base text-muted-foreground md:text-lg">
            Explore our active product categories and find what you need faster.
          </p>
        </header>

        <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <Suspense fallback={<SearchFallback />}>
            <CategorySearch initialSearch={search} className="sm:max-w-md" />
          </Suspense>
          <p className="shrink-0 text-center text-sm tabular-nums text-muted-foreground sm:text-right">
            {total === 0 ? (
              <>No categories to show</>
            ) : (
              <>
                Showing {rangeStart}–{rangeEnd} of {total}{" "}
                {total === 1 ? "category" : "categories"}
              </>
            )}
          </p>
        </div>

        {items.length === 0 ? (
          <div
            className="rounded-2xl border border-border/60 bg-muted/25 px-6 py-16 text-center"
            role="status"
          >
            <p className="text-base font-medium text-foreground">
              {hasSearch
                ? "No categories found for your search."
                : "No categories found."}
            </p>
            {hasSearch ? (
              <Button variant="link" nativeButton={false} render={<Link href="/categories" />} className="mt-2">
                Clear search
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {items.map((category) => (
                <li key={category.id}>
                  <CategoryCard category={category} />
                </li>
              ))}
            </ul>

            {total_pages > 1 ? (
              <nav
                className="flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-10 sm:flex-row"
                aria-label="Category pagination"
              >
                {current_page > 1 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={
                      <Link href={buildCategoriesHref(search, current_page - 1)} prefetch={false} />
                    }
                  >
                    Previous
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                )}

                <p className="order-first text-sm tabular-nums text-muted-foreground sm:order-none">
                  Page {current_page} of {total_pages}
                </p>

                {current_page < total_pages ? (
                  <Button
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={
                      <Link href={buildCategoriesHref(search, current_page + 1)} prefetch={false} />
                    }
                  >
                    Next
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                )}
              </nav>
            ) : null}
          </>
        )}
      </PageContainer>
    </main>
  )
}
