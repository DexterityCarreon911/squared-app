import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react"
import { api, type PrefectUser } from "@/services/api"

interface PrefectContextValue {
  user: PrefectUser | null
  csrfToken: string
  loading: boolean
  error: string
  refresh: () => Promise<void>
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const PrefectContext = createContext<PrefectContextValue | null>(null)

export function PrefectProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<PrefectUser | null>(null)
  const [csrfToken, setCsrfToken] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const refresh = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const session = await api.prefectSession()
      setUser(session.user)
      setCsrfToken(session.csrfToken)
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Could not verify Prefect session.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    api.prefectSession()
      .then((session) => {
        if (!active) return
        setUser(session.user)
        setCsrfToken(session.csrfToken)
      })
      .catch((refreshError: unknown) => {
        if (active) setError(refreshError instanceof Error ? refreshError.message : "Could not verify Prefect session.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    setError("")
    const session = await api.prefectLogin(username, password, csrfToken || await api.getCsrfToken())
    setUser(session.user)
    setCsrfToken(session.csrfToken)
  }, [csrfToken])

  const logout = useCallback(async () => {
    await api.prefectLogout(csrfToken)
    setUser(null)
  }, [csrfToken])

  const value = useMemo(
    () => ({ user, csrfToken, loading, error, refresh, login, logout }),
    [user, csrfToken, loading, error, refresh, login, logout],
  )

  return <PrefectContext.Provider value={value}>{children}</PrefectContext.Provider>
}

export function usePrefect() {
  const context = useContext(PrefectContext)
  if (!context) throw new Error("usePrefect must be used within PrefectProvider.")
  return context
}
