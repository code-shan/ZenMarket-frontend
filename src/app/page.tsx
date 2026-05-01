import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"
import { Suspense } from "react"
import type { LucideIcon } from "lucide-react"
import {
  BadgeCheckIcon,
  CheckCircle2Icon,
  HeadphonesIcon,
  PackageIcon,
  ShieldCheckIcon,
  TruckIcon,
  Undo2Icon,
  WalletCardsIcon,
} from "lucide-react"

import { CategoryCard } from "@/components/categories/CategoryCard"
import { ProductCard } from "@/components/products/ProductCard"
import { PageContainer } from "@/components/layout/PageContainer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getFeaturedCategories } from "@/services/categoryService"
import { getFeaturedProducts } from "@/services/productService"

export const metadata: Metadata = {
  title: "Home",
  description:
    "Shop everyday essentials with confidence — Cash on Delivery checkout at ZenMarket.",
}

export const dynamic = "force-dynamic"

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1400&q=85"

const TRUST_ITEMS = [
  {
    title: "Cash on Delivery",
    description: "Pay only when your order arrives at your door.",
    icon: WalletCardsIcon,
  },
  {
    title: "Quality products",
    description: "Carefully sourced items from trusted suppliers.",
    icon: BadgeCheckIcon,
  },
  {
    title: "Easy returns",
    description: "Simple policies when something isn’t quite right.",
    icon: Undo2Icon,
  },
  {
    title: "Friendly support",
    description: "We’re here to help before and after your purchase.",
    icon: HeadphonesIcon,
  },
] as const

function SectionMessage({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-2xl border border-border/60 bg-muted/30 p-8 text-center"
      role="status"
    >
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  )
}

function TrustHighlightCard({
  title,
  description,
  icon: Icon,
}: {
  title: string
  description: string
  icon: LucideIcon
}) {
  return (
    <Card className="border-border/80 shadow-sm transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  )
}

function FeaturedCategoriesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm"
        >
          <Skeleton className="h-44 w-full rounded-none" />
          <div className="space-y-2 p-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

async function FeaturedCategoriesGrid() {
  try {
    const categories = await getFeaturedCategories()

    if (!categories.length) {
      return (
        <SectionMessage>
          No featured categories available at the moment.
        </SectionMessage>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    )
  } catch {
    return (
      <SectionMessage>
        Failed to load categories. Please try again later.
      </SectionMessage>
    )
  }
}

function FeaturedProductsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm"
        >
          <Skeleton className="aspect-square w-full rounded-none rounded-t-xl" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-28" />
          </div>
          <div className="mt-auto flex gap-2 border-t bg-muted/30 p-4">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

async function FeaturedProductsGrid() {
  try {
    const products = await getFeaturedProducts()

    if (!products.length) {
      return (
        <SectionMessage>
          No featured products available at the moment.
        </SectionMessage>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    )
  } catch {
    return (
      <SectionMessage>
        Failed to load featured products. Please try again later.
      </SectionMessage>
    )
  }
}

export default function Home() {
  return (
    <>
      <section
        className="border-b border-border/60 bg-gradient-to-b from-muted/40 to-background py-16 md:py-20 lg:py-24"
        aria-labelledby="hero-heading"
      >
        <PageContainer>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="space-y-6">
              <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-medium">
                New arrivals are here
              </Badge>
              <h1
                id="hero-heading"
                className="font-heading text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl lg:leading-[1.1]"
              >
                Shop everyday essentials with confidence
              </h1>
              <p className="max-w-xl text-pretty text-base text-muted-foreground md:text-lg">
                Explore quality products across electronics, fashion, home, lifestyle,
                and more — with simple Cash on Delivery checkout.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button nativeButton={false} render={<Link href="/products" />} size="lg">
                  Shop Products
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  nativeButton={false}
                  render={<Link href="/#shop-by-category" />}
                >
                  Shop by category
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  Cash on Delivery
                </Badge>
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  Fast local delivery
                </Badge>
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  Quality checked
                </Badge>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="relative overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/5 dark:ring-white/10">
                <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/3]">
                  <Image
                    src={HERO_IMAGE}
                    alt="Shopping and lifestyle products"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="pointer-events-none absolute -bottom-4 -left-4 hidden rounded-2xl border bg-background/95 p-4 shadow-lg backdrop-blur-sm sm:block lg:-bottom-6 lg:-left-6">
                <p className="text-xs font-medium text-muted-foreground">This week</p>
                <p className="font-heading text-lg font-semibold">Fresh picks in stock</p>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="border-y border-border/40 bg-muted/25 py-16 md:py-20">
        <PageContainer>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_ITEMS.map((item) => (
              <TrustHighlightCard key={item.title} {...item} />
            ))}
          </div>
        </PageContainer>
      </section>

      <section
        id="shop-by-category"
        className="scroll-mt-28 py-16 md:py-20"
        aria-labelledby="categories-heading"
      >
        <PageContainer className="space-y-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="categories-heading"
              className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              Shop by Category
            </h2>
            <p className="mt-3 text-muted-foreground md:text-lg">
              Find what you need faster through our featured categories.
            </p>
          </div>
          <Suspense fallback={<FeaturedCategoriesSkeleton />}>
            <FeaturedCategoriesGrid />
          </Suspense>
        </PageContainer>
      </section>

      <section
        className="border-t border-border/40 bg-muted/20 py-16 md:py-20"
        aria-labelledby="featured-products-heading"
      >
        <PageContainer className="space-y-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <h2
                id="featured-products-heading"
                className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                Featured Products
              </h2>
              <p className="mt-3 text-muted-foreground md:text-lg">
                Handpicked products customers are loving right now.
              </p>
            </div>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/products" />}
              aria-label="View all products in catalog"
            >
              View All Products
            </Button>
          </div>
          <Suspense fallback={<FeaturedProductsSkeleton />}>
            <FeaturedProductsGrid />
          </Suspense>
        </PageContainer>
      </section>

      <section className="py-16 md:py-20">
        <PageContainer>
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-muted/40 to-muted/60 px-6 py-14 shadow-sm md:px-12 md:py-16 lg:px-16">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="space-y-4">
                <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-background/80 shadow-sm ring-1 ring-border/80">
                  <TruckIcon className="size-6 text-primary" aria-hidden />
                </div>
                <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                  Simple checkout. Pay when you receive.
                </h2>
                <p className="max-w-xl text-muted-foreground md:text-lg">
                  ZenMarket supports Cash on Delivery so customers can shop with confidence.
                </p>
                <Button size="lg" nativeButton={false} render={<Link href="/products" />}>
                  Start Shopping
                </Button>
              </div>
              <div className="hidden lg:flex lg:justify-end">
                <div className="flex gap-3 rounded-2xl bg-background/70 p-6 shadow-md ring-1 ring-border/80 backdrop-blur-sm">
                  <PackageIcon className="size-14 text-primary/90" aria-hidden />
                  <ShieldCheckIcon className="size-14 text-muted-foreground/80" aria-hidden />
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      <section
        id="about"
        className="scroll-mt-28 py-16 md:py-20"
        aria-labelledby="about-heading"
      >
        <PageContainer>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 lg:items-center">
            <div className="space-y-5">
              <h2
                id="about-heading"
                className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                Why customers choose ZenMarket
              </h2>
              <p className="text-muted-foreground md:text-lg leading-relaxed">
                ZenMarket is designed to make online shopping simple, clear, and trustworthy.
                Customers can browse products, compare details, add items to cart, and complete
                orders with Cash on Delivery.
              </p>
            </div>
            <Card className="border-border/80 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">What you can expect</CardTitle>
                <CardDescription>Built around clarity and convenience.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  "Clear product information",
                  "Smooth cart and checkout flow",
                  "Safe Cash on Delivery purchasing",
                ].map((line) => (
                  <div key={line} className="flex gap-3 text-sm md:text-base">
                    <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                    <span>{line}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </PageContainer>
      </section>

      <section className="border-t border-border/60 bg-muted/30 py-16 md:py-20">
        <PageContainer>
          <div className="mx-auto max-w-3xl rounded-3xl border border-border/60 bg-background px-6 py-12 text-center shadow-sm md:px-12 md:py-14">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
              Ready to find your next favorite product?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground md:text-lg">
              Browse our catalog or jump straight to your cart when you are ready to order.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" nativeButton={false} render={<Link href="/products" />}>
                Browse Products
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href="/cart" />}
              >
                Go to Cart
              </Button>
            </div>
          </div>
        </PageContainer>
      </section>
    </>
  )
}
