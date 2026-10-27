import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react"
import { api, type AdminAccount } from "@/services/api"

interface AdminContextValue {
  admin: AdminAccount | null
  csrfToken: string
  loading: boolean
  error: string
  refresh: () => Promise<void>
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({ children }: PropsWithChildren) {
  const [admin, setAdmin] = useState<AdminAccount | null>(null)
  const [csrfToken, setCsrfToken] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const refresh = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [session, token] = await Promise.all([api.getAuthSession(), api.getCsrfToken()])
      if (!session.success) throw new Error(session.message || "Could not verify administrator session.")
      setAdmin(session.admin)
      setCsrfToken(token)
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Could not verify administrator session.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    Promise.all([api.getAuthSession(), api.getCsrfToken()])
      .then(([session, token]) => {
        if (!session.success) throw new Error(session.message || "Could not verify administrator session.")
        if (!active) return
        setAdmin(session.admin)
        setCsrfToken(token)
      })
      .catch((refreshError: unknown) => {
        if (active) setError(refreshError instanceof Error ? refreshError.message : "Could not verify administrator session.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    setError("")
    const token = csrfToken || await api.getCsrfToken()
    const result = await api.adminLogin(username, password, token)
    if (!result.success) throw new Error(result.message || "Administrator sign-in failed.")
    const session = await api.getAuthSession()
    if (!session.success || !session.admin) {
      throw new Error(session.message || "The server did not establish an administrator session.")
    }
    setAdmin(session.admin)
    setCsrfToken(await api.getCsrfToken())
  }, [csrfToken])

  const logout = useCallback(async () => {
    await api.adminLogout()
    setAdmin(null)
  }, [])

  const value = useMemo(
    () => ({ admin, csrfToken, loading, error, refresh, login, logout }),
    [admin, csrfToken, loading, error, refresh, login, logout],
  )

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) throw new Error("useAdmin must be used within AdminProvider.")
  return context
}
