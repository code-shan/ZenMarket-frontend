import { NextResponse } from "next/server"

import { ZENMARKET_AUTH_COOKIE } from "@/lib/auth-cookie"

function isProd(): boolean {
  return process.env.NODE_ENV === "production"
}

export async function POST() {
  const res = NextResponse.json({ success: true, message: "Logged out." })
  res.cookies.set({
    name: ZENMARKET_AUTH_COOKIE,
    value: "",
    httpOnly: true,
    secure: isProd(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
  return res
}
