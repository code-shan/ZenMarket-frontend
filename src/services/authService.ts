import { api } from "@/lib/api"
import type { LoginRequest, LoginResponse } from "@/types/auth"

function isLoginResponse(value: unknown): value is LoginResponse {
  if (!value || typeof value !== "object") return false
  const o = value as Record<string, unknown>
  return typeof o.success === "boolean"
}

export async function loginUser(payload: LoginRequest): Promise<LoginResponse> {
  try {
    const raw = await api.postJson("auth/login", payload)
    if (!isLoginResponse(raw)) {
      throw new Error("Something went wrong. Please try again.")
    }
    return raw
  } catch (e) {
    if (e instanceof Error && e.message) {
      throw e
    }
    throw new Error("Something went wrong. Please try again.")
  }
}
