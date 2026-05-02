import { Suspense } from "react"

import { OrderSuccessContent } from "./OrderSuccessContent"

function OrderSuccessFallback() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-muted-foreground">
      Loading…
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<OrderSuccessFallback />}>
      <OrderSuccessContent />
    </Suspense>
  )
}
