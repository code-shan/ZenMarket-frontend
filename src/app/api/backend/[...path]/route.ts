import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { ZENMARKET_AUTH_COOKIE } from "@/lib/auth-cookie"
import { getApiBaseUrl } from "@/lib/api"

function buildTargetUrl(apiBase: string, pathSegments: string[], search: string): string {
  const path = pathSegments.map((p) => encodeURIComponent(p)).join("/")
  return `${apiBase}/${path}${search ? `?${search}` : ""}`
}

async function proxy(request: Request, pathSegments: string[]) {
  const store = await cookies()
  const token = store.get(ZENMARKET_AUTH_COOKIE)?.value?.trim() ?? ""
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Authentication required." },
      { status: 401 }
    )
  }

  let apiBase: string
  try {
    apiBase = getApiBaseUrl()
  } catch {
    return NextResponse.json(
      { success: false, message: "API base URL is not configured." },
      { status: 500 }
    )
  }

  const url = new URL(request.url)
  const targetUrl = buildTargetUrl(apiBase, pathSegments, url.searchParams.toString())
  const method = request.method.toUpperCase()

  const headers = new Headers()
  headers.set("Accept", "application/json")
  headers.set("Authorization", `Bearer ${token}`)

  const contentType = request.headers.get("content-type")
  if (contentType && method !== "GET" && method !== "HEAD") {
    headers.set("Content-Type", contentType)
  }

  let body: BodyInit | undefined
  if (method !== "GET" && method !== "HEAD") {
    const buf = await request.arrayBuffer()
    if (buf.byteLength > 0) {
      body = buf
    }
  }

  const upstream = await fetch(targetUrl, {
    method,
    headers,
    body,
    cache: "no-store",
  })

  const responseText = await upstream.text()
  const upstreamCt =
    upstream.headers.get("content-type") ?? "application/json"

  return new NextResponse(responseText, {
    status: upstream.status,
    headers: {
      "Content-Type": upstreamCt,
    },
  })
}

type RouteCtx = { params: Promise<{ path: string[] }> }

export async function GET(request: Request, ctx: RouteCtx) {
  const { path } = await ctx.params
  return proxy(request, path ?? [])
}

export async function POST(request: Request, ctx: RouteCtx) {
  const { path } = await ctx.params
  return proxy(request, path ?? [])
}

export async function PATCH(request: Request, ctx: RouteCtx) {
  const { path } = await ctx.params
  return proxy(request, path ?? [])
}

export async function PUT(request: Request, ctx: RouteCtx) {
  const { path } = await ctx.params
  return proxy(request, path ?? [])
}

export async function DELETE(request: Request, ctx: RouteCtx) {
  const { path } = await ctx.params
  return proxy(request, path ?? [])
}
