import { useCallback, useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { ArrowLeft, Award, Printer } from "lucide-react"
import { getNstpRecord, getSharedCsrfToken, markNstpCertificateIssued, nstpDateTime, nstpDuration, nstpFullName, type NstpRecord } from "./studentNstp"

function sessionDate(value: string) {
  const date = new Date(`${value}T12:00:00`)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { dateStyle: "long" })
}

export default function StudentNstpCertificate() {
  const [searchParams] = useSearchParams()
  const attendanceId = searchParams.get("att_id") || ""
  const [record, setRecord] = useState<NstpRecord | null>(null)
  const [csrfToken, setCsrfToken] = useState("")
  const [loading, setLoading] = useState(true)
  const [issuing, setIssuing] = useState(false)
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
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : "Could not load certificate.") })
      .finally(() => { if (active) setLoading(false) })
    void getSharedCsrfToken()
      .then((token) => { if (active) setCsrfToken(token) })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : "Could not initialize secure certificate actions.") })
    return () => { active = false }
  }, [refreshRecord])

  const issueAndPrint = async () => {
    if (!record) return
    setError("")
    setSuccess("")
    setIssuing(true)
    try {
      const response = await markNstpCertificateIssued(record.id, csrfToken)
      setSuccess(response.message || "Certificate marked as issued.")
      await refreshRecord()
      window.print()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mark this certificate as issued.")
    } finally {
      setIssuing(false)
    }
  }

  const isIssued = Boolean(record?.certificate_issued_at)
  const certificateNumber = record ? `NSTP-${record.session_date.slice(0, 4)}-${String(record.id).padStart(4, "0")}` : ""
  const duration = record ? nstpDuration(record) : ""
  const backPath = record?.is_staff ? "/instructor/attendance" : "/attendance-record"

  return <main className="min-h-screen bg-[#f0faf0] px-4 pb-12 text-gray-900">
    <style>{`
      .nstp-cert-serif { font-family: Georgia, "Times New Roman", serif; }
      @media print {
        body { background: #fff !important; }
        .nstp-no-print { display: none !important; }
        .nstp-certificate { border: 3px solid #187C19 !important; outline: 1px solid #187C19 !important; outline-offset: 5px; box-shadow: none !important; }
        @page { size: landscape; margin: 12mm; }
      }
    `}</style>
    <div className="nstp-no-print mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 py-6">
      <Link to={backPath} className="inline-flex items-center gap-2 text-sm font-bold text-[#187C19] hover:underline"><ArrowLeft className="h-4 w-4" />Back</Link>
      {record?.is_staff && !isIssued ? <button onClick={() => void issueAndPrint()} disabled={loading || issuing || !csrfToken} className="inline-flex items-center gap-2 rounded-xl bg-[#187C19] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-green-900/10 hover:bg-green-800 disabled:opacity-50"><Award className="h-4 w-4" />{issuing ? "Marking issued…" : "Mark as Issued & Print"}</button> : <button onClick={() => window.print()} disabled={!record} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white hover:bg-gray-700 disabled:opacity-50"><Printer className="h-4 w-4" />Print / Save PDF</button>}
    </div>
    <div className="mx-auto max-w-5xl">
      {loading ? <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500">Loading certificate…</div> : error && !record ? <Message tone="error">{error}</Message> : record && <>
        {error && <div className="nstp-no-print mb-4"><Message tone="error">{error}</Message></div>}
        {success && <div className="nstp-no-print mb-4"><Message tone="success">{success}</Message></div>}
        <article className="nstp-certificate relative rounded-xl border-[3px] border-[#187C19] bg-white p-7 shadow-xl outline outline-1 outline-[#187C19] outline-offset-[5px] sm:p-12">
          <header className="mb-7 flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-100 bg-white text-[#187C19] shadow-sm"><Award className="h-7 w-7" /></div>
            <div><p className="text-lg font-black tracking-tight text-gray-800">SQUARED</p><p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.3em] text-[#187C19]">National Service Training Program</p></div>
          </header>
          <div className="text-center">
            <p className="nstp-cert-serif text-3xl font-black tracking-wide text-[#187C19] sm:text-4xl">Certificate of Participation</p>
            <div className="mx-auto my-5 h-1 w-40 rounded-full bg-green-100" />
            <p className="mb-7 text-sm font-semibold text-gray-500">This is to certify that</p>
            <p className="nstp-cert-serif break-words text-3xl font-black tracking-wide text-gray-900 sm:text-4xl">{nstpFullName(record)}</p>
            <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-gray-600">
              has satisfactorily participated in the NSTP session <strong className="text-gray-900">{record.subject_name || record.subject_code}</strong>
              {" "}(<code className="rounded bg-green-50 px-2 py-0.5 text-[11px] font-bold text-green-700">{record.subject_code || "—"}</code>)
              {" "}held on <strong className="text-gray-900">{sessionDate(record.session_date)}</strong>
              {" "}with a duration of <strong className="text-gray-900">{duration || "—"}</strong>.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-x-6 gap-y-7 text-center sm:grid-cols-3">
            <CertificateField value={record.subject_code || "—"} label="NSTP Subject" />
            <CertificateField value={record.certificate_issued_at ? nstpDateTime(record.certificate_issued_at, { dateStyle: "long" }) : "__________"} label="Date Issued" />
            <CertificateField value={certificateNumber} label="Certificate No." />
          </div>
          <div className="mt-10 flex justify-center gap-12 text-center sm:gap-24">
            <div className="min-w-36"><div className="mb-2 border-t border-gray-300" /><p className="text-xs font-bold uppercase tracking-widest text-gray-500">NSTP Coordinator</p></div>
            <div className="min-w-36"><div className="mb-2 border-t border-gray-300" /><p className="text-xs font-bold uppercase tracking-widest text-gray-500">Program Head</p></div>
          </div>
          <div className="absolute bottom-5 right-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-[#187C19] text-center text-[9px] font-black leading-tight text-[#187C19] sm:bottom-8 sm:right-8 sm:h-[84px] sm:w-[84px]">SQUARED<br />NSTP</div>
        </article>
        <p className="nstp-no-print mt-6 text-center text-xs text-gray-400">Use Print / Save PDF to print or download this certificate.</p>
      </>}
    </div>
  </main>
}

function CertificateField({ value, label }: { value: string; label: string }) {
  return <div><p className="min-h-5 text-sm font-black text-gray-800">{value}</p><div className="mt-5 border-t border-gray-300 pt-2"><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p></div></div>
}

function Message({ tone, children }: { tone: "error" | "success"; children: string }) {
  return <div role="status" className={`rounded-xl border p-4 text-sm font-semibold ${tone === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-green-200 bg-green-50 text-green-800"}`}>{children}</div>
}
