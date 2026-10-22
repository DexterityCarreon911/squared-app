import { useCallback, useEffect, useState, type ReactNode } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { AlertCircle, BookOpen, ClipboardList, LogOut, QrCode, Users, Home, FileBarChart, Award, Star } from "lucide-react"

const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "")
const endpoint = `${apiBase}/instructor/php/api/portal.php`
const csrfEndpoint = `${apiBase}/php/api/csrf_token.php`

export type Instructor = { id: string; name: string }
export type Subject = { subject_code: string; subject_name: string; section: string | null; student_count: number }
export type AttendanceRecord = {
  id: number
  session_date: string
  student_id: string
  subject_code: string
  time_in: string | null
  time_out: string | null
  evaluation_status: string | null
  evaluated_at: string | null
  certificate_issued_at: string | null
  first_name: string
  last_name: string
  program: string | null
  course: string | null
  evaluation_data: Record<string, unknown> | null
  evaluation_submitted_at: string | null
}

type ApiResponse = {
  success?: boolean
  message?: string
  csrf_token?: string
  instructor?: Instructor | null
  subjects?: Subject[]
  [key: string]: unknown
}

function errorMessage(data: ApiResponse, fallback: string) {
  if (data.success === false) throw new Error(data.message || fallback)
  return data
}

export async function getPortal<T extends object>(action: string, params: Record<string, string> = {}): Promise<T> {
  const query = new URLSearchParams({ action, ...params })
  const response = await fetch(`${endpoint}?${query.toString()}`, { credentials: "include", headers: { "X-Requested-With": "XMLHttpRequest" } })
  let data: ApiResponse
  try {
    data = await response.json()
  } catch {
    throw new Error(response.ok ? "The server returned an unreadable response." : `Request failed (${response.status}).`)
  }
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status}).`)
  return errorMessage(data, "Could not load instructor data.") as T
}

export async function postPortal<T extends object = ApiResponse>(
  action: string,
  csrfToken: string,
  fields: Record<string, string | number> = {},
): Promise<T> {
  const body = new URLSearchParams({ action, csrf_token: csrfToken })
  Object.entries(fields).forEach(([key, value]) => body.set(key, String(value)))
  const response = await fetch(endpoint, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Requested-With": "XMLHttpRequest" },
    body,
  })
  let data: ApiResponse
  try {
    data = await response.json()
  } catch {
    throw new Error(response.ok ? "The server returned an unreadable response." : `Request failed (${response.status}).`)
  }
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status}).`)
  return errorMessage(data, "The request could not be completed.") as T
}

async function getSharedCsrfToken() {
  const response = await fetch(csrfEndpoint, { credentials: "include", headers: { "X-Requested-With": "XMLHttpRequest" } })
  const data = await response.json() as ApiResponse
  if (!response.ok || !data.success || !data.csrf_token) {
    throw new Error(data.message || "Could not initialize secure request handling.")
  }
  return data.csrf_token
}

export function useInstructorPortal() {
  const [csrfToken, setCsrfToken] = useState("")
  const [instructor, setInstructor] = useState<Instructor | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const refresh = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [data, token] = await Promise.all([getPortal<ApiResponse>("bootstrap"), getSharedCsrfToken()])
      setCsrfToken(token)
      setInstructor(data.instructor || null)
      setSubjects(data.subjects || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect to the instructor portal.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])
  return { csrfToken, instructor, subjects, loading, error, refresh, setCsrfToken }
}

export function useRequireInstructor() {
  const portal = useInstructorPortal()
  const navigate = useNavigate()
  useEffect(() => {
    if (!portal.loading && !portal.error && !portal.instructor) navigate("/instructor/login", { replace: true })
  }, [portal.loading, portal.error, portal.instructor, navigate])
  return portal
}

export function Notice({ children, tone = "error" }: { children: ReactNode; tone?: "error" | "success" | "info" }) {
  const styles = {
    error: "border-red-200 bg-red-50 text-red-800",
    success: "border-green-200 bg-green-50 text-green-800",
    info: "border-blue-200 bg-blue-50 text-blue-800",
  }
  return <div role="status" className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${styles[tone]}`}>
    {tone === "error" && <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
    <span>{children}</span>
  </div>
}

export function LoadingState({ message = "Loading instructor portal…" }: { message?: string }) {
  return <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">{message}</div>
}

const navItems = [
  { to: "/instructor", label: "Overview", icon: Home, end: true },
  { to: "/instructor/subjects", label: "Subjects", icon: BookOpen },
  { to: "/instructor/scan", label: "Scan attendance", icon: QrCode },
  { to: "/instructor/attendance", label: "Scan history", icon: ClipboardList },
  { to: "/instructor/scanners", label: "Scanners", icon: Users },
  { to: "/instructor/reports", label: "Reports", icon: FileBarChart },
  { to: "/instructor/evaluations", label: "Evaluations", icon: Star },
  { to: "/instructor/certificates", label: "Certificates", icon: Award },
]

export function PortalFrame({
  instructor,
  csrfToken,
  children,
}: {
  instructor: Instructor | null
  csrfToken: string
  children: ReactNode
}) {
  const navigate = useNavigate()
  const [logoutError, setLogoutError] = useState("")
  const [loggingOut, setLoggingOut] = useState(false)

  const logout = async () => {
    setLoggingOut(true)
    setLogoutError("")
    try {
      await postPortal("logout", csrfToken)
      navigate("/instructor/login", { replace: true })
    } catch (err) {
      setLogoutError(err instanceof Error ? err.message : "Could not sign out.")
    } finally {
      setLoggingOut(false)
    }
  }

  return <div className="min-h-screen bg-[#f2faf2] text-gray-900">
    <header className="bg-gradient-to-r from-[#0d5b11] to-[#187C19] text-white shadow-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link to="/instructor" className="text-lg font-black tracking-tight">Squared NSTP <span className="font-medium text-white/75">Instructor Portal</span></Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-white/85">{instructor?.name || instructor?.id}</span>
          <button type="button" onClick={() => void logout()} disabled={loggingOut} className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 font-semibold hover:bg-white/25 disabled:opacity-60">
            <LogOut className="h-4 w-4" />{loggingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>
    </header>
    <nav aria-label="Instructor navigation" className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-4">
      {navItems.map(({ to, label, icon: Icon, end }) => <NavLink
        key={to}
        to={to}
        end={end}
        className={({ isActive }) => `inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-[#187C19] text-white shadow" : "bg-white text-gray-600 hover:bg-green-50 hover:text-[#187C19]"}`}
      ><Icon className="h-4 w-4" />{label}</NavLink>)}
    </nav>
    <main className="mx-auto max-w-7xl space-y-5 px-4 pb-10">
      {logoutError && <Notice>{logoutError}</Notice>}
      {children}
    </main>
  </div>
}

export function PageHeading({ title, description }: { title: string; description: string }) {
  return <div className="mb-5"><h1 className="text-2xl font-black tracking-tight">{title}</h1><p className="mt-1 text-sm text-gray-500">{description}</p></div>
}

export function Card({ title, children, aside }: { title: ReactNode; children: ReactNode; aside?: ReactNode }) {
  return <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
      <h2 className="font-bold">{title}</h2>{aside}
    </div>
    <div className="p-5">{children}</div>
  </section>
}

export function dateLabel(date: string | null) {
  if (!date) return "—"
  const parsed = new Date(date.replace(" ", "T"))
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
}

export function shortDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`)
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString(undefined, { dateStyle: "medium" })
}
