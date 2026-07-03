import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
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
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<StudentUser | null>(null)
  const [admin, setAdmin] = useState<AdminUser | null>(null)

  const loginStudent = useCallback(async (id: string, password: string, csrf: string) => {
    const res = await api.login(id, password, csrf)
    if (res.status === "success") {
      setStudent({ student_id: id })
    } else {
      throw new Error(res.message)
    }
  }, [])

  const loginAdmin = useCallback(async (username: string, password: string, csrf: string) => {
    const res = await api.adminLogin(username, password, csrf)
    if (res.success) {
      setAdmin({ id: 1, username })
    } else {
      throw new Error(res.message)
    }
  }, [])

  const logoutStudent = useCallback(async () => {
    await fetch("/php/logout.php", { credentials: "include" })
    setStudent(null)
  }, [])

  const logoutAdmin = useCallback(async () => {
    await fetch("/admin/php/logout.php", { credentials: "include" })
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
