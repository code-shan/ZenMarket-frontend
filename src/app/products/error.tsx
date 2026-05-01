"use client"

import Link from "next/link"

import { PageContainer } from "@/components/layout/PageContainer"
import { Button } from "@/components/ui/button"

export default function ProductsError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="min-h-[50vh] py-16 md:py-24">
      <PageContainer className="mx-auto max-w-lg rounded-2xl border border-border/60 bg-muted/20 px-6 py-12 text-center shadow-sm">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-3 text-muted-foreground">
          Failed to load products. Please try again.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button type="button" onClick={reset}>
            Try again
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
            Go home
          </Button>
        </div>
      </PageContainer>
    </main>
  )
}
