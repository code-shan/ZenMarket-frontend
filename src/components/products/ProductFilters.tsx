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
    <Card className="rounded-xl border-border/80 shadow-sm">
      <CardHeader className="space-y-1 pb-3 pt-5">
        <CardTitle className="text-base font-semibold">Filters</CardTitle>
        <CardDescription className="text-xs leading-snug">
          Narrow by keyword, category, price, or sort.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pb-5 pt-0">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-search" className="text-xs">
              Search
            </Label>
            <Input
              id="product-search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyFilters()
              }}
              autoComplete="off"
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-category" className="text-xs">
              Category
            </Label>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? ALL)}>
              <SelectTrigger id="product-category" className="h-9 w-full text-sm">
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="min-price" className="text-xs">
                Min price
              </Label>
              <Input
                id="min-price"
                inputMode="decimal"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-price" className="text-xs">
                Max price
              </Label>
              <Input
                id="max-price"
                inputMode="decimal"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-sort" className="text-xs">
              Sort
            </Label>
            <Select
              value={sort}
              onValueChange={(v) => setSort((v as ProductSort) ?? "newest")}
            >
              <SelectTrigger id="product-sort" className="h-9 w-full text-sm">
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

        <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-4">
          <Button type="button" size="sm" className="w-full" onClick={applyFilters}>
            Apply
          </Button>
          <Button
            variant="outline"
            size="sm"
            type="button"
            className="w-full"
            nativeButton={false}
            render={<Link href="/products" />}
          >
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
