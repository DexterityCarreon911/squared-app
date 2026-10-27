import { createContext } from "react"
import type { StudentUser } from "@/services/api"

export interface AuthContextValue {
  student: StudentUser | null
  authLoading: boolean
  authError: string
  refreshAuth: () => Promise<void>
  loginStudent: (studentId: string, password: string) => Promise<void>
  logoutStudent: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
