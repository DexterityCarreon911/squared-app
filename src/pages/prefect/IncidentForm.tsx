import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { jsonPost, request, ROUTES, usePrefectSession } from "./_api"
import { ErrorMessage, Field, Page, inputClass } from "./_shared"

type Violation = { id: number; name: string; severity: string; occurrences: number; default_sanction: string; is_active: number }
type Student = { student_id: string; first_name: string; last_name: string; program: string; course: string }

export default function PrefectIncidentForm() {
  const { csrfToken } = usePrefectSession()
  const [violations, setViolations] = useState<Violation[]>([])
  const [studentQuery, setStudentQuery] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [student, setStudent] = useState<Student | null>(null)
  const [form, setForm] = useState({ student_id: "", violation_id: "", severity: "a", description: "", incident_at: "", reported_by: "", status: "open", sanction_applied: "" })
  const [error, setError] = useState("")
  const [saved, setSaved] = useState("")
  const [busy, setBusy] = useState(false)
  useEffect(() => { request<{ violations: Violation[] }>("catalog.php?resource=violations").then((data) => setViolations(data.violations.filter((v) => Number(v.is_active)))).catch((err: Error) => setError(err.message)) }, [])
  async function searchStudents() {
    try { const data = await request<{ matches: Student[] }>(`catalog.php?resource=students&q=${encodeURIComponent(studentQuery)}`); setStudents(data.matches) }
    catch (err) { setError(err instanceof Error ? err.message : "Student search failed.") }
  }
  function chooseStudent(item: Student) {
    setStudent(item); setStudents([]); setForm((f) => ({ ...f, student_id: item.student_id }))
  }
  function chooseViolation(id: string) {
    const violation = violations.find((item) => String(item.id) === id)
    setForm((f) => ({ ...f, violation_id: id, severity: violation?.severity || f.severity, sanction_applied: violation?.default_sanction || "" }))
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setSaved("")
    try {
      const data = await jsonPost<{ incident_id: number }>(
        { action: "add", ...form, violation_id: Number(form.violation_id) }, csrfToken,
      )
      setSaved("Incident recorded successfully.")
      window.location.href = `${ROUTES.incidents}/${data.incident_id}`
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to file incident.") }
    finally { setBusy(false) }
  }
  return <Page title="File incident">
    <a href={ROUTES.incidents} className="text-sm font-semibold text-amber-900 underline">← Back to incidents</a>
    {error && <ErrorMessage>{error}</ErrorMessage>}
    {saved && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{saved}</p>}
    <div className="grid gap-4 rounded-xl border bg-white p-5 md:grid-cols-2">
      <div className="md:col-span-2">
        <Field label="Find student by ID or name">
          <div className="flex gap-2">
            <input value={studentQuery} onChange={(e) => setStudentQuery(e.target.value)} className={inputClass} placeholder="Enter student ID or name" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void searchStudents() } }} />
            <button type="button" onClick={() => void searchStudents()} className="rounded-lg bg-slate-900 px-4 text-sm font-bold text-white">Find</button>
          </div>
        </Field>
        {students.length > 0 && <ul className="mt-2 divide-y rounded-lg border">{students.map((item) => <li key={item.student_id}><button type="button" onClick={() => chooseStudent(item)} className="w-full p-3 text-left text-sm hover:bg-slate-50">{item.first_name} {item.last_name} — {item.student_id} <span className="text-slate-500">{item.program}</span></button></li>)}</ul>}
        {student && <p className="mt-2 rounded-lg bg-green-50 p-3 text-sm text-green-900">Selected: {student.first_name} {student.last_name} ({student.student_id})</p>}
      </div>
      <form onSubmit={submit} className="contents">
      <Field label="Violation"><select required value={form.violation_id} onChange={(e) => chooseViolation(e.target.value)} className={inputClass}><option value="">Select active violation</option>{violations.map((v) => <option key={v.id} value={v.id}>{v.name} · Category {v.severity.toUpperCase()} · {v.occurrences} occurrence(s)</option>)}</select></Field>
      <Field label="Category"><select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className={inputClass}><option value="a">Category A</option><option value="b">Category B</option><option value="c">Category C</option></select></Field>
      <Field label="Incident date and time"><input type="datetime-local" value={form.incident_at} onChange={(e) => setForm({ ...form, incident_at: e.target.value })} className={inputClass} /></Field>
      <Field label="Reported by"><input value={form.reported_by} onChange={(e) => setForm({ ...form, reported_by: e.target.value })} className={inputClass} maxLength={100} /></Field>
      <Field label="Status"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}><option value="open">Open</option><option value="under_review">Under review</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option></select></Field>
      <Field label="Sanction applied"><input value={form.sanction_applied} onChange={(e) => setForm({ ...form, sanction_applied: e.target.value })} className={inputClass} maxLength={255} /></Field>
      <div className="md:col-span-2"><Field label="Description"><textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} /></Field></div>
      <button disabled={busy || !csrfToken || !student} className="rounded-lg bg-amber-800 px-4 py-2.5 font-bold text-white disabled:opacity-50 md:col-span-2">{busy ? "Saving…" : "Record incident"}</button>
      </form>
    </div>
  </Page>
}
