import Image from "next/image"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader } from "@/components/ui/card"
import {
  CATEGORY_IMAGE_PLACEHOLDER,
  isLoopbackHttpUrl,
} from "@/lib/media"
import type { Category } from "@/types/category"

function resolveDisplayImage(category: Category): string {
  const fromUrl = category.image_url?.trim() ?? ""
  if (fromUrl) return fromUrl
  return CATEGORY_IMAGE_PLACEHOLDER
}

export function CategoryCard({ category }: { category: Category }) {
  const rawResolved = category.image_url?.trim() ?? ""
  const hasCustomImage = rawResolved !== ""
  const imageUrl = resolveDisplayImage(category)
  const usingPlaceholder = !hasCustomImage
  const unoptimized = isLoopbackHttpUrl(imageUrl)

  return (
    <Link
      href={`/products?category_id=${encodeURIComponent(String(category.id))}`}
      className="group block h-full rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      aria-label={`Browse ${category.name} category products`}
    >
      <Card className="flex h-full flex-col overflow-hidden border-border/80 shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="relative h-48 w-full overflow-hidden bg-muted sm:h-52">
          <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
            {category.is_featured ? (
              <Badge variant="secondary" className="shadow-sm backdrop-blur-sm">
                Featured
              </Badge>
            ) : null}
          </div>
          <Image
            src={imageUrl}
            alt={
              usingPlaceholder
                ? ""
                : `${category.name} — category photo`
            }
            fill
            unoptimized={unoptimized}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
              usingPlaceholder ? "opacity-85" : ""
            }`}
          />
          <div
            aria-hidden
            className={`absolute inset-0 ${
              usingPlaceholder
                ? "bg-black/25"
                : "bg-gradient-to-t from-black/55 via-black/15 to-transparent"
            }`}
          />
          <div className="absolute inset-x-0 bottom-0 p-4 pt-12">
            <p className="font-heading text-lg font-semibold tracking-tight text-white drop-shadow-md sm:text-xl">
              {category.name}
            </p>
            {usingPlaceholder ? (
              <p className="mt-1 text-xs font-medium text-white/90">Image coming soon</p>
            ) : null}
          </div>
        </div>

        <CardHeader className="flex flex-1 flex-col gap-2 pb-4 pt-4">
          {category.description ? (
            <CardDescription className="line-clamp-2">
              {category.description}
            </CardDescription>
          ) : null}
          <p className="text-sm font-semibold text-primary">Explore products →</p>
        </CardHeader>
      </Card>
    </Link>
  )
}
