import { api, getApiBaseUrl } from "@/lib/api"
import type {
  CategoriesApiResponse,
  Category,
  CategoryQueryParams,
  PaginationMeta,
} from "@/types/category"

const nonEmptyString = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed === "" ? undefined : trimmed
}

const toAbsoluteUrl = (maybeUrl: string): string => {
  if (/^https?:\/\//i.test(maybeUrl)) return maybeUrl

  const base = getApiBaseUrl()
  const origin = new URL(base).origin
  if (maybeUrl.startsWith("/")) return `${origin}${maybeUrl}`
  return `${origin}/${maybeUrl}`
}

function idToNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const n = Number.parseInt(value, 10)
    return Number.isFinite(n) ? n : undefined
  }
  return undefined
}

export function normalizeCategory(raw: unknown): Category | null {
  if (!raw || typeof raw !== "object") return null
  const obj = raw as Record<string, unknown>

  const id =
    idToNumber(obj.id) ??
    idToNumber(obj.category_id)
  const name =
    nonEmptyString(obj.name) ??
    nonEmptyString(obj.title) ??
    nonEmptyString(obj.category_name)
  if (id == null || !name) return null

  const description = nonEmptyString(obj.description)

  const rawImage =
    nonEmptyString(obj.image_url) ??
    nonEmptyString(obj.imageUrl) ??
    nonEmptyString(obj.image) ??
    null

  const image_url = rawImage ? toAbsoluteUrl(rawImage) : null

  const is_featured =
    typeof obj.isFeatured === "boolean"
      ? obj.isFeatured
      : typeof obj.is_featured === "boolean"
        ? obj.is_featured
        : false

  const is_active =
    typeof obj.isActive === "boolean"
      ? obj.isActive
      : typeof obj.is_active === "boolean"
        ? obj.is_active
        : true

  return {
    id,
    name,
    image_url,
    is_active,
    is_featured,
    ...(description ? { description } : {}),
  }
}

function normalizeCategoryList(list: unknown[]): Category[] {
  return list.map(normalizeCategory).filter(Boolean) as Category[]
}

/**
 * Resolves a categories list from typical Laravel-style envelopes:
 * `{ data: [...] }`, `{ data: { items: [...] } }`, `{ items: [...] }`, etc.
 */
function extractCategoryList(payload: unknown): unknown[] | null {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== "object") return null

  const root = payload as Record<string, unknown>

  if (root.success === false) return null

  const topLevel = [
    root.items,
    root.categories,
    root.result,
    root.content,
    root.data,
  ]
  for (const candidate of topLevel) {
    if (Array.isArray(candidate)) return candidate
  }

  const data = root.data
  if (data && typeof data === "object") {
    const inner = data as Record<string, unknown>
    const nested = [
      inner.items,
      inner.categories,
      inner.data,
      inner.results,
      inner.content,
    ]
    for (const candidate of nested) {
      if (Array.isArray(candidate)) return candidate
    }
  }

  return null
}

export async function getFeaturedCategories(): Promise<Category[]> {
  const raw = await api.get<unknown>("/categories?featured=true")

  const list = extractCategoryList(raw)
  if (!list?.length) {
    return []
  }

  return normalizeCategoryList(list)
}

function assertPagination(raw: unknown): PaginationMeta {
  if (!raw || typeof raw !== "object") {
    throw new Error("Categories response missing pagination")
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
    throw new Error("Categories response has invalid pagination")
  }
  return { current_page, total_pages, per_page, total }
}

export async function getCategories(
  params: CategoryQueryParams = {}
): Promise<{ items: Category[]; pagination: PaginationMeta }> {
  const query = new URLSearchParams()
  const page = params.page ?? 1
  const per_page = params.per_page ?? 8

  query.set("page", String(page))
  query.set("per_page", String(per_page))

  const search = params.search?.trim()
  if (search) {
    query.set("search", search)
  }

  const response = await api.get<CategoriesApiResponse>(
    `categories?${query.toString()}`
  )

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch categories")
  }

  const payload = response.data
  if (!payload || typeof payload !== "object") {
    throw new Error("Categories response missing data")
  }

  const rawItems = payload.items
  if (!Array.isArray(rawItems)) {
    throw new Error("Categories response missing items")
  }

  const pagination = assertPagination(payload.pagination)
  const items = normalizeCategoryList(rawItems)

  return { items, pagination }
}
