import { useCallback, useEffect, useRef, useState, type FormEvent } from "react"
import { Camera, CameraOff, CheckCircle2, Clock3, LogIn, LogOut, Search, Square, XCircle } from "lucide-react"
import { Card, dateLabel, getPortal, LoadingState, Notice, PageHeading, PortalFrame, shortDate, useRequireInstructor, type AttendanceRecord } from "./portal"

type ScanResult = { success: boolean; message?: string; student_name?: string; time?: string; subject?: string; action?: string }
type QRCodeResult = { rawValue: string }
type QRDetector = { detect: (source: HTMLVideoElement) => Promise<QRCodeResult[]> }

function localDate() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

export default function InstructorScanner() {
  const portal = useRequireInstructor()
  const [mode, setMode] = useState<"time_in" | "time_out">("time_in")
  const [studentId, setStudentId] = useState("")
  const [result, setResult] = useState<{ ok: boolean; message: string; detail?: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState("")
  const [todayRows, setTodayRows] = useState<AttendanceRecord[]>([])
  const [todayCounts, setTodayCounts] = useState({ time_in: 0, time_out: 0 })
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const frameRef = useRef<number | null>(null)
  const runningRef = useRef(false)
  const detectionBusyRef = useRef(false)
  const scanHandlerRef = useRef<(value: string) => void>(() => {})

  const refreshToday = useCallback(async () => {
    const today = localDate()
    const data = await getPortal<{ records: AttendanceRecord[] }>("history", { from: today, to: today })
    setTodayRows(data.records)
    setTodayCounts({
      time_in: data.records.filter((record) => record.time_in).length,
      time_out: data.records.filter((record) => record.time_out).length,
    })
  }, [])

  const submitScan = useCallback(async (value: string) => {
    const id = value.trim()
    if (!id || submitting || !portal.csrfToken) return
    setSubmitting(true)
    setResult(null)
    try {
      const response = await fetch(`${(import.meta.env.VITE_API_URL || "").replace(/\/$/, "")}/instructor/php/api/portal.php`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Requested-With": "XMLHttpRequest" },
        body: new URLSearchParams({ action: "scan", scan_action: mode, student_id: id, csrf_token: portal.csrfToken }),
      })
      const data = await response.json() as ScanResult
      if (!response.ok || !data.success) throw new Error(data.message || `Scan failed (${response.status}).`)
      setResult({ ok: true, message: data.message || "Attendance recorded.", detail: `${mode === "time_in" ? "Time In" : "Time Out"} · ${data.time || ""}${data.subject ? ` · ${data.subject}` : ""}` })
      setStudentId("")
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : "Could not record attendance." })
    } finally {
      setSubmitting(false)
      try { await refreshToday() } catch { /* Keep the scan result visible when refreshing fails. */ }
    }
  }, [mode, portal.csrfToken, refreshToday, submitting])

  scanHandlerRef.current = (value) => { void submitScan(value) }

  useEffect(() => {
    if (!portal.instructor) return
    void refreshToday().catch((err) => setCameraError(err instanceof Error ? err.message : "Could not load today’s attendance."))
  }, [portal.instructor, refreshToday])

  const stopCamera = useCallback(() => {
    runningRef.current = false
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraActive(false)
  }, [])

  useEffect(() => () => {
    runningRef.current = false
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    streamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  const startCamera = async () => {
    setCameraError("")
    const Detector = (window as unknown as { BarcodeDetector?: new (options: { formats: string[] }) => QRDetector }).BarcodeDetector
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is unavailable in this browser or connection. Enter the student ID manually.")
      return
    }
    if (!Detector) {
      setCameraError("This browser does not provide QR detection. Enter the student ID manually.")
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false })
      streamRef.current = stream
      setCameraActive(true)
      const video = videoRef.current
      if (!video) throw new Error("Camera preview could not be initialized.")
      video.srcObject = stream
      await video.play()
      const detector = new Detector({ formats: ["qr_code"] })
      runningRef.current = true
      const detectFrame = async () => {
        if (!runningRef.current || !videoRef.current) return
        try {
          if (!detectionBusyRef.current && videoRef.current.readyState >= 2) {
            const codes = await detector.detect(videoRef.current)
            const value = codes[0]?.rawValue?.trim()
            if (value) {
              detectionBusyRef.current = true
              scanHandlerRef.current(value)
              window.setTimeout(() => { detectionBusyRef.current = false }, 2500)
            }
          }
        } catch {
          setCameraError("Could not read this QR code. Keep the student code in view or enter the ID manually.")
        }
        if (runningRef.current) frameRef.current = requestAnimationFrame(() => { void detectFrame() })
      }
      frameRef.current = requestAnimationFrame(() => { void detectFrame() })
    } catch (err) {
      stopCamera()
      setCameraError(err instanceof Error ? err.message : "Could not access the camera. Check browser permissions or enter the ID manually.")
    }
  }

  const submitManual = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!studentId.trim()) return
    void submitScan(studentId)
  }

  return <PortalFrame instructor={portal.instructor} csrfToken={portal.csrfToken}>
    {portal.loading ? <LoadingState /> : <>
      {portal.error && <Notice>{portal.error}</Notice>}
      <PageHeading title="NSTP attendance scanner" description="Choose the scan action before reading a QR code. Duplicate scans are rejected by the attendance rules." />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-green-100 bg-white p-4 text-center"><p className="text-xs font-bold uppercase tracking-widest text-gray-400">Time In today</p><p className="mt-1 text-3xl font-black text-[#187C19]">{todayCounts.time_in}</p></div>
        <div className="rounded-2xl border border-amber-100 bg-white p-4 text-center"><p className="text-xs font-bold uppercase tracking-widest text-gray-400">Time Out today</p><p className="mt-1 text-3xl font-black text-amber-600">{todayCounts.time_out}</p></div>
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Card title="Scan a student">
          <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
            <button type="button" aria-pressed={mode === "time_in"} onClick={() => setMode("time_in")} className={`inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold ${mode === "time_in" ? "bg-[#187C19] text-white shadow" : "text-gray-600 hover:bg-white"}`}><LogIn className="h-4 w-4" />Time In</button>
            <button type="button" aria-pressed={mode === "time_out"} onClick={() => setMode("time_out")} className={`inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold ${mode === "time_out" ? "bg-amber-500 text-white shadow" : "text-gray-600 hover:bg-white"}`}><LogOut className="h-4 w-4" />Time Out</button>
          </div>
          <div className={`overflow-hidden rounded-xl bg-black ${cameraActive ? "block" : "hidden"}`}>
            <video ref={videoRef} autoPlay muted playsInline className="max-h-80 w-full object-cover" />
          </div>
          <div className="mt-3 flex gap-2">
            {!cameraActive ? <button type="button" onClick={() => void startCamera()} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#187C19] px-4 py-3 font-bold text-white hover:bg-green-800"><Camera className="h-4 w-4" />Start camera</button> :
              <button type="button" onClick={stopCamera} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700"><Square className="h-4 w-4" />Stop camera</button>}
          </div>
          {cameraError && <div className="mt-3"><Notice>{cameraError}</Notice></div>}
          <div className="my-5 flex items-center gap-3 text-xs text-gray-400"><span className="h-px flex-1 bg-gray-200" />OR ENTER ID MANUALLY<span className="h-px flex-1 bg-gray-200" /></div>
          <form onSubmit={submitManual} className="flex gap-2">
            <input value={studentId} onChange={(event) => setStudentId(event.target.value)} aria-label="Student ID" placeholder="Student ID or QR content" className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#187C19] focus:ring-2 focus:ring-green-100" />
            <button type="submit" disabled={submitting || !studentId.trim()} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 font-bold text-white hover:bg-gray-700 disabled:opacity-50"><Search className="h-4 w-4" /><span className="sr-only">Submit scan</span></button>
          </form>
          {submitting && <p className="mt-3 text-sm text-gray-500">Recording attendance…</p>}
          {result && <div className={`mt-4 flex items-start gap-3 rounded-xl border p-4 ${result.ok ? "border-green-200 bg-green-50 text-green-900" : "border-red-200 bg-red-50 text-red-900"}`}>
            {result.ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0" />}
            <div><p className="font-bold">{result.message}</p>{result.detail && <p className="mt-1 text-sm opacity-75">{result.detail}</p>}</div>
          </div>}
        </Card>
        <Card title="Today’s scans">
          {!todayRows.length ? <div className="py-8 text-center"><CameraOff className="mx-auto h-8 w-8 text-gray-300" /><p className="mt-2 text-sm text-gray-500">No attendance records for your subjects today.</p></div> : <div className="space-y-2">
            {todayRows.map((row) => <div key={row.id} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-3">
              <div className="min-w-0"><p className="truncate text-sm font-bold">{row.first_name} {row.last_name}</p><p className="text-xs text-gray-500">{row.student_id} · {row.subject_code}</p></div>
              <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${row.time_out ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}><Clock3 className="h-3.5 w-3.5" />{row.time_out ? dateLabel(row.time_out) : row.time_in ? dateLabel(row.time_in) : shortDate(row.session_date)}</span>
            </div>)}
          </div>}
        </Card>
      </div>
    </>}
  </PortalFrame>
}
