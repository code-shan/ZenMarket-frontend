import Image from "next/image"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  formatUsdPrice,
  getProductDiscountLabel,
} from "@/lib/product-display"
import { isLoopbackHttpUrl, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/media"
import type { Product } from "@/types/product"

export function ProductCard({
  product,
  variant = "default",
}: {
  product: Product
  variant?: "default" | "compact"
}) {
  const rawImage = product.image_url?.trim() ?? ""
  const hasImage = rawImage !== ""
  const imageSrc = hasImage ? rawImage : PRODUCT_IMAGE_PLACEHOLDER
  const usingPlaceholder = !hasImage

  const unoptimized = isLoopbackHttpUrl(imageSrc)

  const originalNum = Number.parseFloat(product.price)
  const finalNum = Number.parseFloat(product.final_price)
  const showOriginalStruck =
    Number.isFinite(originalNum) &&
    Number.isFinite(finalNum) &&
    finalNum < originalNum

  const discountLabel = getProductDiscountLabel(product)

  const imageAlt = usingPlaceholder
    ? `${product.name} — product image coming soon`
    : product.name

  const compact = variant === "compact"

  return (
    <Card
      className={`group flex h-full flex-col overflow-hidden border-border/80 shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg ${
        compact ? "text-sm" : ""
      }`}
    >
      <div
        className={`relative w-full overflow-hidden rounded-t-xl bg-muted ${
          compact ? "aspect-[4/3]" : "aspect-square"
        }`}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          unoptimized={unoptimized}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-transform duration-300 group-hover:scale-[1.02] ${
            usingPlaceholder ? "opacity-90" : ""
          }`}
        />
        {usingPlaceholder ? (
          <>
            <div className="absolute inset-0 bg-black/25" aria-hidden />
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <p className="text-center text-sm font-semibold text-white drop-shadow-md">
                Image coming soon
              </p>
            </div>
          </>
        ) : null}

        <div className="absolute left-2 top-2 flex max-w-[calc(100%-1rem)] flex-wrap gap-1.5">
          {product.is_featured ? (
            <Badge variant="secondary" className="shadow-sm">
              Featured
            </Badge>
          ) : null}
          {discountLabel ? (
            <Badge className="shadow-sm">{discountLabel}</Badge>
          ) : null}
        </div>
      </div>

      <CardHeader className={`gap-1 ${compact ? "space-y-0 pb-2 pt-3" : "pb-0"}`}>
        {product.category?.name ? (
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {product.category.name}
          </p>
        ) : null}
        <CardTitle className={`line-clamp-2 leading-snug ${compact ? "text-base" : "text-lg"}`}>
          {product.name}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-pretty">
          {product.description}
        </CardDescription>
      </CardHeader>

      <CardContent className={`mt-auto flex flex-col gap-2 ${compact ? "pb-2 pt-0" : "pb-2 pt-0"}`}>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className={`font-semibold tabular-nums text-foreground ${compact ? "text-lg" : "text-xl"}`}>
            {formatUsdPrice(product.final_price)}
          </span>
          {showOriginalStruck ? (
            <span className="text-sm tabular-nums text-muted-foreground line-through">
              {formatUsdPrice(product.price)}
            </span>
          ) : null}
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex flex-wrap gap-2 border-t bg-muted/30 pt-3 pb-3">
        <Button
          size="sm"
          className="min-w-[7rem] flex-1"
          nativeButton={false}
          render={<Link href={`/products/${product.id}`} />}
          aria-label={`View ${product.name}`}
        >
          View Product
        </Button>
        <Button
          size="sm"
          variant="outline"
          type="button"
          disabled
          title="Coming soon"
          aria-label={`Add ${product.name} to cart — coming soon`}
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}
