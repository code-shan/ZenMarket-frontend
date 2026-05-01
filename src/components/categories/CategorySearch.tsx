"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SearchIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function CategorySearch({
  initialSearch,
  className,
}: {
  initialSearch: string
  className?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlSearch = searchParams.get("search") ?? ""
  const [value, setValue] = useState(initialSearch)

  useEffect(() => {
    setValue(initialSearch)
  }, [initialSearch])

  useEffect(() => {
    const id = window.setTimeout(() => {
      const trimmed = value.trim()
      const prev = urlSearch.trim()
      if (trimmed === prev) return

      const params = new URLSearchParams()
      if (trimmed) params.set("search", trimmed)
      params.set("page", "1")
      router.replace(`/categories?${params.toString()}`)
    }, 300)

    return () => window.clearTimeout(id)
  }, [value, router, urlSearch])

  return (
    <div className={cn("relative max-w-xl flex-1", className)}>
      <SearchIcon
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search categories..."
        aria-label="Search categories"
        className="h-11 rounded-xl border-border/80 bg-background pl-10 shadow-sm md:h-12"
      />
    </div>
  )
}
