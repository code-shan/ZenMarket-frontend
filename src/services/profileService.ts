import { api } from "@/lib/api"
import { getAuthToken } from "@/lib/auth"
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

/**
 * GET /profile — authenticated profile (Bearer token).
 * Response shape: `{ message, data: User }`.
 */
export async function getProfile(): Promise<User> {
  const token = getAuthToken()
  if (!token) {
    throw new Error("You must be logged in to view your profile.")
  }
  const raw = await api.get<unknown>("profile", { token })
  return parseFetchProfileBody(raw)
}

/**
 * PATCH /profile — update authenticated customer's profile.
 */
export async function updateProfile(
  body: UpdateProfileRequest
): Promise<UpdateProfileResponse> {
  const token = getAuthToken()
  if (!token) {
    throw new Error("You must be logged in to update your profile.")
  }
  return api.patchJson<UpdateProfileResponse>("profile", body, { token })
}
