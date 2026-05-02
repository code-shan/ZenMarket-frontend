"use client"

import Image from "next/image"
import Link from "next/link"

import { AddToCartButton } from "@/components/cart/AddToCartButton"
import { BuyNowButton } from "@/components/cart/BuyNowButton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  formatUsdPrice,
  getProductDiscountLabel,
} from "@/lib/product-display"
import { isLoopbackHttpUrl, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/media"
import { cn } from "@/lib/utils"
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
  const outOfStock = product.is_out_of_stock

  return (
    <Card
      className={cn(
        "group flex h-full flex-col gap-2 overflow-hidden border-border/80 pb-3 pt-0 shadow-sm transition-[transform,box-shadow] duration-300",
        !outOfStock && "hover:-translate-y-1 hover:shadow-lg",
        compact && "text-sm",
        outOfStock && "opacity-[0.96]"
      )}
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
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, (max-width: 1536px) 33vw, 25vw"
          className={cn(
            "object-cover transition-transform duration-300",
            !outOfStock && "group-hover:scale-[1.02]",
            usingPlaceholder ? "opacity-90" : "",
            outOfStock && "brightness-[0.92]"
          )}
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

        <div className="absolute left-2 top-2 z-[1] flex max-w-[calc(100%-1rem)] flex-wrap gap-1.5">
          {outOfStock ? (
            <Badge variant="destructive" className="shadow-sm">
              Out of stock
            </Badge>
          ) : null}
          {product.is_featured ? (
            <Badge variant="secondary" className="shadow-sm">
              Featured
            </Badge>
          ) : null}
          {discountLabel ? (
            <Badge className="shadow-sm">{discountLabel}</Badge>
          ) : null}
        </div>

        {product.category?.name ? (
          <div className="pointer-events-none absolute bottom-2 left-2 z-[1] max-w-[calc(100%-1rem)]">
            <p className="truncate rounded-md bg-black/55 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm backdrop-blur-[2px] sm:text-xs">
              {product.category.name}
            </p>
          </div>
        ) : null}
      </div>

      <CardHeader
        className={`gap-0.5 py-0 ${compact ? "space-y-0 pb-1 pt-2" : "pb-0 pt-0"}`}
      >
        <CardTitle className={`line-clamp-2 leading-snug ${compact ? "text-base" : "text-lg"}`}>
          {product.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-1 pb-0 pt-0">
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

      <CardFooter className="mt-auto flex flex-col gap-1.5 border-t bg-muted/30 px-4 pb-2 pt-2">
        <Button
          size="sm"
          className="w-full"
          nativeButton={false}
          render={<Link href={`/products/${product.id}`} />}
          aria-label={`View ${product.name}`}
        >
          View Product
        </Button>
        <div className="flex flex-wrap items-start gap-2">
          <AddToCartButton
            productId={product.id}
            disabled={outOfStock}
            variant="outline"
            size="sm"
            wrapperClassName="min-w-0 flex-1 basis-[calc(50%-0.25rem)]"
            buttonClassName="w-full"
            loginRedirectPath={`/login?redirect=/products/${product.id}`}
          />
          <BuyNowButton
            productId={product.id}
            disabled={outOfStock}
            size="sm"
            wrapperClassName="min-w-0 flex-1 basis-[calc(50%-0.25rem)]"
            buttonClassName="w-full shadow-sm"
            loginRedirectPath="/login?redirect=/cart"
          />
        </div>
      </CardFooter>
    </Card>
  )
}
