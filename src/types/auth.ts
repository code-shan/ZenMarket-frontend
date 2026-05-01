export type User = {
  id: number
  name: string
  email: string
  role: string
  email_verified_at?: string | null
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

export type LoginErrorResponse = {
  success: false
  message: string
  errors?: Record<string, string[]>
}

export type LoginResponse = LoginSuccessResponse | LoginErrorResponse
