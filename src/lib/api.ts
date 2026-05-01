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
}

// Backwards-compatible exports used elsewhere in the codebase.
export { apiUrl, getApiBaseUrl }
