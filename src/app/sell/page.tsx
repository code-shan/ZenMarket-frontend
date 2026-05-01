import type { Metadata } from "next"

import { PageContainer } from "@/components/layout/PageContainer"

export const metadata: Metadata = {
  title: "Sell",
  description: "List an item on ZenMarket.",
}

export default function SellPage() {
  return (
    <PageContainer className="py-12">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Sell an item</h1>
      <p className="mt-2 text-muted-foreground">
        Listing flow will live here — wire forms and uploads when your backend is ready.
      </p>
    </PageContainer>
  )
}
