import { useCallback, useEffect, useState } from "react"
import type { FormEvent } from "react"
import { useParams } from "react-router-dom"
import { jsonPost, request, ROUTES, usePrefectSession } from "./_api"
import { ErrorMessage, Field, Page, StatusText, inputClass } from "./_shared"

type Incident = {
  id: number; case_no: string; student_id: string; first_name: string; last_name: string; program: string; course: string
  violation_id: number; violation_name: string; severity: string; occurrences_applied: number; status: string
  description: string; incident_at: string; reported_by: string; sanction_applied: string
}
type Action = { id: number; action_type: string; note: string; display_name: string; created_at: string }
type Violation = { id: number; name: string; is_active: number }

export default function PrefectIncidentDetail() {
  const { id = "" } = useParams()
  const { csrfToken } = usePrefectSession()
  const [incident, setIncident] = useState<Incident | null>(null)
  const [timeline, setTimeline] = useState<Action[]>([])
  const [violations, setViolations] = useState<Violation[]>([])
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const [data, catalog] = await Promise.all([
        request<{ incident: Incident; timeline: Action[] }>(`incidents.php?id=${encodeURIComponent(id)}`),
        request<{ violations: Violation[] }>("catalog.php?resource=violations"),
      ])
      setIncident(data.incident); setTimeline(data.timeline); setViolations(catalog.violations)
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to load incident.") }
  }, [id])
  useEffect(() => { void load() }, [load])

  async function perform(body: object) {
    if (!csrfToken) return
    setBusy(true); setError(""); setMessage("")
    try { const data = await jsonPost<{ message: string }>(body, csrfToken); setMessage(data.message || "Saved."); await load() }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to save changes.") }
    finally { setBusy(false) }
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!incident) return
    const values = new FormData(event.currentTarget)
    await perform({
      action: "update", incident_id: incident.id, student_id: values.get("student_id"),
      violation_id: Number(values.get("violation_id")), severity: values.get("severity"),
      description: values.get("description"), incident_at: values.get("incident_at"),
      reported_by: values.get("reported_by"), status: values.get("status"),
      sanction_applied: values.get("sanction_applied"),
    })
  }

  if (!incident) return <Page title="Incident detail">{error ? <ErrorMessage>{error}</ErrorMessage> : <p>Loading incident…</p>}</Page>
  const dateValue = incident.incident_at ? incident.incident_at.replace(" ", "T").slice(0, 16) : ""
  return <Page title={incident.case_no}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <a href={ROUTES.incidents} className="text-sm font-semibold text-amber-900 underline">← All incidents</a>
      <div className="flex items-center gap-2"><StatusText status={incident.status} /><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">Category {incident.severity.toUpperCase()}</span></div>
    </div>
    {error && <ErrorMessage>{error}</ErrorMessage>}
    {message && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{message}</p>}
    <section className="rounded-xl border bg-white p-5">
      <h2 className="mb-4 text-lg font-bold">Case details</h2>
      <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
        <Field label="Student ID"><input required name="student_id" defaultValue={incident.student_id} className={inputClass} /></Field>
        <Field label="Violation"><select required name="violation_id" defaultValue={incident.violation_id} className={inputClass}>{violations.map((violation) => <option key={violation.id} value={violation.id}>{violation.name}{Number(violation.is_active) ? "" : " (inactive)"}</option>)}</select><span className="text-xs font-normal text-slate-500">{incident.violation_name}</span></Field>
        <Field label="Category"><select name="severity" defaultValue={incident.severity} className={inputClass}><option value="a">Category A</option><option value="b">Category B</option><option value="c">Category C</option></select></Field>
        <Field label="Status"><select name="status" defaultValue={incident.status} className={inputClass}><option value="open">Open</option><option value="under_review">Under review</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option></select></Field>
        <Field label="Incident date and time"><input type="datetime-local" name="incident_at" defaultValue={dateValue} className={inputClass} /></Field>
        <Field label="Reported by"><input name="reported_by" defaultValue={incident.reported_by || ""} className={inputClass} /></Field>
        <Field label="Sanction applied"><input name="sanction_applied" defaultValue={incident.sanction_applied || ""} className={inputClass} /></Field>
        <Field label="Description"><textarea rows={3} name="description" defaultValue={incident.description || ""} className={inputClass} /></Field>
        <button disabled={busy || !csrfToken} className="rounded-lg bg-amber-800 px-4 py-2.5 font-bold text-white disabled:opacity-50 md:col-span-2">{busy ? "Saving…" : "Save case details"}</button>
      </form>
    </section>
    <section className="grid gap-4 md:grid-cols-2">
      <form onSubmit={(e) => { e.preventDefault(); void perform({ action: "status", incident_id: incident.id, status: new FormData(e.currentTarget).get("status") }) }} className="space-y-3 rounded-xl border bg-white p-5">
        <h2 className="font-bold">Change status</h2>
        <select name="status" defaultValue={incident.status} className={inputClass}><option value="open">Open</option><option value="under_review">Under review</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option></select>
        <button disabled={busy || !csrfToken} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white">Update status</button>
      </form>
      <form onSubmit={(e) => { e.preventDefault(); void perform({ action: "sanction", incident_id: incident.id, sanction_applied: new FormData(e.currentTarget).get("sanction_applied") }) }} className="space-y-3 rounded-xl border bg-white p-5">
        <h2 className="font-bold">Set sanction</h2>
        <input name="sanction_applied" defaultValue={incident.sanction_applied || ""} maxLength={255} className={inputClass} />
        <button disabled={busy || !csrfToken} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white">Save sanction</button>
      </form>
    </section>
    <form onSubmit={(e) => { e.preventDefault(); void perform({ action: "note", incident_id: incident.id, note }); setNote("") }} className="space-y-3 rounded-xl border bg-white p-5">
      <h2 className="font-bold">Add case note</h2>
      <textarea required rows={3} value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} placeholder="Add a note to the audit timeline" />
      <button disabled={busy || !csrfToken} className="rounded-lg bg-amber-800 px-4 py-2 text-sm font-bold text-white">Add note</button>
    </form>
    <section className="rounded-xl border bg-white p-5">
      <h2 className="mb-3 text-lg font-bold">Timeline</h2>
      <ol className="space-y-3">{timeline.map((item) => <li key={item.id} className="border-l-2 border-amber-200 pl-3"><p className="text-sm">{item.note}</p><p className="mt-1 text-xs text-slate-500">{item.display_name || "System"} · {item.created_at} · {item.action_type.replaceAll("_", " ")}</p></li>)}
        {timeline.length === 0 && <li className="text-sm text-slate-500">No timeline entries.</li>}</ol>
    </section>
  </Page>
}
