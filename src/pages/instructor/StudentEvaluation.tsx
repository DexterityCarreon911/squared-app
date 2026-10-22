import { useCallback, useEffect, useState, type FormEvent } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { ArrowLeft, ClipboardCheck, Send } from "lucide-react"
import { getNstpRecord, getSharedCsrfToken, evaluationSections, evaluationTextFields, nstpDateTime, nstpDuration, ratingLabels, submitNstpEvaluation, type NstpRecord } from "./studentNstp"

function localDate(value: string) {
  const date = new Date(`${value}T12:00:00`)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { dateStyle: "long" })
}

export default function StudentNstpEvaluation() {
  const [searchParams] = useSearchParams()
  const attendanceId = searchParams.get("att_id") || ""
  const [record, setRecord] = useState<NstpRecord | null>(null)
  const [csrfToken, setCsrfToken] = useState("")
  const [ratings, setRatings] = useState<Record<string, string>>({})
  const [texts, setTexts] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const refreshRecord = useCallback(async () => {
    if (!attendanceId || !/^\d+$/.test(attendanceId)) throw new Error("A valid NSTP attendance record ID is required.")
    const loaded = await getNstpRecord(attendanceId)
    setRecord(loaded)
    return loaded
  }, [attendanceId])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError("")
    void refreshRecord()
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : "Could not load NSTP evaluation.") })
      .finally(() => { if (active) setLoading(false) })
    void getSharedCsrfToken()
      .then((token) => { if (active) setCsrfToken(token) })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : "Could not initialize secure form submission.") })
    return () => { active = false }
  }, [refreshRecord])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!record) return
    setError("")
    setSuccess("")
    setSubmitting(true)
    try {
      const values: Record<string, string> = { ...ratings }
      evaluationTextFields.forEach(([key]) => { values[key] = texts[key] || "" })
      const response = await submitNstpEvaluation(record.id, csrfToken, values)
      setSuccess(response.message || "Evaluation submitted. Your NSTP attendance is now confirmed.")
      await refreshRecord()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit this evaluation.")
    } finally {
      setSubmitting(false)
    }
  }

  const submitted = record?.evaluation_status !== "pending"
  const date = record ? localDate(record.session_date) : ""
  const duration = record ? nstpDuration(record) : ""

  return <main className="min-h-screen bg-[#fafafa] px-4 py-8 text-gray-900 sm:px-6">
    <div className="mx-auto max-w-3xl">
      <Link to="/attendance-record" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#187C19] hover:underline"><ArrowLeft className="h-4 w-4" />Back to attendance</Link>
      <header className="mb-7">
        <h1 className="text-3xl font-black tracking-tight">NSTP Evaluation Form</h1>
        <p className="mt-2 text-sm text-gray-500">Your honest feedback helps improve future NSTP sessions.</p>
      </header>
      {loading ? <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500">Loading attendance and evaluation…</div> : error && !record ? <Message tone="error">{error}</Message> : record && <>
        {error && <div className="mb-4"><Message tone="error">{error}</Message></div>}
        {success && <div className="mb-4"><Message tone="success">{success}</Message></div>}
        <section className="mb-5 rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-[#187C19]"><ClipboardCheck className="h-6 w-6" /></span>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#187C19]">NSTP Attendance</p>
              <h2 className="mt-1 truncate text-xl font-black">{record.subject_name || record.subject_code}</h2>
              <p className="mt-1 text-sm text-gray-500">{record.first_name} {record.last_name} · {date}{record.time_in ? ` · In ${nstpDateTime(record.time_in, { hour: "numeric", minute: "2-digit" })}` : ""}{record.time_out ? ` · Out ${nstpDateTime(record.time_out, { hour: "numeric", minute: "2-digit" })}` : ""}{duration ? ` · ${duration}` : ""}</p>
            </div>
          </div>
        </section>

        {submitted ? <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#187C19]">Confirmed</span>
            <span className="text-sm text-gray-500">Evaluation submitted {record.evaluation_submitted_at ? nstpDateTime(record.evaluation_submitted_at) : ""}</span>
          </div>
          {[...evaluationSections.map((section) => ({ title: section.title, fields: section.fields })), { title: "Open-Ended Questions", fields: evaluationTextFields }].map((section, sectionIndex) => <section key={section.title} className={sectionIndex ? "mt-8 border-t border-green-100 pt-7" : ""}>
            <h3 className="mb-1 text-lg font-black">{section.title}</h3>
            <div className="mt-4 space-y-4">{section.fields.map(([key, label]) => {
              const value = record.evaluation_data?.[key]
              const rating = typeof value === "number" ? value : Number(value)
              const isRating = key !== "like_reason" && key !== "significant_learning" && key !== "would_be_successful_if" && key !== "other_comments"
              return <div key={key} className="border-b border-gray-100 pb-4 last:border-0">
                <p className="text-sm font-bold">{label}</p>
                {isRating ? <p className="mt-2 text-sm font-semibold text-[#187C19]">{Number.isInteger(rating) && ratingLabels[rating] ? `${rating} · ${ratingLabels[rating]}` : "—"}</p> : <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{value ? String(value) : "—"}</p>}
              </div>
            })}</div>
          </section>)}
        </section> : record.is_owner ? <form onSubmit={submit} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-8 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-gray-500">Rating Scale</p>
            <div className="grid grid-cols-5 gap-2 text-center">{[1, 2, 3, 4, 5].map((rating) => <div key={rating}><span className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${["bg-red-100 text-red-700", "bg-orange-100 text-orange-700", "bg-yellow-100 text-yellow-800", "bg-lime-100 text-lime-800", "bg-green-100 text-green-800"][rating - 1]}`}>{rating}</span><span className="mt-1 block text-[10px] font-bold text-gray-500">{ratingLabels[rating]}</span></div>)}</div>
          </div>
          {evaluationSections.map((section, sectionIndex) => <section key={section.title} className={sectionIndex ? "mt-8 border-t border-green-100 pt-7" : ""}>
            <h2 className="text-xl font-black">{section.title}</h2><p className="mt-1 text-sm text-gray-500">{section.description}</p>
            <div className="mt-6 space-y-6">{section.fields.map(([key, label, description]) => <fieldset key={key}>
              <legend className="text-sm font-bold">{label} <span className="text-red-500">*</span></legend>
              <p className="mt-1 text-xs text-gray-500">{description}</p>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((rating) => <label key={rating} className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border p-2 text-center transition ${ratings[key] === String(rating) ? "border-[#187C19] bg-green-50 text-[#187C19]" : "border-gray-100 hover:border-green-200"}`}>
                  <input type="radio" name={key} value={rating} required checked={ratings[key] === String(rating)} onChange={(event) => setRatings((current) => ({ ...current, [key]: event.target.value }))} className="sr-only" />
                  <span className="text-lg font-black">{rating}</span><span className="text-[9px] font-bold leading-tight text-gray-500">{ratingLabels[rating]}</span>
                </label>)}
              </div>
            </fieldset>)}</div>
          </section>)}
          <section className="mt-8 border-t border-green-100 pt-7">
            <h2 className="text-xl font-black">Open-Ended Questions</h2><p className="mt-1 text-sm text-gray-500">Share your thoughts and feedback about the activity.</p>
            <div className="mt-5 space-y-5">{evaluationTextFields.map(([key, label, description, placeholder]) => <label key={key} className="block">
              <span className="text-sm font-bold">{label}</span><span className="mt-1 block text-xs text-gray-500">{description}</span>
              <textarea value={texts[key] || ""} onChange={(event) => setTexts((current) => ({ ...current, [key]: event.target.value }))} maxLength={2000} rows={3} placeholder={placeholder} className="mt-2 w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#187C19] focus:ring-2 focus:ring-green-100" />
            </label>)}</div>
          </section>
          <button type="submit" disabled={submitting || !csrfToken} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#187C19] px-5 py-4 text-sm font-black text-white shadow-lg shadow-green-900/10 transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-4 w-4" />{submitting ? "Submitting evaluation…" : "Submit Evaluation & Confirm Attendance"}</button>
          <p className="mt-3 text-center text-xs text-gray-400">Your responses will be used to improve future NSTP sessions.</p>
        </form> : <section className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
          <p className="font-bold text-amber-700">Awaiting student evaluation</p><p className="mt-1 text-sm text-gray-500">The student assigned to this attendance record must complete the evaluation form before attendance is confirmed.</p>
        </section>}
      </>}
    </div>
  </main>
}

function Message({ tone, children }: { tone: "error" | "success"; children: string }) {
  return <div role="status" className={`rounded-xl border p-4 text-sm font-semibold ${tone === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-green-200 bg-green-50 text-green-800"}`}>{children}</div>
}
