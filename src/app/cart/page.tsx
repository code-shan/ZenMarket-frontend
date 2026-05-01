import type { Metadata } from "next"

import { PageContainer } from "@/components/layout/PageContainer"

export const metadata: Metadata = {
  title: "Cart",
  description: "Your ZenMarket cart.",
}

export default function CartPage() {
  return (
    <PageContainer className="py-12">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Cart</h1>
      <p className="mt-2 text-muted-foreground">
        Cart state and checkout will plug in here later.
      </p>
    </PageContainer>
  )
}
