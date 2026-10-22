import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { useSearchParams } from "react-router-dom"
import { request, ROUTES } from "./_api"
import { ErrorMessage, Page, StatusText } from "./_shared"

type Student = { student_id: string; first_name: string; last_name: string; program: string; course: string; sex: string }
type Match = Pick<Student, "student_id" | "first_name" | "last_name" | "program">
type RecordData = { student: Student; stats: { total_cases: number; open_cases: number; total_occurrences: number; tier: string }; incidents: Array<{ id: number; case_no: string; violation_name: string; status: string; severity: string; occurrences_applied: number; incident_at: string }> }

export default function PrefectStudents() {
  const [params, setParams] = useSearchParams()
  const selectedId = params.get("student_id") || ""
  const [query, setQuery] = useState("")
  const [matches, setMatches] = useState<Match[]>([])
  const [record, setRecord] = useState<RecordData | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  async function search(event?: FormEvent) {
    event?.preventDefault()
    setError("")
    try { const data = await request<{ matches: Match[] }>(`catalog.php?resource=students&q=${encodeURIComponent(query)}`); setMatches(data.matches) }
    catch (err) { setError(err instanceof Error ? err.message : "Student search failed.") }
  }
  useEffect(() => {
    if (!selectedId) { setRecord(null); return }
    setLoading(true); setError("")
    request<RecordData>(`catalog.php?resource=student&student_id=${encodeURIComponent(selectedId)}`)
      .then(setRecord).catch((err: Error) => setError(err.message)).finally(() => setLoading(false))
  }, [selectedId])
  return <Page title="Student records">
    <form onSubmit={(e) => void search(e)} className="flex gap-2 rounded-xl border bg-white p-4">
      <input value={query} onChange={(e) => setQuery(e.target.value)} className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm" placeholder="Search by student ID or name" />
      <button className="rounded-lg bg-amber-800 px-4 py-2 text-sm font-bold text-white">Search</button>
    </form>
    {error && <ErrorMessage>{error}</ErrorMessage>}
    {matches.length > 0 && <ul className="divide-y rounded-xl border bg-white">{matches.map((student) => <li key={student.student_id}><button onClick={() => { setParams({ student_id: student.student_id }); setMatches([]) }} className="w-full p-3 text-left text-sm hover:bg-slate-50">{student.first_name} {student.last_name} — {student.student_id} <span className="text-slate-500">{student.program}</span></button></li>)}</ul>}
    {loading && <p className="text-sm text-slate-500">Loading student record…</p>}
    {record && <section className="space-y-4">
      <div className="rounded-xl border bg-white p-5">
        <h2 className="text-xl font-bold">{record.student.first_name} {record.student.last_name}</h2>
        <p className="mt-1 text-sm text-slate-600">{record.student.student_id} · {record.student.program} · {record.student.course}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">{[
          ["Total cases", record.stats.total_cases], ["Open cases", record.stats.open_cases],
          ["Occurrences", record.stats.total_occurrences], ["Discipline tier", record.stats.tier],
        ].map(([label, value]) => <div key={label} className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-bold">{value}</p></div>)}</div>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase"><tr>{["Case", "Violation", "Category", "Occurrences", "Incident date", "Status"].map((item) => <th key={item} className="px-4 py-3">{item}</th>)}</tr></thead>
          <tbody className="divide-y">{record.incidents.map((incident) => <tr key={incident.id}>
            <td className="px-4 py-3"><a href={`${ROUTES.incidents}/${incident.id}`} className="font-semibold text-amber-900 underline">{incident.case_no}</a></td>
            <td className="px-4 py-3">{incident.violation_name || "Uncategorized"}</td><td className="px-4 py-3 uppercase">{incident.severity}</td><td className="px-4 py-3">{incident.occurrences_applied}</td><td className="px-4 py-3">{incident.incident_at || "—"}</td><td className="px-4 py-3"><StatusText status={incident.status} /></td>
          </tr>)}
          {record.incidents.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No discipline records for this student.</td></tr>}</tbody>
        </table>
      </div>
    </section>}
    {!selectedId && matches.length === 0 && <p className="text-sm text-slate-500">Search to find a student and view their discipline history.</p>}
  </Page>
}
