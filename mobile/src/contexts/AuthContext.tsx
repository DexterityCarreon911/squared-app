import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from "react"
import { api, ApiRequestError, type StudentUser } from "@/services/api"
import { AuthContext } from "@/contexts/context"

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Could not verify your Squared session."
}

function isMissingSessionEndpoint(error: unknown) {
  return error instanceof ApiRequestError
    && error.status === 404
    && error.endpoint === "/php/api/auth_session.php"
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [student, setStudent] = useState<StudentUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState("")

  const refreshAuth = useCallback(async () => {
    setAuthLoading(true)
    setAuthError("")
    try {
      const session = await api.getAuthSession()
      if (!session.success) throw new Error(session.message || "Could not verify your session.")
      setStudent(session.student)
    } catch (error) {
      setStudent(null)
      setAuthError(isMissingSessionEndpoint(error) ? "" : errorMessage(error))
    } finally {
      setAuthLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    api.getAuthSession()
      .then((session) => {
        if (!active) return
        if (!session.success) throw new Error(session.message || "Could not verify your session.")
        setStudent(session.student)
      })
      .catch((error: unknown) => {
        if (active) {
          setStudent(null)
          setAuthError(isMissingSessionEndpoint(error) ? "" : errorMessage(error))
        }
      })
      .finally(() => {
        if (active) setAuthLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const loginStudent = useCallback(async (studentId: string, password: string) => {
    setAuthError("")
    const csrfToken = await api.getCsrfToken()
    const result = await api.login(studentId, password, csrfToken)
    if (result.status !== "success") throw new Error(result.message || "Invalid student ID or password.")

    const session = await api.getAuthSession()
    if (!session.success || !session.student) {
      throw new Error(session.message || "The server did not establish a student session. Please try again.")
    }
    setStudent(session.student)
  }, [])

  const logoutStudent = useCallback(async () => {
    await api.logoutStudent()
    setStudent(null)
  }, [])

  const value = useMemo(
    () => ({ student, authLoading, authError, refreshAuth, loginStudent, logoutStudent }),
    [student, authLoading, authError, refreshAuth, loginStudent, logoutStudent],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
