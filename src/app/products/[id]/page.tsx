import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { PageContainer } from "@/components/layout/PageContainer"
import { ProductPurchasePanel } from "@/components/products/ProductPurchasePanel"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { isLoopbackHttpUrl, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/media"
import { getProductDiscountLabel } from "@/lib/product-display"
import { cn } from "@/lib/utils"
import { getProductById } from "@/services/productService"
import type { Product } from "@/types/product"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params
  const product = await getProductById(id)

  if (!product) {
    return {
      title: "Product",
      description: "Product detail.",
    }
  }

  return {
    title: product.name,
    description: product.description,
  }
}

export default async function ProductDetailPage(props: Props) {
  const { id } = await props.params
  const product = await getProductById(id)

  if (!product) {
    return (
      <PageContainer className="space-y-8">
        <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit")}>
          ← Back to marketplace
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Product unavailable</CardTitle>
            <CardDescription>
              No product was returned for{" "}
              <span className="font-mono text-foreground">{id}</span>. Verify the ID or API route{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">/products/:id</code>.
            </CardDescription>
          </CardHeader>
        </Card>
      </PageContainer>
    )
  }

  return <ProductDetailContent product={product} />
}

function ProductDetailContent({ product }: { product: Product }) {
  const rawImage = product.image_url?.trim() ?? ""
  const imageSrc = rawImage || PRODUCT_IMAGE_PLACEHOLDER
  const usingPlaceholder = !rawImage
  const unoptimized = isLoopbackHttpUrl(imageSrc)

  const discountLabel = getProductDiscountLabel(product)
  const imageAlt = usingPlaceholder
    ? `${product.name} — product image coming soon`
    : product.name

  return (
    <PageContainer className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit")}>
          ← Back
        </Link>
        {product.is_out_of_stock ? (
          <Badge variant="destructive">Out of stock</Badge>
        ) : null}
        {product.is_featured ? (
          <Badge variant="secondary">Featured</Badge>
        ) : null}
        {discountLabel ? <Badge>{discountLabel}</Badge> : null}
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <Card className="overflow-hidden">
          <div className="relative aspect-[16/10] max-h-[420px] bg-muted ring-1 ring-foreground/10">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              unoptimized={unoptimized}
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 66vw"
              priority
            />
            {usingPlaceholder ? (
              <>
                <div className="absolute inset-0 bg-black/25" aria-hidden />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-sm font-semibold text-white drop-shadow-sm">
                    Image coming soon
                  </p>
                </div>
              </>
            ) : null}
          </div>
          <CardHeader className="border-t">
            <CardTitle className="text-2xl">{product.name}</CardTitle>
            <CardDescription className="text-base">{product.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Product ID:</span>{" "}
              <span className="font-mono text-xs">{product.id}</span>
            </p>
            {product.category?.name ? (
              <p>
                <span className="font-medium text-foreground">Category:</span>{" "}
                {product.category.name}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <ProductPurchasePanel product={product} />
        </aside>
      </div>
    </PageContainer>
  )
}
