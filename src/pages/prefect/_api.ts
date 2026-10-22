import { useEffect, useState } from "react"

export const API = "/prefect_admin/php/api"
export const ROUTES = {
  login: "/prefect/login",
  incidents: "/prefect/incidents",
  create: "/prefect/incidents/new",
  students: "/prefect/students",
  violations: "/prefect/violations",
  reports: "/prefect/reports",
}

export type ApiResult<T = Record<string, unknown>> = T & {
  status: "success" | "error"
  message?: string
}

export async function request<T extends Record<string, unknown>>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResult<T>> {
  const response = await fetch(`${API}/${endpoint}`, {
    credentials: "include",
    ...options,
    headers: { Accept: "application/json", ...options.headers },
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload || payload.status !== "success") {
    throw new Error(payload?.message || `Request failed (${response.status}).`)
  }
  return payload as ApiResult<T>
}

export function jsonPost<T extends Record<string, unknown>>(body: object, csrfToken: string) {
  return request<T>("incidents.php", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
    body: JSON.stringify(body),
  })
}

export function catalogPost<T extends Record<string, unknown>>(body: object, csrfToken: string) {
  return request<T>("catalog.php", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
    body: JSON.stringify(body),
  })
}

export function usePrefectSession() {
  const [csrfToken, setCsrfToken] = useState("")
  const [user, setUser] = useState<{ id: number; name: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  useEffect(() => {
    async function initialize() {
      const tokenResponse = await fetch("/php/api/csrf_token.php", { credentials: "include", headers: { Accept: "application/json" } })
      const tokenPayload = await tokenResponse.json().catch(() => null)
      if (!tokenResponse.ok || !tokenPayload?.success || !tokenPayload.csrf_token) {
        throw new Error(tokenPayload?.message || "Unable to initialize security token.")
      }
      const session = await request<{ authenticated: boolean; csrf_token: string; user: { id: number; name: string } | null }>("session.php")
      setCsrfToken(tokenPayload.csrf_token)
      setUser(session.user)
    }
    initialize()
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])
  return { csrfToken, setCsrfToken, user, setUser, loading, error }
}
