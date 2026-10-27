import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react"
import { api, type InstructorAccount, type InstructorSubject } from "@/services/api"

interface InstructorContextValue {
  instructor: InstructorAccount | null
  subjects: InstructorSubject[]
  csrfToken: string
  loading: boolean
  error: string
  refresh: () => Promise<void>
  login: (instructorId: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const InstructorContext = createContext<InstructorContextValue | null>(null)

export function InstructorProvider({ children }: PropsWithChildren) {
  const [instructor, setInstructor] = useState<InstructorAccount | null>(null)
  const [subjects, setSubjects] = useState<InstructorSubject[]>([])
  const [csrfToken, setCsrfToken] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const refresh = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const session = await api.getInstructorBootstrap()
      setInstructor(session.instructor)
      setSubjects(session.subjects)
      setCsrfToken(session.csrfToken)
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Could not connect to the instructor portal.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    api.getInstructorBootstrap()
      .then((session) => {
        if (!active) return
        setInstructor(session.instructor)
        setSubjects(session.subjects)
        setCsrfToken(session.csrfToken)
      })
      .catch((refreshError: unknown) => {
        if (active) setError(refreshError instanceof Error ? refreshError.message : "Could not connect to the instructor portal.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const login = useCallback(async (instructorId: string, password: string) => {
    setError("")
    const token = csrfToken || await api.getCsrfToken()
    await api.instructorLogin(instructorId, password, token)
    const session = await api.getInstructorBootstrap()
    if (!session.instructor) throw new Error("The server did not establish an instructor session.")
    setInstructor(session.instructor)
    setSubjects(session.subjects)
    setCsrfToken(session.csrfToken)
  }, [csrfToken])

  const logout = useCallback(async () => {
    await api.instructorLogout(csrfToken)
    setInstructor(null)
    setSubjects([])
  }, [csrfToken])

  const value = useMemo(
    () => ({ instructor, subjects, csrfToken, loading, error, refresh, login, logout }),
    [instructor, subjects, csrfToken, loading, error, refresh, login, logout],
  )

  return <InstructorContext.Provider value={value}>{children}</InstructorContext.Provider>
}

export function useInstructor() {
  const context = useContext(InstructorContext)
  if (!context) throw new Error("useInstructor must be used within InstructorProvider.")
  return context
}
