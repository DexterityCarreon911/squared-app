import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { request, ROUTES, usePrefectSession } from "./_api"

export default function PrefectLogin() {
  const navigate = useNavigate()
  const { csrfToken, setCsrfToken, user, loading, error: setupError } = usePrefectSession()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (user && !loading) navigate(ROUTES.incidents, { replace: true })
  }, [user, loading, navigate])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError("")
    try {
      const data = await request<{ user: { id: number; name: string }; csrf_token: string }>("session.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "X-CSRF-Token": csrfToken },
        body: new URLSearchParams({ action: "login", username, password, csrf_token: csrfToken }),
      })
      setCsrfToken(data.csrf_token)
      navigate(ROUTES.incidents, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-800">Prefect of Discipline</p>
          <h1 className="mt-2 text-2xl font-bold">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Use your existing prefect admin account.</p>
        </div>
        {(error || setupError) && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error || setupError}</p>}
        <label className="grid gap-1.5 text-sm font-semibold">Username<input required autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>
        <label className="grid gap-1.5 text-sm font-semibold">Password<input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>
        <button disabled={busy || loading || !csrfToken} className="w-full rounded-lg bg-amber-800 px-4 py-2.5 font-bold text-white disabled:opacity-50">{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </main>
  )
}
