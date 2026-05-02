import { api } from "@/lib/api"
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  Order,
  OrderPaginationMeta,
  OrderQueryParams,
} from "@/types/order"

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object"
}

function parseOrdersListEnvelope(raw: unknown): {
  items: Order[]
  pagination: OrderPaginationMeta
} {
  if (!isRecord(raw)) {
    throw new Error("Unexpected response from server.")
  }

  if (raw.success !== true) {
    const msg =
      typeof raw.message === "string" && raw.message.trim() !== ""
        ? raw.message.trim()
        : "Request failed."
    throw new Error(msg)
  }

  const data = raw.data
  if (!isRecord(data)) {
    throw new Error("Orders data is missing.")
  }

  const items = data.items
  const pagination = data.pagination
  if (!Array.isArray(items) || !isRecord(pagination)) {
    throw new Error("Invalid orders response.")
  }

  return {
    items: items as Order[],
    pagination: pagination as OrderPaginationMeta,
  }
}

function parseSingleOrderEnvelope(raw: unknown): Order {
  if (!isRecord(raw)) {
    throw new Error("Unexpected response from server.")
  }

  if (raw.success !== true) {
    const msg =
      typeof raw.message === "string" && raw.message.trim() !== ""
        ? raw.message.trim()
        : "Request failed."
    throw new Error(msg)
  }

  const data = raw.data
  if (!isRecord(data)) {
    throw new Error("Order data is missing.")
  }

  return data as Order
}

const AUTH = { cookieAuth: true as const }

/**
 * Place order (COD). POST /orders with session cookie.
 * Throws `Error` with API message on failure (empty cart, stock, validation, etc.).
 */
export async function createOrder(
  payload: CreateOrderRequest
): Promise<Order> {
  const raw = await api.post<CreateOrderResponse>("orders", payload, AUTH)

  if (!raw || typeof raw !== "object") {
    throw new Error("Failed to place order. Please try again.")
  }

  const message =
    typeof (raw as CreateOrderResponse).message === "string"
      ? (raw as CreateOrderResponse).message.trim()
      : ""
  const data = (raw as CreateOrderResponse).data

  if (!data || typeof data !== "object") {
    throw new Error(
      message || "Failed to place order. Please try again."
    )
  }

  const placed = data as Order
  if (!placed.transaction || typeof placed.transaction !== "object") {
    return {
      ...placed,
      transaction: {
        payment_type: "cod",
        status: "pending",
        amount: placed.total,
        currency: "LKR",
      },
    }
  }
  return placed
}

/**
 * GET /orders?page=&per_page=
 */
export async function getOrders(
  params?: OrderQueryParams
): Promise<{
  items: Order[]
  pagination: OrderPaginationMeta
}> {
  const page = params?.page ?? 1
  const perPage = params?.per_page ?? 10
  const qs = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  })
  const raw = await api.get<unknown>(`orders?${qs.toString()}`, AUTH)
  return parseOrdersListEnvelope(raw)
}

/**
 * GET /orders/{id}
 */
export async function getOrderById(id: number | string): Promise<Order> {
  const path = `orders/${encodeURIComponent(String(id))}`
  const raw = await api.get<unknown>(path, AUTH)
  return parseSingleOrderEnvelope(raw)
}

export function orderClientErrorMessage(
  err: unknown,
  fallback = "Failed to place order. Please try again."
): string {
  if (err instanceof Error) {
    const m = err.message.trim()
    if (m) return m
  }
  return fallback
}
