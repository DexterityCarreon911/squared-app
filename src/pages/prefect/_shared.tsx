import type { ReactNode } from "react"
import { ROUTES, request, usePrefectSession } from "./_api"

export function Page({ title, children }: { title: string; children: ReactNode }) {
  const { csrfToken, user } = usePrefectSession()
  async function logout() {
    try {
      await request("session.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "X-CSRF-Token": csrfToken },
        body: new URLSearchParams({ action: "logout", csrf_token: csrfToken }),
      })
      window.location.href = ROUTES.login
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Unable to sign out.")
    }
  }
  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-6 bg-slate-50 px-4 py-8 text-slate-900 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-800">Prefect of Discipline</p>
          <h1 className="mt-1 text-2xl font-bold">{title}</h1>
        </div>
        <nav className="flex flex-wrap gap-2 text-sm font-semibold">
          {Object.entries({ Incidents: ROUTES.incidents, Students: ROUTES.students, Violations: ROUTES.violations, Reports: ROUTES.reports }).map(([label, href]) => (
            <a key={label} className="rounded-lg bg-white px-3 py-2 shadow-sm hover:text-amber-800" href={href}>{label}</a>
          ))}
          {user && <button onClick={() => void logout()} className="rounded-lg bg-white px-3 py-2 text-slate-700 shadow-sm hover:text-red-800">Sign out</button>}
        </nav>
      </header>
      {children}
    </main>
  )
}

export function ErrorMessage({ children }: { children: ReactNode }) {
  return <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{children}</p>
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-1.5 text-sm font-semibold text-slate-700">{label}{children}</label>
}

export const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100"

export function StatusText({ status }: { status: string }) {
  return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold capitalize text-slate-700">{status.replaceAll("_", " ")}</span>
}
