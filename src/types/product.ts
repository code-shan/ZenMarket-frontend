export type DiscountType = "percentage" | "fixed" | null

export type ProductCategory = {
  id: number
  name: string
  image_url?: string | null
}

export type Product = {
  id: number
  name: string
  description: string
  price: string
  discount_type?: DiscountType
  discount_value?: string | null
  final_price: string
  image_url?: string | null
  is_featured: boolean
  /** When true, product cannot be purchased. */
  is_out_of_stock: boolean
  category?: ProductCategory | null
  created_at: string
}

export type ProductPaginationMeta = {
  current_page: number
  total_pages: number
  per_page: number
  total: number
}

/** Paginated catalog list (`GET /products`). */
export type ProductsApiResponse = {
  success: boolean
  message: string
  data: {
    items: unknown[]
    pagination: ProductPaginationMeta
  }
}

/** Featured products envelope (pagination often omitted). */
export type FeaturedProductsApiResponse = {
  success: boolean
  message: string
  data: {
    items: unknown[]
    pagination?: ProductPaginationMeta
  }
}

export type ProductSort =
  | "newest"
  | "price_low_to_high"
  | "price_high_to_low"

export type ProductQueryParams = {
  search?: string
  category_id?: number | string
  min_price?: number | string
  max_price?: number | string
  sort?: ProductSort
  per_page?: number
  page?: number
}

/** Single-product envelope (common with Laravel-style APIs). */
export type ProductDetailApiResponse = {
  success: boolean
  message?: string
  data: Product
}
