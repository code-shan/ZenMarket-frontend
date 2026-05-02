"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { PageContainer } from "@/components/layout/PageContainer"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function formatRs(value: string | null): string {
  if (!value?.trim()) return "—"
  const n = Number.parseFloat(value)
  const safe = Number.isFinite(n) ? n : 0
  return `Rs. ${safe.toFixed(2)}`
}

export function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("order")?.trim() ?? ""
  const total = searchParams.get("total")?.trim() ?? ""

  return (
    <PageContainer className="py-12 sm:py-16">
      <Card className="mx-auto max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl sm:text-2xl">
            Order placed successfully!
          </CardTitle>
          <CardDescription>
            Thank you. We’ve received your Cash on Delivery order.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center text-sm">
          {orderNumber ? (
            <div>
              <p className="text-muted-foreground">Order number</p>
              <p className="font-mono text-base font-semibold tracking-tight text-foreground">
                {orderNumber}
              </p>
            </div>
          ) : null}
          <div>
            <p className="text-muted-foreground">Total amount</p>
            <p className="text-lg font-semibold tabular-nums text-foreground">
              {formatRs(total)}
            </p>
          </div>
          {!orderNumber && !total ? (
            <p className="text-muted-foreground">
              Your order was placed. You can continue shopping or open your cart
              from the header.
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            className="w-full sm:w-auto"
            nativeButton={false}
            render={<Link href="/products" />}
          >
            Continue shopping
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            nativeButton={false}
            render={<Link href="/" />}
          >
            Back to home
          </Button>
        </CardFooter>
      </Card>
    </PageContainer>
  )
}
