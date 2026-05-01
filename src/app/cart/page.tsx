"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { PageContainer } from "@/components/layout/PageContainer"
import { AUTH_CHANGED_EVENT, isAuthenticated } from "@/lib/auth"

type CartGate = "pending" | "guest" | "member"

export default function CartPage() {
  const router = useRouter()
  const [gate, setGate] = useState<CartGate>("pending")

  useEffect(() => {
    function sync() {
      if (!isAuthenticated()) {
        setGate("guest")
        router.replace("/login?redirect=/cart")
        return
      }
      setGate("member")
    }
    sync()
    window.addEventListener(AUTH_CHANGED_EVENT, sync)
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, sync)
  }, [router])

  if (gate === "pending") {
    return (
      <PageContainer className="py-12">
        <p className="text-muted-foreground">Loading your cart…</p>
      </PageContainer>
    )
  }

  if (gate === "guest") {
    return (
      <PageContainer className="py-12">
        <p className="text-muted-foreground">
          Please log in to view your cart. Redirecting…
        </p>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="py-12">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Cart</h1>
      <p className="mt-2 text-muted-foreground">
        Cart state and checkout will plug in here later.
      </p>
    </PageContainer>
  )
}
