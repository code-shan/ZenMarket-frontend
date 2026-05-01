import { api } from "@/lib/api"
import type {
  BasicApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResendOtpRequest,
  VerifyEmailRequest,
} from "@/types/auth"

function isLoginResponse(value: unknown): value is LoginResponse {
  if (!value || typeof value !== "object") return false
  const o = value as Record<string, unknown>
  return typeof o.success === "boolean"
}

function isBasicApiResponse(value: unknown): value is BasicApiResponse {
  if (!value || typeof value !== "object") return false
  const o = value as Record<string, unknown>
  if (typeof o.success !== "boolean" || typeof o.message !== "string") {
    return false
  }
  if (o.success === true) {
    return o.data === null || o.data === undefined
  }
  return true
}

async function postAuthBasic(path: string, body: unknown): Promise<BasicApiResponse> {
  try {
    const raw = await api.postJson(path, body)
    if (!isBasicApiResponse(raw)) {
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

export async function registerUser(
  payload: RegisterRequest
): Promise<BasicApiResponse> {
  return postAuthBasic("auth/register", payload)
}

export async function verifyEmail(
  payload: VerifyEmailRequest
): Promise<BasicApiResponse> {
  return postAuthBasic("auth/verify-email", payload)
}

export async function resendOtp(
  payload: ResendOtpRequest
): Promise<BasicApiResponse> {
  return postAuthBasic("auth/resend-otp", payload)
}
