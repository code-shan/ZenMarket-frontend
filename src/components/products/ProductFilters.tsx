"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ProductSort } from "@/types/product"

const ALL = "all"

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_low_to_high", label: "Price: Low to High" },
  { value: "price_high_to_low", label: "Price: High to Low" },
]

export type ProductFiltersCategory = {
  id: number
  name: string
}

type Props = {
  categories: ProductFiltersCategory[]
  initialSearch: string
  initialCategoryId: string
  initialMinPrice: string
  initialMaxPrice: string
  initialSort: ProductSort
}

export function ProductFilters({
  categories,
  initialSearch,
  initialCategoryId,
  initialMinPrice,
  initialMaxPrice,
  initialSort,
}: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch)
  const [categoryId, setCategoryId] = useState(
    initialCategoryId ? initialCategoryId : ALL
  )
  const [minPrice, setMinPrice] = useState(initialMinPrice)
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice)
  const [sort, setSort] = useState<ProductSort>(initialSort)

  useEffect(() => {
    setSearch(initialSearch)
    setCategoryId(initialCategoryId ? initialCategoryId : ALL)
    setMinPrice(initialMinPrice)
    setMaxPrice(initialMaxPrice)
    setSort(initialSort)
  }, [
    initialSearch,
    initialCategoryId,
    initialMinPrice,
    initialMaxPrice,
    initialSort,
  ])

  function applyFilters() {
    const params = new URLSearchParams()
    params.set("page", "1")

    const trimmedSearch = search.trim()
    if (trimmedSearch) params.set("search", trimmedSearch)

    if (categoryId && categoryId !== ALL) {
      params.set("category_id", categoryId)
    }

    const min = minPrice.trim()
    if (min) params.set("min_price", min)

    const max = maxPrice.trim()
    if (max) params.set("max_price", max)

    params.set("sort", sort)

    router.push(`/products?${params.toString()}`)
  }

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Filters</CardTitle>
        <CardDescription>
          Refine results by keyword, category, price range, and sort order.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 xl:items-end">
          <div className="space-y-2 sm:col-span-2 xl:col-span-2">
            <Label htmlFor="product-search">Search</Label>
            <Input
              id="product-search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyFilters()
              }}
              autoComplete="off"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-category">Category</Label>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? ALL)}>
              <SelectTrigger id="product-category" className="h-10 w-full">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="min-price">Min price</Label>
            <Input
              id="min-price"
              inputMode="decimal"
              placeholder="Min price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-price">Max price</Label>
            <Input
              id="max-price"
              inputMode="decimal"
              placeholder="Max price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-sort">Sort</Label>
            <Select
              value={sort}
              onValueChange={(v) => setSort((v as ProductSort) ?? "newest")}
            >
              <SelectTrigger id="product-sort" className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-border/60 pt-4">
          <Button type="button" onClick={applyFilters}>
            Apply filters
          </Button>
          <Button variant="outline" type="button" nativeButton={false} render={<Link href="/products" />}>
            Clear filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
