import { useCallback, useEffect, useState } from "react"
import type { FormEvent } from "react"
import { request, ROUTES } from "./_api"
import { Page, StatusText } from "./_shared"

type Incident = { id: number; case_no: string; student_id: string; first_name: string; last_name: string; violation_name: string; severity: string; status: string; incident_at: string; occurrences_applied: number }

export default function PrefectIncidents() {
  const [rows, setRows] = useState<Incident[]>([])
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const load = useCallback(async () => {
    setLoading(true); setError("")
    try {
      const query = new URLSearchParams()
      if (search) query.set("search", search)
      if (status) query.set("status", status)
      const data = await request<{ incidents: Incident[] }>(`incidents.php?${query}`)
      setRows(data.incidents)
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load incidents.") }
    finally { setLoading(false) }
  }, [search, status])
  useEffect(() => { void load() }, [load])
  function submit(event: FormEvent) { event.preventDefault(); void load() }
  return <Page title="Incidents">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-slate-600">Search and review the latest 200 incident records.</p>
      <a href={ROUTES.create} className="rounded-lg bg-amber-800 px-4 py-2.5 text-sm font-bold text-white">File incident</a>
    </div>
    <form onSubmit={submit} className="flex flex-wrap gap-2 rounded-xl border bg-white p-4">
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Case, student ID, or name" className="min-w-56 flex-1 rounded-lg border px-3 py-2 text-sm" />
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
        <option value="">All statuses</option><option value="open">Open</option><option value="under_review">Under review</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option>
      </select>
      <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white">Search</button>
    </form>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-slate-100 text-xs uppercase text-slate-600"><tr>{["Case", "Student", "Violation", "Category", "Date", "Status", ""].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
        <tbody className="divide-y">
          {rows.map((row) => <tr key={row.id}>
            <td className="px-4 py-3 font-bold"><a className="text-amber-900 underline" href={`${ROUTES.incidents}/${row.id}`}>{row.case_no}</a></td>
            <td className="px-4 py-3">{row.first_name} {row.last_name}<span className="block text-xs text-slate-500">{row.student_id}</span></td>
            <td className="px-4 py-3">{row.violation_name || "Uncategorized"}</td><td className="px-4 py-3 uppercase">Category {row.severity}</td>
            <td className="px-4 py-3">{row.incident_at || "—"}</td><td className="px-4 py-3"><StatusText status={row.status} /></td>
            <td className="px-4 py-3"><a className="font-semibold text-amber-900" href={`${ROUTES.incidents}/${row.id}`}>View</a></td>
          </tr>)}
          {!loading && rows.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">No incidents found.</td></tr>}
          {loading && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">Loading incidents…</td></tr>}
        </tbody>
      </table>
    </div>
  </Page>
}
