import { LayoutGridIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ProductEmptyState() {
  return (
    <Alert className="border-dashed">
      <LayoutGridIcon />
      <AlertTitle>No listings yet</AlertTitle>
      <AlertDescription>
        When your backend returns products, they will appear here. Until then,
        this grid stays intentionally empty.
      </AlertDescription>
    </Alert>
  )
}
