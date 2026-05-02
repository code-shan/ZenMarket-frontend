function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL
  if (!raw || raw.trim() === "") {
    throw new Error("API base URL is not defined")
  }
  return raw.replace(/\/+$/, "")
}

function apiUrl(path: string): string {
  const base = getApiBaseUrl()
  const normalized = path.startsWith("/") ? path.slice(1) : path
  return `${base}/${normalized}`
}

function isBrowser(): boolean {
  return typeof window !== "undefined"
}

/** Same-origin proxy — attaches Bearer from HttpOnly cookie on the server */
function backendProxyUrl(path: string): string {
  const normalized = path.startsWith("/") ? path.slice(1) : path
  return `/api/backend/${normalized}`
}

export type CookieAuthOption = {
  /** Browser-only: authenticated requests via `/api/backend/*` + HttpOnly cookie */
  cookieAuth?: boolean
}

/** First string from Laravel-style `{ errors: { field: ["msg"] } }` bodies. */
function firstValidationErrorsLine(errors: unknown): string {
  if (!errors || typeof errors !== "object") return ""
  for (const val of Object.values(errors as Record<string, unknown>)) {
    if (!Array.isArray(val)) continue
    for (const item of val) {
      if (typeof item === "string" && item.trim() !== "") return item.trim()
    }
  }
  return ""
}

function messageFromApiErrorJson(trimmed: string): string {
  if (!trimmed) return ""
  try {
    const json = JSON.parse(trimmed) as Record<string, unknown>
    const msg =
      typeof json.message === "string" ? json.message.trim() : ""
    const field = firstValidationErrorsLine(json.errors)
    return msg || field || trimmed
  } catch {
    return trimmed
  }
}

async function parseErrorBody(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    try {
      const json = (await response.json()) as unknown
      if (json && typeof json === "object") {
        const o = json as Record<string, unknown>
        const msg =
          typeof o.message === "string" ? o.message.trim() : ""
        const field = firstValidationErrorsLine(o.errors)
        const combined = msg || field
        if (combined !== "") return combined
      }
    } catch {
      // ignore
    }
  }

  try {
    const text = await response.text()
    return text.trim()
  } catch {
    return ""
  }
}

export const api = {
  async get<T>(
    path: string,
    options?: { token?: string; cache?: RequestCache } & CookieAuthOption
  ): Promise<T> {
    const useCookieProxy =
      isBrowser() && options?.cookieAuth === true
    const url = useCookieProxy ? backendProxyUrl(path) : apiUrl(path)
    const headers: Record<string, string> = { Accept: "application/json" }
    if (!useCookieProxy && options?.token?.trim()) {
      headers.Authorization = `Bearer ${options.token.trim()}`
    }
    const response = await fetch(url, {
      method: "GET",
      headers,
      cache: options?.cache ?? "no-store",
      ...(useCookieProxy ? { credentials: "include" as RequestCredentials } : {}),
    })

    if (!response.ok) {
      const details = await parseErrorBody(response)
      throw new Error(
        details ||
          `GET ${url} failed: ${response.status} ${response.statusText}`
      )
    }

    return response.json() as Promise<T>
  },

  /**
   * POST JSON body. Does not throw on HTTP error status — callers inspect JSON.
   * Throws on network failure or non-JSON response body.
   */
  async postJson(path: string, body: unknown): Promise<unknown> {
    let url: string
    try {
      url = apiUrl(path)
    } catch {
      throw new Error("Something went wrong. Please try again.")
    }

    let response: Response
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
    } catch {
      throw new Error("Something went wrong. Please try again.")
    }

    const text = await response.text()
    const trimmed = text.trim()
    if (!trimmed) {
      if (!response.ok) {
        throw new Error("Something went wrong. Please try again.")
      }
      return {}
    }

    try {
      return JSON.parse(trimmed) as unknown
    } catch {
      throw new Error("Something went wrong. Please try again.")
    }
  },

  /**
   * PUT JSON with optional Bearer token. Throws if response is not OK or body is not JSON.
   */
  async putJson<T>(
    path: string,
    body: unknown,
    options?: { token?: string } & CookieAuthOption
  ): Promise<T> {
    return authJsonMutation<T>("PUT", path, body, options)
  },

  /**
   * PATCH JSON with optional Bearer token. Throws if response is not OK or body is not JSON.
   */
  async patchJson<T>(
    path: string,
    body: unknown,
    options?: { token?: string } & CookieAuthOption
  ): Promise<T> {
    return authJsonMutation<T>("PATCH", path, body, options)
  },

  /**
   * POST JSON with optional Bearer token. Throws if response is not OK or body is not JSON.
   */
  async post<T>(
    path: string,
    body: unknown,
    options?: { token?: string } & CookieAuthOption
  ): Promise<T> {
    return authJsonMutation<T>("POST", path, body, options)
  },

  /**
   * DELETE with optional Bearer token. Throws if response is not OK or body is not JSON.
   */
  async delete<T>(
    path: string,
    options?: { token?: string } & CookieAuthOption
  ): Promise<T> {
    return authJsonMutation<T>("DELETE", path, undefined, options)
  },
}

async function authJsonMutation<T>(
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body: unknown | undefined,
  options?: { token?: string } & CookieAuthOption
): Promise<T> {
  const useCookieProxy =
    isBrowser() && options?.cookieAuth === true

  let url: string
  try {
    url = useCookieProxy ? backendProxyUrl(path) : apiUrl(path)
  } catch {
    throw new Error("Something went wrong. Please try again.")
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  }
  if (method !== "DELETE") {
    headers["Content-Type"] = "application/json"
  }
  if (!useCookieProxy && options?.token?.trim()) {
    headers.Authorization = `Bearer ${options.token.trim()}`
  }

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers,
      ...(useCookieProxy ? { credentials: "include" as RequestCredentials } : {}),
      body:
        method === "DELETE"
          ? undefined
          : JSON.stringify(body ?? {}),
    })
  } catch {
    throw new Error("Something went wrong. Please try again.")
  }

  const text = await response.text()
  const trimmed = text.trim()

  if (!response.ok) {
    const msg = trimmed ? messageFromApiErrorJson(trimmed) : ""
    throw new Error(
      msg || `Request failed: ${response.status} ${response.statusText}`
    )
  }

  if (!trimmed) {
    return {} as T
  }

  try {
    return JSON.parse(trimmed) as T
  } catch {
    throw new Error("Something went wrong. Please try again.")
  }
}

// Backwards-compatible exports used elsewhere in the codebase.
export { apiUrl, getApiBaseUrl }
