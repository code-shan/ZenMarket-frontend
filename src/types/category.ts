/** Normalized category for storefront (featured list + paginated catalog). */
export type Category = {
  id: number
  name: string
  image_url?: string | null
  is_active: boolean
  is_featured: boolean
  /** Present on some API payloads (e.g. featured). */
  description?: string
}

export type PaginationMeta = {
  current_page: number
  total_pages: number
  per_page: number
  total: number
}

export type CategoriesApiResponse = {
  success: boolean
  message: string
  data: {
    items: unknown[]
    pagination: PaginationMeta
  }
}

export type CategoryQueryParams = {
  search?: string
  page?: number
  per_page?: number
}
