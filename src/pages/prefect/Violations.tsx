import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { catalogPost, request, usePrefectSession } from "./_api"
import { ErrorMessage, Field, Page, inputClass } from "./_shared"

type Violation = { id: number; name: string; severity: string; occurrences: number; default_sanction: string; is_active: number; sort_order: number; case_count: number }
const blank = { id: 0, name: "", severity: "a", occurrences: 1, default_sanction: "", is_active: 1, sort_order: 0 }

export default function PrefectViolations() {
  const { csrfToken } = usePrefectSession()
  const [rows, setRows] = useState<Violation[]>([])
  const [form, setForm] = useState(blank)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  async function load() {
    try { const data = await request<{ violations: Violation[] }>("catalog.php?resource=violations"); setRows(data.violations) }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to load violations.") }
  }
  useEffect(() => { void load() }, [])
  async function submit(e: FormEvent) {
    e.preventDefault(); setError(""); setMessage("")
    try {
      const data = await catalogPost<{ message: string }>({ ...form, action: form.id ? "update" : "add" }, csrfToken)
      setMessage(data.message || "Saved."); setForm(blank); await load()
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to save violation.") }
  }
  async function toggle(row: Violation) {
    try { await catalogPost({ action: "toggle", id: row.id, is_active: !Number(row.is_active) }, csrfToken); await load() }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to update violation.") }
  }
  return <Page title="Violation catalog">
    {error && <ErrorMessage>{error}</ErrorMessage>}{message && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{message}</p>}
    <div className="grid items-start gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase"><tr>{["Violation", "Category", "Occurrences", "Cases", "Status", "Actions"].map((h) => <th key={h} className="px-3 py-3">{h}</th>)}</tr></thead>
          <tbody className="divide-y">{rows.map((row) => <tr key={row.id}>
            <td className="px-3 py-3 font-semibold">{row.name}<span className="block text-xs font-normal text-slate-500">{row.default_sanction || "No default sanction"}</span></td>
            <td className="px-3 py-3 uppercase">{row.severity}</td><td className="px-3 py-3">{row.occurrences}</td><td className="px-3 py-3">{row.case_count}</td><td className="px-3 py-3">{Number(row.is_active) ? "Active" : "Inactive"}</td>
            <td className="space-x-2 px-3 py-3"><button onClick={() => setForm({ id: row.id, name: row.name, severity: row.severity, occurrences: row.occurrences, default_sanction: row.default_sanction || "", is_active: Number(row.is_active), sort_order: row.sort_order })} className="font-semibold text-amber-900 underline">Edit</button><button onClick={() => void toggle(row)} className="font-semibold text-slate-700 underline">{Number(row.is_active) ? "Deactivate" : "Activate"}</button></td>
          </tr>)}
          {rows.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500">No violations configured.</td></tr>}</tbody>
        </table>
      </div>
      <form onSubmit={submit} className="space-y-4 rounded-xl border bg-white p-5">
        <h2 className="text-lg font-bold">{form.id ? "Edit violation" : "Add violation"}</h2>
        <Field label="Name"><input required maxLength={150} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} /></Field>
        <Field label="Category"><select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className={inputClass}><option value="a">Category A</option><option value="b">Category B</option><option value="c">Category C</option></select></Field>
        <Field label="Occurrences"><input type="number" min="0" value={form.occurrences} onChange={(e) => setForm({ ...form, occurrences: Number(e.target.value) })} className={inputClass} /></Field>
        <Field label="Default sanction"><input maxLength={255} value={form.default_sanction} onChange={(e) => setForm({ ...form, default_sanction: e.target.value })} className={inputClass} /></Field>
        <Field label="Sort order"><input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className={inputClass} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(form.is_active)} onChange={(e) => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })} />Active</label>
        <div className="flex gap-2"><button disabled={!csrfToken} className="rounded-lg bg-amber-800 px-4 py-2 font-bold text-white">Save</button>{form.id > 0 && <button type="button" onClick={() => setForm(blank)} className="rounded-lg border px-4 py-2 font-semibold">Cancel</button>}</div>
      </form>
    </div>
  </Page>
}
