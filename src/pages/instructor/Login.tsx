import { useEffect, useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { LockKeyhole, LogIn } from "lucide-react"
import { Notice, useInstructorPortal, postPortal } from "./portal"

export default function InstructorLogin() {
  const navigate = useNavigate()
  const { csrfToken, instructor, loading, error, refresh } = useInstructorPortal()
  const [instructorId, setInstructorId] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && instructor) navigate("/instructor", { replace: true })
  }, [instructor, loading, navigate])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage("")
    setSubmitting(true)
    try {
      await postPortal("login", csrfToken, {
        instructor_id: instructorId.trim(),
        password,
      })
      await refresh()
      navigate("/instructor", { replace: true })
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to sign in.")
      if (!csrfToken) await refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return <div className="flex min-h-screen items-center justify-center bg-[#f2faf2] px-4 py-10">
    <main className="w-full max-w-md rounded-3xl border border-green-100 bg-white p-7 shadow-xl sm:p-9">
      <Link to="/" className="text-sm font-semibold text-[#187C19] hover:underline">← Back to Squared</Link>
      <div className="mt-7 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-[#187C19]"><LockKeyhole className="h-7 w-7" /></div>
        <h1 className="mt-4 text-2xl font-black">Instructor sign in</h1>
        <p className="mt-1 text-sm text-gray-500">NSTP attendance and reporting portal</p>
      </div>
      <div className="mt-6 space-y-3">
        {error && <Notice>{error}</Notice>}
        {message && <Notice>{message}</Notice>}
      </div>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block space-y-1.5 text-sm font-semibold">
          Instructor ID
          <input autoComplete="username" required value={instructorId} onChange={(event) => setInstructorId(event.target.value)} placeholder="e.g. INST-001" className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 font-normal outline-none transition focus:border-[#187C19] focus:ring-2 focus:ring-green-100" />
        </label>
        <label className="block space-y-1.5 text-sm font-semibold">
          Password
          <input autoComplete="current-password" required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 font-normal outline-none transition focus:border-[#187C19] focus:ring-2 focus:ring-green-100" />
        </label>
        <button disabled={submitting || loading || !csrfToken} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#187C19] font-bold text-white shadow-lg shadow-green-900/10 transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60">
          <LogIn className="h-4 w-4" />{submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-5 text-center text-xs leading-5 text-gray-500">Instructor accounts are provisioned and approved by the NSTP administrator. For password recovery, use the legacy instructor recovery page.</p>
      <p className="mt-3 text-center text-xs"><a href="/instructor/forgot_password.php" className="font-semibold text-[#187C19] hover:underline">Forgot password?</a></p>
    </main>
  </div>
}
