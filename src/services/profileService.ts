import { api } from "@/lib/api"
import type {
  UpdateProfileRequest,
  UpdateProfileResponse,
  User,
} from "@/types/auth"

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object"
}

function parseFetchProfileBody(raw: unknown): User {
  if (!isRecord(raw)) {
    throw new Error("Unexpected response from server.")
  }
  const data = raw.data
  if (!isRecord(data)) {
    const msg =
      typeof raw.message === "string" && raw.message.trim() !== ""
        ? raw.message.trim()
        : "Could not load profile."
    throw new Error(msg)
  }
  const u = data as Record<string, unknown>
  if (
    typeof u.id !== "number" ||
    typeof u.name !== "string" ||
    typeof u.email !== "string"
  ) {
    throw new Error("Invalid profile data returned.")
  }
  return data as User
}

const AUTH = { cookieAuth: true as const }

/**
 * GET /profile — authenticated profile (session cookie).
 * Response shape: `{ message, data: User }`.
 */
export async function getProfile(): Promise<User> {
  const raw = await api.get<unknown>("profile", AUTH)
  return parseFetchProfileBody(raw)
}

/**
 * PATCH /profile — update authenticated customer's profile.
 */
export async function updateProfile(
  body: UpdateProfileRequest
): Promise<UpdateProfileResponse> {
  return api.patchJson<UpdateProfileResponse>("profile", body, AUTH)
}
