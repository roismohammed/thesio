import { getCookie } from "@/lib/get-cookie"

/**
 * Base origin of the Laravel API. Overridable via VITE_API_URL.
 * Defaults to the same host/port the SPA runs on for local dev.
 */
const API_ORIGIN = import.meta.env.VITE_API_URL ?? window.location.origin

const apiCache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes
const STORAGE_PREFIX = "thesio_cache:"

function getStorageKey(path: string): string {
  return `${STORAGE_PREFIX}${path}`
}

export function getCachedApi<T>(path: string): T | undefined {
  const entry = apiCache.get(path)
  const now = Date.now()
  if (entry) {
    if (now - entry.timestamp <= CACHE_TTL_MS) {
      return entry.data as T
    }
    apiCache.delete(path)
  }

  // Fall back to sessionStorage if available
  try {
    const raw = sessionStorage.getItem(getStorageKey(path))
    if (raw) {
      const stored = JSON.parse(raw) as { data: unknown; timestamp: number }
      if (now - stored.timestamp <= CACHE_TTL_MS) {
        apiCache.set(path, stored)
        return stored.data as T
      }
      sessionStorage.removeItem(getStorageKey(path))
    }
  } catch {
    // sessionStorage unavailable or quota exceeded
  }

  return undefined
}

export function setCachedApi<T>(path: string, data: T): void {
  const entry = { data, timestamp: Date.now() }
  apiCache.set(path, entry)
  try {
    sessionStorage.setItem(getStorageKey(path), JSON.stringify(entry))
  } catch {
    // Ignore storage quota errors
  }
}

export function clearApiCache(prefix?: string) {
  if (!prefix) {
    apiCache.clear()
    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key?.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(key)
        }
      }
      for (const k of keysToRemove) {
        sessionStorage.removeItem(k)
      }
    } catch {
      // Ignore
    }
    return
  }

  for (const key of apiCache.keys()) {
    if (key.startsWith(prefix)) {
      apiCache.delete(key)
    }
  }

  try {
    const targetStoragePrefix = getStorageKey(prefix)
    const keysToRemove: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key?.startsWith(targetStoragePrefix)) {
        keysToRemove.push(key)
      }
    }
    for (const k of keysToRemove) {
      sessionStorage.removeItem(k)
    }
  } catch {
    // Ignore
  }
}

function getMutationInvalidationPrefix(path: string): string | undefined {
  if (path.startsWith("/api/thesis")) return "/api/thesis"
  if (path.startsWith("/api/admin")) return "/api/admin"
  if (path.startsWith("/api/plans") || path.startsWith("/api/subscriptions") || path.startsWith("/api/my")) {
    return "/api"
  }
  if (path.startsWith("/api/profile") || path.startsWith("/api/auth")) {
    return "/api/auth"
  }
  return undefined
}

/**
 * Fetch wrapper for the first-party SPA → Laravel Sanctum boundary.
 *
 * Sanctum SPA auth requires:
 *  - a CSRF cookie before any mutating request (GET /sanctum/csrf-cookie),
 *  - `withCredentials` on every request so the session cookie is sent.
 */
async function ensureCsrf(): Promise<string> {
  const existing = getCookie("XSRF-TOKEN")
  if (existing) {
    return existing
  }
  await fetch(`${API_ORIGIN}/sanctum/csrf-cookie`, {
    credentials: "include",
  })
  const token = getCookie("XSRF-TOKEN")
  if (!token) {
    throw new ApiError(419, "CSRF cookie tidak tersedia.")
  }
  return token
}

interface ApiOptions {
  method?: string
  body?: unknown
  skipCsrf?: boolean
}

export async function api<T>(
  path: string,
  { method = "GET", body, skipCsrf = false }: ApiOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {}

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData

  if (body !== undefined && !isFormData) {
    headers["Content-Type"] = "application/json"
  }

  if (!skipCsrf && method !== "GET" && method !== "HEAD") {
    const token = await ensureCsrf()
    headers["X-XSRF-TOKEN"] = token
  }

  const response = await fetch(`${API_ORIGIN}${path}`, {
    method,
    credentials: "include",
    headers,
    body:
      body === undefined
        ? undefined
        : isFormData
          ? body
          : JSON.stringify(body),
  })

  let bodyText = ""
  try {
    bodyText = await response.text()
  } catch {
    // response body unreadable — fall back to status message
  }

  let message = `HTTP ${response.status}`
  if (bodyText) {
    try {
      const json = JSON.parse(bodyText) as { message?: string }
      if (json.message) {
        message = json.message
      }
    } catch {
      // non-JSON body — keep status message; if it's HTML, flag the origin
      const contentType = response.headers.get("content-type") ?? ""
      if (contentType.includes("text/html")) {
        message = `Respons bukan JSON dari ${API_ORIGIN}. Pastikan URL API benar.`
      }
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, message)
  }

  if (response.status === 204) {
    if (method !== "GET" && method !== "HEAD") {
      clearApiCache(getMutationInvalidationPrefix(path))
    }
    return undefined as T
  }

  const parsed = JSON.parse(bodyText) as T

  if (method === "GET" || method === "HEAD") {
    setCachedApi(path, parsed)
  } else {
    clearApiCache(getMutationInvalidationPrefix(path))
  }

  return parsed
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export { API_ORIGIN }
