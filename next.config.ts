import type { NextConfig } from "next"

function getRemoteHostname(url: string): string | null {
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

function getRemoteProtocol(url: string): "http" | "https" | null {
  try {
    const { protocol } = new URL(url)
    if (protocol === "https:") return "https"
    if (protocol === "http:") return "http"
    return null
  } catch {
    return null
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "localhost",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "127.0.0.1",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
        pathname: "/**",
      },
      ...(process.env.NEXT_PUBLIC_API_BASE_URL
        ? (() => {
            const hostname = getRemoteHostname(process.env.NEXT_PUBLIC_API_BASE_URL)
            const protocol = getRemoteProtocol(process.env.NEXT_PUBLIC_API_BASE_URL)
            return hostname
              ? [
                  {
                    protocol: protocol ?? "http",
                    hostname,
                    pathname: "/**",
                  } as const,
                ]
              : []
          })()
        : []),
    ],
  },
}

export default nextConfig
