import { NextResponse } from "next/server"

import { ZENMARKET_AUTH_COOKIE } from "@/lib/auth-cookie"
import { getApiBaseUrl } from "@/lib/api"
import type { LoginRequest, LoginResponse, User } from "@/types/auth"

function isProd(): boolean {
  return process.env.NODE_ENV === "production"
}

export async function POST(request: Request) {
  let body: LoginRequest
  try {
    body = (await request.json()) as LoginRequest
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 })
  }

  let apiBase: string
  try {
    apiBase = getApiBaseUrl()
  } catch {
    return NextResponse.json(
      { message: "API base URL is not configured." },
      { status: 500 }
    )
  }

  const upstream = await fetch(`${apiBase}/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  const text = await upstream.text()
  let parsed: unknown
  try {
    parsed = text.trim() ? JSON.parse(text) : {}
  } catch {
    return NextResponse.json(
      { message: "Invalid response from authentication server." },
      { status: 502 }
    )
  }

  const json = parsed as LoginResponse

  if (!upstream.ok || !json.success) {
    return NextResponse.json(json, { status: upstream.status })
  }

  const payload = json.data
  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      { success: false, message: "Login response missing data." },
      { status: 502 }
    )
  }

  const tokenRaw = (payload as { token?: string }).token
  const token = typeof tokenRaw === "string" ? tokenRaw.trim() : ""

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Login response missing token." },
      { status: 502 }
    )
  }

  const user = (payload as { user?: User }).user
  if (
    !user ||
    typeof user.id !== "number" ||
    typeof user.name !== "string" ||
    typeof user.email !== "string"
  ) {
    return NextResponse.json(
      { success: false, message: "Login response missing user." },
      { status: 502 }
    )
  }

  const response = NextResponse.json({
    success: true as const,
    message: typeof json.message === "string" ? json.message : "Logged in.",
    user,
  })

  response.cookies.set({
    name: ZENMARKET_AUTH_COOKIE,
    value: token,
    httpOnly: true,
    secure: isProd(),
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  return response
}
