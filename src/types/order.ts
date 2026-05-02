export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"

export type PaymentType = "cod" | string

export type TransactionStatus = "pending" | "paid" | "failed" | "cancelled" | string

export type OrderTransaction = {
  payment_type: PaymentType
  status: TransactionStatus
  amount: string
  currency: string
  transaction_reference?: string | null
  provider?: string | null
  paid_at?: string | null
}

export type OrderItem = {
  product_id: number
  product_name: string
  product_image_url?: string | null
  category_name: string
  unit_price: string
  discount_type?: "percentage" | "fixed" | null
  discount_value?: string | null
  final_unit_price: string
  quantity: number
  line_total: string
}

export type Order = {
  id: number
  order_number: string
  status: OrderStatus
  customer_name: string
  customer_email: string
  customer_contact: string
  shipping_address: string
  subtotal: string
  discount_total: string
  total: string
  items_count: number
  items: OrderItem[]
  transaction: OrderTransaction
}

export type OrderPaginationMeta = {
  current_page: number
  total_pages: number
  per_page: number
  total: number
}

export type OrdersApiResponse = {
  success: boolean
  message: string
  data: {
    items: Order[]
    pagination: OrderPaginationMeta
  }
}

export type SingleOrderApiResponse = {
  success: boolean
  message: string
  data: Order
}

export type OrderQueryParams = {
  page?: number
  per_page?: number
}

export type CreateOrderRequest = {
  customer_name: string
  customer_email: string
  customer_contact: string
  shipping_address: string
  payment_type: "cod"
}

export type CreateOrderResponse = {
  message: string
  data: Order
}
