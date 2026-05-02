import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { ZENMARKET_AUTH_COOKIE } from "@/lib/auth-cookie"
import { getApiBaseUrl } from "@/lib/api"
import type { User } from "@/types/auth"

type ProfileEnvelope = {
  message?: string
  data?: User
}

function isUserRecord(value: unknown): value is User {
  if (!value || typeof value !== "object") return false
  const u = value as Record<string, unknown>
  return (
    typeof u.id === "number" &&
    typeof u.name === "string" &&
    typeof u.email === "string"
  )
}

export async function GET() {
  const store = await cookies()
  const token = store.get(ZENMARKET_AUTH_COOKIE)?.value?.trim() ?? ""
  if (!token) {
    return NextResponse.json({ user: null as User | null })
  }

  let apiBase: string
  try {
    apiBase = getApiBaseUrl()
  } catch {
    return NextResponse.json({ user: null as User | null }, { status: 200 })
  }

  const res = await fetch(`${apiBase}/profile`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  const text = await res.text()
  if (!res.ok) {
    return NextResponse.json({ user: null as User | null })
  }

  let parsed: unknown
  try {
    parsed = text.trim() ? JSON.parse(text) : {}
  } catch {
    return NextResponse.json({ user: null as User | null })
  }

  const body = parsed as ProfileEnvelope
  const user = body.data
  if (!isUserRecord(user)) {
    return NextResponse.json({ user: null as User | null })
  }

  return NextResponse.json({ user })
}
