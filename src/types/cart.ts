export type CartDiscountType = "percentage" | "fixed" | null

export type CartProductStatus = "AVAILABLE" | "SOLD" | string

export type CartItem = {
  product_id: number
  name: string
  image_url?: string | null
  price: string
  discount_type?: CartDiscountType
  discount_value?: string | null
  final_price: string
  quantity: number
  line_total: string
  product_is_active: boolean
  category_is_active: boolean
  product_status: CartProductStatus
}

export type CartData = {
  items_count: number
  subtotal: string
  total: string
  items: CartItem[]
}

/** Laravel-style validation map sometimes returned with `success: false`. */
export type CartApiFieldErrors = Record<string, string[]>

export type CartApiResponse = {
  success: boolean
  message: string
  data: CartData
  errors?: CartApiFieldErrors
}

export type ClearCartApiResponse = {
  success: boolean
  message: string
  data: null
}

export type AddCartItemRequest = {
  product_id: number
  quantity: number
}
