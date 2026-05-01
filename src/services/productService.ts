import { api, getApiBaseUrl } from "@/lib/api"
import type {
  FeaturedProductsApiResponse,
  Product,
  ProductPaginationMeta,
  ProductQueryParams,
  ProductsApiResponse,
} from "@/types/product"

function resolveMediaUrl(url: string | null | undefined): string | null {
  const s = typeof url === "string" ? url.trim() : ""
  if (!s) return null
  if (/^https?:\/\//i.test(s)) return s
  const origin = new URL(getApiBaseUrl()).origin
  return s.startsWith("/") ? `${origin}${s}` : `${origin}/${s}`
}

function normalizeProduct(p: Product): Product {
  const id =
    typeof p.id === "number" && Number.isFinite(p.id)
      ? p.id
      : Number.parseInt(String(p.id), 10)

  return {
    ...p,
    id,
    image_url: resolveMediaUrl(p.image_url),
    category: p.category
      ? {
          ...p.category,
          image_url: resolveMediaUrl(p.category.image_url),
        }
      : p.category,
  }
}

function isProductShape(value: unknown): value is Product {
  if (!value || typeof value !== "object") return false
  const p = value as Record<string, unknown>
  const idOk =
    (typeof p.id === "number" && Number.isFinite(p.id)) ||
    (typeof p.id === "string" && Number.isFinite(Number.parseInt(p.id, 10)))
  return idOk && typeof p.name === "string"
}

function extractProductPayload(raw: unknown): Product | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>

  if (isProductShape(o)) {
    return normalizeProduct(o)
  }

  if (o.success === true && o.data && typeof o.data === "object") {
    const data = o.data as Record<string, unknown>
    if (isProductShape(data)) {
      return normalizeProduct(data)
    }
    const nested = data.item ?? data.product
    if (isProductShape(nested)) {
      return normalizeProduct(nested)
    }
  }

  return null
}

function idToNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const n = Number.parseInt(value, 10)
    return Number.isFinite(n) ? n : undefined
  }
  return undefined
}

function assertPagination(raw: unknown): ProductPaginationMeta {
  if (!raw || typeof raw !== "object") {
    throw new Error("Products response missing pagination")
  }
  const p = raw as Record<string, unknown>
  const current_page = idToNumber(p.current_page)
  const total_pages = idToNumber(p.total_pages)
  const per_page = idToNumber(p.per_page)
  const total = idToNumber(p.total)
  if (
    current_page == null ||
    total_pages == null ||
    per_page == null ||
    total == null
  ) {
    throw new Error("Products response has invalid pagination")
  }
  return { current_page, total_pages, per_page, total }
}

function normalizeProductList(list: unknown[]): Product[] {
  return list
    .map((raw) => {
      if (!isProductShape(raw)) return null
      return normalizeProduct(raw)
    })
    .filter(Boolean) as Product[]
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const response = await api.get<FeaturedProductsApiResponse>(
    "products?featured=true"
  )

  if (!response.success || !response.data?.items || !Array.isArray(response.data.items)) {
    return []
  }

  return normalizeProductList(response.data.items)
}

export async function getProducts(
  params: ProductQueryParams = {}
): Promise<{ items: Product[]; pagination: ProductPaginationMeta }> {
  const query = new URLSearchParams()
  const page = params.page ?? 1
  const per_page = params.per_page ?? 12
  const sort = params.sort ?? "newest"

  query.set("page", String(page))
  query.set("per_page", String(per_page))
  query.set("sort", sort)

  const search = params.search?.trim()
  if (search) query.set("search", search)

  const cat = params.category_id
  if (cat != null && String(cat).trim() !== "") {
    query.set("category_id", String(cat).trim())
  }

  const minP = params.min_price
  if (minP != null && String(minP).trim() !== "") {
    query.set("min_price", String(minP).trim())
  }

  const maxP = params.max_price
  if (maxP != null && String(maxP).trim() !== "") {
    query.set("max_price", String(maxP).trim())
  }

  const response = await api.get<ProductsApiResponse>(
    `products?${query.toString()}`
  )

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch products")
  }

  const payload = response.data
  if (!payload || typeof payload !== "object") {
    throw new Error("Products response missing data")
  }

  const rawItems = payload.items
  if (!Array.isArray(rawItems)) {
    throw new Error("Products response missing items")
  }

  const pagination = assertPagination(payload.pagination)
  const items = normalizeProductList(rawItems)

  return { items, pagination }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const raw = await api.get<unknown>(
      `products/${encodeURIComponent(id)}`
    )
    return extractProductPayload(raw)
  } catch {
    return null
  }
}
