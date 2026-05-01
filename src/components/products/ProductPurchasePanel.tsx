"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AddToCartButton } from "@/components/cart/AddToCartButton"
import { BuyNowButton } from "@/components/cart/BuyNowButton"
import { formatUsdPrice } from "@/lib/product-display"
import type { Product } from "@/types/product"

export function ProductPurchasePanel({ product }: { product: Product }) {
  const originalNum = Number.parseFloat(product.price)
  const finalNum = Number.parseFloat(product.final_price)
  const showOriginal =
    Number.isFinite(originalNum) &&
    Number.isFinite(finalNum) &&
    finalNum < originalNum

  const outOfStock = product.is_out_of_stock

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Purchase</CardTitle>
        <CardDescription>Pricing from catalog.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="text-3xl font-semibold tabular-nums text-foreground">
            {formatUsdPrice(product.final_price)}
          </p>
          {showOriginal ? (
            <p className="text-lg tabular-nums text-muted-foreground line-through">
              {formatUsdPrice(product.price)}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-3">
          <BuyNowButton
            productId={product.id}
            disabled={outOfStock}
            variant="default"
            size="lg"
            wrapperClassName="w-full"
            buttonClassName="h-11 w-full text-base shadow-sm"
            loginRedirectPath="/login?redirect=/cart"
          />
          <AddToCartButton
            productId={product.id}
            disabled={outOfStock}
            variant="outline"
            size="lg"
            wrapperClassName="w-full"
            buttonClassName="h-11 w-full text-base"
            loginRedirectPath={`/login?redirect=/products/${product.id}`}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {outOfStock
            ? "This item is currently unavailable."
            : "Cash on Delivery checkout is available at the next step."}
        </p>
      </CardContent>
    </Card>
  )
}
