export type User = {
  id: number
  name: string
  email: string
  role?: string
  phone?: string | null
  address?: string | null
  email_verified_at?: string | null
  profile_completed_at?: string | null
}

export type LoginRequest = {
  email: string
  password: string
}

export type LoginSuccessResponse = {
  success: true
  message: string
  data: {
    token: string
    user: User
  }
}

export type ApiFieldErrors = Record<string, string[]>

export type LoginErrorResponse = {
  success: false
  message: string
  errors?: ApiFieldErrors
}

export type LoginResponse = LoginSuccessResponse | LoginErrorResponse

export type RegisterRequest = {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export type VerifyEmailRequest = {
  email: string
  otp: string
}

export type ResendOtpRequest = {
  email: string
}

export type BasicSuccessResponse = {
  success: true
  message: string
  data: null
}

export type BasicErrorResponse = {
  success: false
  message: string
  errors?: ApiFieldErrors
}

export type BasicApiResponse = BasicSuccessResponse | BasicErrorResponse

export type UpdateProfileRequest = {
  name: string
  phone: string
  address: string
}

export type UpdateProfileResponse = {
  message: string
  data: User
}

/** GET /profile — `{ message, data: User }` (no `success` flag). */
export type FetchProfileResponse = {
  message: string
  data: User
}
