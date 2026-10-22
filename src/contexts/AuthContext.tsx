import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { api } from "@/services/api"

interface StudentUser {
  student_id: string
}

interface AdminUser {
  id: number
  username: string
}

interface AuthContextType {
  student: StudentUser | null
  admin: AdminUser | null
  loginStudent: (id: string, password: string, csrf: string) => Promise<void>
  loginAdmin: (username: string, password: string, csrf: string) => Promise<void>
  logoutStudent: () => void
  logoutAdmin: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  authLoading: boolean
  authError: string
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<StudentUser | null>(null)
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState("")

  const refreshAuth = useCallback(async () => {
    setAuthLoading(true)
    setAuthError("")
    try {
      const session = await api.getAuthSession()
      if (!session.success) throw new Error("Could not verify the current session")
      setStudent(session.student)
      setAdmin(session.admin)
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Could not verify the current session")
    } finally {
      setAuthLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshAuth()
  }, [refreshAuth])

  const loginStudent = useCallback(async (id: string, password: string, csrf: string) => {
    const res = await api.login(id, password, csrf)
    if (res.status === "success") {
      await refreshAuth()
    } else {
      throw new Error(res.message)
    }
  }, [refreshAuth])

  const loginAdmin = useCallback(async (username: string, password: string, csrf: string) => {
    const res = await api.adminLogin(username, password, csrf)
    if (res.success) {
      await refreshAuth()
    } else {
      throw new Error(res.message)
    }
  }, [refreshAuth])

  const logoutStudent = useCallback(async () => {
    const response = await fetch("/php/logout.php", { credentials: "include" })
    if (!response.ok) throw new Error("Could not sign out")
    setStudent(null)
  }, [])

  const logoutAdmin = useCallback(async () => {
    const response = await fetch("/admin/php/logout.php", { credentials: "include" })
    if (!response.ok) throw new Error("Could not sign out")
    setAdmin(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        student,
        admin,
        loginStudent,
        loginAdmin,
        logoutStudent,
        logoutAdmin,
        isAuthenticated: student !== null,
        isAdmin: admin !== null,
        authLoading,
        authError,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
