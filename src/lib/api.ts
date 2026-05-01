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

async function parseErrorBody(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    try {
      const json = (await response.json()) as unknown
      if (json && typeof json === "object") {
        const msg = (json as { message?: unknown }).message
        if (typeof msg === "string" && msg.trim() !== "") return msg
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
  async get<T>(path: string): Promise<T> {
    const url = apiUrl(path)
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
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
    options?: { token?: string }
  ): Promise<T> {
    return jsonMutation<T>("PUT", path, body, options)
  },

  /**
   * PATCH JSON with optional Bearer token. Throws if response is not OK or body is not JSON.
   */
  async patchJson<T>(
    path: string,
    body: unknown,
    options?: { token?: string }
  ): Promise<T> {
    return jsonMutation<T>("PATCH", path, body, options)
  },
}

async function jsonMutation<T>(
  method: "PUT" | "PATCH",
  path: string,
  body: unknown,
  options?: { token?: string }
): Promise<T> {
  let url: string
  try {
    url = apiUrl(path)
  } catch {
    throw new Error("Something went wrong. Please try again.")
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  }
  if (options?.token?.trim()) {
    headers.Authorization = `Bearer ${options.token.trim()}`
  }

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error("Something went wrong. Please try again.")
  }

  const text = await response.text()
  const trimmed = text.trim()

  if (!response.ok) {
    let msg = ""
    if (trimmed) {
      try {
        const json = JSON.parse(trimmed) as { message?: unknown }
        if (typeof json.message === "string" && json.message.trim()) {
          msg = json.message.trim()
        }
      } catch {
        msg = trimmed
      }
    }
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
