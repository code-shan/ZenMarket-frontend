import type { Product } from "@/types/product"

export function formatUsdPrice(value: string | number): string {
  const n = typeof value === "string" ? Number.parseFloat(value) : value
  const safe = Number.isFinite(n) ? n : 0
  return `$${safe.toFixed(2)}`
}

export function getProductDiscountLabel(
  product: Pick<Product, "discount_type" | "discount_value">
): string | null {
  const { discount_type, discount_value } = product
  const raw = typeof discount_value === "string" ? discount_value.trim() : ""
  if (!raw || (discount_type !== "percentage" && discount_type !== "fixed")) {
    return null
  }
  if (discount_type === "percentage") return `${raw}% OFF`
  return `$${Number.parseFloat(raw).toFixed(2)} OFF`
}
