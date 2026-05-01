import { api } from "@/lib/api"
import { getAuthToken } from "@/lib/auth"
import type { UpdateProfileRequest, UpdateProfileResponse } from "@/types/auth"

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
