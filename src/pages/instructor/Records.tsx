import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react"
import { Download, Award, CalendarCheck2, Filter, Star } from "lucide-react"
import { Card, dateLabel, getPortal, LoadingState, Notice, PageHeading, PortalFrame, shortDate, useRequireInstructor, postPortal, type AttendanceRecord } from "./portal"

export type RecordPageMode = "history" | "reports" | "evaluations" | "certificates"

function mondayThisWeek() {
  const date = new Date()
  const day = date.getDay() || 7
  date.setDate(date.getDate() - day + 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function sundayThisWeek() {
  const date = new Date()
  const day = date.getDay() || 7
  date.setDate(date.getDate() + 7 - day)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

const config: Record<RecordPageMode, { title: string; description: string; action: string }> = {
  history: { title: "Scan history", description: "Review attendance records for your assigned NSTP subjects.", action: "history" },
  reports: { title: "Attendance reports", description: "Filter attendance by subject and date, then export the matching records.", action: "history" },
  evaluations: { title: "NSTP evaluations", description: "Review student-submitted evaluation responses for your subjects. Instructors can review but cannot submit student evaluations.", action: "evaluations" },
  certificates: { title: "NSTP certificates", description: "Review attendance records and record certificate issuance for your assigned subjects.", action: "certificates" },
}

function csvCell(value: unknown) {
  let text = String(value ?? "").replace(/[\r\n]+/g, " ")
  if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

function duration(record: AttendanceRecord) {
  if (!record.time_in || !record.time_out) return "—"
  const start = new Date(record.time_in.replace(" ", "T")).getTime()
  const end = new Date(record.time_out.replace(" ", "T")).getTime()
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return "—"
  const minutes = Math.floor((end - start) / 60000)
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`
}

export default function InstructorRecords({ mode }: { mode: RecordPageMode }) {
  const portal = useRequireInstructor()
  const page = config[mode]
  const [from, setFrom] = useState(mondayThisWeek)
  const [to, setTo] = useState(sundayThisWeek)
  const [subject, setSubject] = useState("")
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const [issuingId, setIssuingId] = useState<number | null>(null)

  useEffect(() => {
    if (!portal.instructor) return
    let active = true
    setLoading(true)
    setError("")
    const params: Record<string, string> = { from, to }
    if (subject) params.subject = subject
    getPortal<{ records: AttendanceRecord[] }>(page.action, params)
      .then((data) => { if (active) setRecords(data.records) })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : "Could not load attendance records.") })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [portal.instructor, page.action, from, to, subject, refreshKey])

  const durationSummary = useMemo(() => records.filter((record) => record.time_out).length, [records])

  const submitFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setRefreshKey((value) => value + 1)
  }

  const exportCsv = () => {
    if (!records.length) return
    const headings = ["Student ID", "Student Name", "Subject", "Date", "Time In", "Time Out", "Duration", "Evaluation Status", "Certificate Issued"]
    const lines = records.map((row) => [
      row.student_id, `${row.first_name} ${row.last_name}`, row.subject_code, row.session_date,
      row.time_in || "", row.time_out || "", duration(row), row.evaluation_status || "confirmed", row.certificate_issued_at || "",
    ].map(csvCell).join(","))
    const blob = new Blob(["\uFEFF", headings.map(csvCell).join(","), "\r\n", lines.join("\r\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `nstp-${mode}-${from}-to-${to}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const issueCertificate = async (record: AttendanceRecord) => {
    setIssuingId(record.id)
    setError("")
    setNotice("")
    try {
      const result = await postPortal<{ message?: string }>("issue_certificate", portal.csrfToken, { nstp_attendance_id: record.id })
      setNotice(result.message || "Certificate marked as issued.")
      setRefreshKey((value) => value + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update certificate status.")
    } finally {
      setIssuingId(null)
    }
  }

  let content: ReactNode
  if (mode === "evaluations") {
    content = !records.length ? <Empty text="No submitted NSTP evaluations were found for these filters." /> : <div className="space-y-4">
      {records.map((record) => <article key={record.id} className="rounded-xl border border-gray-100 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-3">
          <div><h3 className="font-bold">{record.first_name} {record.last_name} <span className="font-normal text-gray-500">· {record.student_id}</span></h3><p className="mt-1 text-xs text-gray-500">{record.subject_code} · {shortDate(record.session_date)}</p></div>
          <span className="text-xs text-gray-500">Submitted {dateLabel(record.evaluation_submitted_at)}</span>
        </div>
        {!record.evaluation_data || !Object.keys(record.evaluation_data).length ? <p className="pt-3 text-sm text-gray-500">Evaluation response is empty or unreadable.</p> : <dl className="grid gap-3 pt-4 sm:grid-cols-2">
          {Object.entries(record.evaluation_data).map(([key, value]) => <div key={key} className="rounded-lg bg-gray-50 p-3">
            <dt className="text-xs font-bold text-gray-500">{key.replace(/_/g, " ")}</dt>
            <dd className="mt-1 whitespace-pre-wrap break-words text-sm">{String(value ?? "—")}</dd>
          </div>)}
        </dl>}
      </article>)}
    </div>
  } else if (mode === "certificates") {
    content = !records.length ? <Empty text="No attendance records were found for these filters." /> : <div className="overflow-x-auto">
      <table className="w-full min-w-[690px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-gray-400"><tr><th className="pb-3">Student</th><th className="pb-3">Subject and date</th><th className="pb-3">Attendance</th><th className="pb-3">Certificate</th><th className="pb-3">Action</th></tr></thead>
        <tbody>{records.map((record) => <tr key={record.id} className="border-t border-gray-100">
          <td className="py-3 font-semibold">{record.first_name} {record.last_name}<span className="block text-xs font-normal text-gray-500">{record.student_id}</span></td>
          <td>{record.subject_code}<span className="block text-xs text-gray-500">{shortDate(record.session_date)}</span></td>
          <td className="text-xs text-gray-600">In: {dateLabel(record.time_in)}<br />Out: {dateLabel(record.time_out)}</td>
          <td>{record.certificate_issued_at ? <span className="text-xs font-semibold text-green-700">Issued {dateLabel(record.certificate_issued_at)}</span> : <span className="text-xs text-amber-700">Not issued</span>}</td>
          <td>{record.certificate_issued_at ? <span className="text-xs text-gray-400">Recorded</span> : <button disabled={issuingId !== null} onClick={() => void issueCertificate(record)} className="rounded-lg bg-[#187C19] px-3 py-2 text-xs font-bold text-white hover:bg-green-800 disabled:opacity-50">{issuingId === record.id ? "Saving…" : "Mark issued"}</button>}</td>
        </tr>)}</tbody>
      </table>
    </div>
  } else {
    content = !records.length ? <Empty text="No attendance records match the selected subject and date range." /> : <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-gray-400"><tr><th className="pb-3">Student</th><th className="pb-3">Subject</th><th className="pb-3">Date</th><th className="pb-3">Time In</th><th className="pb-3">Time Out</th><th className="pb-3">Duration</th><th className="pb-3">Evaluation</th><th className="pb-3">Certificate</th></tr></thead>
        <tbody>{records.map((record) => <tr key={record.id} className="border-t border-gray-100">
          <td className="py-3 font-semibold">{record.first_name} {record.last_name}<span className="block text-xs font-normal text-gray-500">{record.student_id}</span></td>
          <td>{record.subject_code}</td><td>{shortDate(record.session_date)}</td>
          <td>{record.time_in ? dateLabel(record.time_in) : "—"}</td><td>{record.time_out ? dateLabel(record.time_out) : "—"}</td><td>{duration(record)}</td>
          <td><span className={`rounded-full px-2 py-1 text-xs font-bold ${(record.evaluation_status || "confirmed") === "pending" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>{record.evaluation_status || "confirmed"}</span></td>
          <td>{record.certificate_issued_at ? "Issued" : "Not issued"}</td>
        </tr>)}</tbody>
      </table>
    </div>
  }

  const titleIcon = mode === "evaluations" ? <Star className="h-4 w-4 text-[#187C19]" /> : mode === "certificates" ? <Award className="h-4 w-4 text-[#187C19]" /> : <CalendarCheck2 className="h-4 w-4 text-[#187C19]" />
  return <PortalFrame instructor={portal.instructor} csrfToken={portal.csrfToken}>
    {portal.loading ? <LoadingState /> : <>
      {portal.error && <Notice>{portal.error}</Notice>}
      <PageHeading title={page.title} description={page.description} />
      {error && <Notice>{error}</Notice>}
      {notice && <Notice tone="success">{notice}</Notice>}
      <Card title={<span className="inline-flex items-center gap-2">{titleIcon}{mode === "reports" ? "Report filters" : "Filters"}</span>} aside={mode === "reports" && <button onClick={exportCsv} disabled={!records.length} className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-50"><Download className="h-4 w-4" />Export CSV</button>}>
        <form onSubmit={submitFilters} className="flex flex-wrap items-end gap-3">
          <label className="space-y-1 text-xs font-bold uppercase tracking-wide text-gray-500">Subject
            <select value={subject} onChange={(event) => setSubject(event.target.value)} className="block h-10 min-w-44 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-gray-900"><option value="">All my subjects</option>{portal.subjects.map((item) => <option key={item.subject_code} value={item.subject_code}>{item.subject_code}{item.subject_name ? ` — ${item.subject_name}` : ""}</option>)}</select>
          </label>
          <label className="space-y-1 text-xs font-bold uppercase tracking-wide text-gray-500">From
            <input type="date" required value={from} onChange={(event) => setFrom(event.target.value)} className="block h-10 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-900" />
          </label>
          <label className="space-y-1 text-xs font-bold uppercase tracking-wide text-gray-500">To
            <input type="date" required value={to} onChange={(event) => setTo(event.target.value)} className="block h-10 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-900" />
          </label>
          <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#187C19] px-4 text-sm font-bold text-white hover:bg-green-800"><Filter className="h-4 w-4" />Apply filters</button>
        </form>
      </Card>
      {mode === "reports" && !loading && !error && <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Attendance records" value={records.length} />
        <Metric label="With Time In" value={records.filter((record) => record.time_in).length} />
        <Metric label="With Time Out" value={durationSummary} />
      </div>}
      <Card title={mode === "evaluations" ? "Submitted evaluations" : mode === "certificates" ? "Certificate tracking" : "Attendance records"}>
        {loading ? <LoadingState message="Loading records…" /> : content}
      </Card>
    </>}
  </PortalFrame>
}

function Empty({ text }: { text: string }) {
  return <p className="py-7 text-center text-sm text-gray-500">{text}</p>
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border border-gray-100 bg-white p-4"><p className="text-xs font-semibold text-gray-500">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div>
}
