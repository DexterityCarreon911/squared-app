import { useCallback, useEffect, useState } from "react"
import type { FormEvent } from "react"
import { request } from "./_api"
import { ErrorMessage, Field, Page, inputClass } from "./_shared"

type Report = { summary: { total: number; open_cases: number; resolved: number; dismissed: number; occurrences: number }; by_violation: Array<{ violation: string; cases: number; occurrences: number }> }
type Filters = { status: string; severity: string; from: string; to: string }

function buildQueryString(filters: Filters) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value) })
  return params.toString()
}

export default function PrefectReports() {
  const [filters, setFilters] = useState<Filters>({ status: "", severity: "", from: "", to: "" })
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const load = useCallback(async (event?: FormEvent) => {
    event?.preventDefault(); setLoading(true); setError("")
    try { const data = await request<Report>(`catalog.php?resource=reports&${buildQueryString(filters)}`); setReport(data) }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to load report.") }
    finally { setLoading(false) }
  }, [filters])
  useEffect(() => { void load() }, [load])
  return <Page title="Discipline reports">
    <p className="text-sm text-slate-600">Review filtered case totals and download the matching CSV report.</p>
    <form onSubmit={(e) => void load(e)} className="grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
      <Field label="Status"><select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className={inputClass}><option value="">All</option><option value="open">Open</option><option value="under_review">Under review</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option></select></Field>
      <Field label="Category"><select value={filters.severity} onChange={(e) => setFilters({ ...filters, severity: e.target.value })} className={inputClass}><option value="">All</option><option value="a">Category A</option><option value="b">Category B</option><option value="c">Category C</option></select></Field>
      <Field label="From"><input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} className={inputClass} /></Field>
      <Field label="To"><input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} className={inputClass} /></Field>
      <div className="flex items-end gap-2"><button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white">{loading ? "Loading…" : "Apply"}</button><a href={`/prefect_admin/php/api/catalog.php?resource=export&${buildQueryString(filters)}`} className="rounded-lg bg-amber-800 px-4 py-2 text-center text-sm font-bold text-white">CSV</a></div>
    </form>
    {error && <ErrorMessage>{error}</ErrorMessage>}
    {report && <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[
        ["Cases", report.summary.total], ["Open", report.summary.open_cases], ["Resolved", report.summary.resolved],
        ["Dismissed", report.summary.dismissed], ["Occurrences", report.summary.occurrences],
      ].map(([label, value]) => <article key={label} className="rounded-xl border bg-white p-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold">{value ?? 0}</p></article>)}</div>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm"><thead className="bg-slate-100 text-xs uppercase"><tr><th className="px-4 py-3">Violation</th><th className="px-4 py-3">Cases</th><th className="px-4 py-3">Occurrences</th></tr></thead>
          <tbody className="divide-y">{report.by_violation.map((row) => <tr key={row.violation}><td className="px-4 py-3">{row.violation}</td><td className="px-4 py-3">{row.cases}</td><td className="px-4 py-3">{row.occurrences}</td></tr>)}
          {report.by_violation.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-slate-500">No report rows match the selected filters.</td></tr>}</tbody>
        </table>
      </div>
    </section>}
  </Page>
}
