import { useCallback, useEffect, useRef, useState } from "react"
import { AlertCircle, Camera, CheckCircle, DoorOpen, Search, UserRound, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Guest {
  id: string
  name: string
  program?: string
  course?: string
}

interface Checkin {
  student_id: string
  student_name: string
  checked_in_at: string
}

interface BarcodeDetectorLike {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>
}

type BarcodeWindow = Window & {
  BarcodeDetector?: new (options?: { formats: string[] }) => BarcodeDetectorLike
}

interface ResultMessage {
  kind: "success" | "warning" | "error"
  title: string
  detail: string
  ticketId?: string
}

async function getToken() {
  const response = await fetch("/php/api/csrf_token.php", { credentials: "include" })
  const data = await response.json() as { csrf_token?: string; token?: string; data?: { csrf_token?: string; token?: string } }
  const token = data.csrf_token || data.token || data.data?.csrf_token || data.data?.token
  if (!response.ok || !token) throw new Error("Unable to retrieve a security token. Refresh the page and try again.")
  return token
}

async function postCheckin(studentId: string, action: "check" | "checkin", token: string) {
  const response = await fetch("/php/aurora_checkin_handler.php", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ student_id: studentId, action, csrf_token: token }),
  })
  const data = await response.json() as { success?: boolean; message?: string; already_checked_in?: boolean; checked_in_at?: string; ticket_id?: string }
  if (!response.ok) throw new Error(data.message || "Aurora check-in request failed.")
  return data
}

export default function AuroraCheckin() {
  const [manualId, setManualId] = useState("")
  const [guest, setGuest] = useState<Guest | null>(null)
  const [result, setResult] = useState<ResultMessage | null>(null)
  const [recent, setRecent] = useState<Checkin[]>([])
  const [total, setTotal] = useState(0)
  const [busy, setBusy] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [error, setError] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const loopRef = useRef<number | null>(null)
  const lastScannedRef = useRef("")

  const loadRecent = useCallback(async () => {
    const response = await fetch("/php/get_aurora_checkins.php?limit=20", { credentials: "include" })
    const data = await response.json() as { status: string; message?: string; transactions?: Checkin[]; total?: number }
    if (!response.ok || data.status !== "success") throw new Error(data.message || "Unable to load check-ins.")
    setRecent(data.transactions || [])
    setTotal(data.total || 0)
  }, [])

  useEffect(() => {
    loadRecent().catch((err: unknown) => setError(err instanceof Error ? err.message : "Unable to load check-ins."))
  }, [loadRecent])

  const stopCamera = useCallback(() => {
    if (loopRef.current !== null) window.clearTimeout(loopRef.current)
    loopRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraOn(false)
  }, [])

  useEffect(() => () => {
    if (loopRef.current !== null) window.clearTimeout(loopRef.current)
    streamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  const checkStudent = async (studentIdValue: string) => {
    const id = studentIdValue.trim()
    if (!id) return
    setBusy(true)
    setError("")
    setResult(null)
    setGuest(null)
    try {
      const statusResponse = await fetch(`/php/get_payment_status.php?student_id=${encodeURIComponent(id)}`, { credentials: "include" })
      const status = await statusResponse.json() as {
        status: string
        message?: string
        student?: Guest
        aurora_night?: { active: boolean; event_name: string; is_paid: boolean }
      }
      if (!statusResponse.ok || status.status !== "success" || !status.student) {
        throw new Error(status.message || "Student was not found.")
      }
      const foundStudent = status.student
      const aurora = status.aurora_night
      setGuest(foundStudent)
      if (!aurora?.active) {
        setResult({ kind: "warning", title: "Check-in is closed", detail: "Aurora Night check-in is currently inactive." })
        return
      }
      if (!aurora.is_paid) {
        setResult({ kind: "error", title: "Payment not found", detail: `${foundStudent.name} has not paid the Aurora Night registration fee.` })
        return
      }

      const csrf = await getToken()
      const existing = await postCheckin(foundStudent.id, "check", csrf)
      if (existing.already_checked_in) {
        setResult({
          kind: "warning",
          title: "Already checked in",
          detail: `${foundStudent.name} checked in at ${existing.checked_in_at || "an earlier time"}.`,
        })
        return
      }
      const recorded = await postCheckin(foundStudent.id, "checkin", csrf)
      if (!recorded.success) throw new Error(recorded.message || "Unable to record check-in.")
      setResult({
        kind: "success",
        title: "Check-in successful",
        detail: `${foundStudent.name} · ${foundStudent.id}`,
        ticketId: recorded.ticket_id,
      })
      setManualId("")
      await loadRecent()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to check in this student.")
    } finally {
      setBusy(false)
    }
  }

  const startCamera = async () => {
    setError("")
    const Detector = (window as BarcodeWindow).BarcodeDetector
    if (!Detector) {
      setError("QR scanning is not supported by this browser. Use manual student ID entry.")
      return
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera access is unavailable. Use manual student ID entry.")
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      const detector = new Detector({ formats: ["qr_code"] })
      setCameraOn(true)
      const scanFrame = async () => {
        const video = videoRef.current
        if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !streamRef.current) {
          loopRef.current = window.setTimeout(scanFrame, 250)
          return
        }
        try {
          const codes = await detector.detect(video)
          const value = codes[0]?.rawValue?.trim()
          if (value && value !== lastScannedRef.current && !busy) {
            lastScannedRef.current = value
            await checkStudent(value)
            window.setTimeout(() => { lastScannedRef.current = "" }, 2500)
          }
        } catch {
          setError("Unable to read a QR code. You can still enter the student ID manually.")
        }
        if (streamRef.current) loopRef.current = window.setTimeout(scanFrame, 250)
      }
      void scanFrame()
    } catch {
      stopCamera()
      setError("Camera permission was denied or no camera is available.")
    }
  }

  const submitManual = (event: React.FormEvent) => {
    event.preventDefault()
    void checkStudent(manualId)
  }

  const resultStyles = result?.kind === "success"
    ? "border-green-200 bg-green-50 text-green-800"
    : result?.kind === "warning" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-red-200 bg-red-50 text-red-800"

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">Event check-in</Badge>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold text-gray-900"><DoorOpen className="h-6 w-6 text-amber-600" />Aurora Night Check-in</h1>
        <p className="text-gray-500">Scan or enter a student ID to verify paid registration and admit the guest.</p>
      </div>

      {error && <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5 text-amber-600" />QR scanner</CardTitle><CardDescription>Camera access requires HTTPS or localhost and browser permission.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="relative overflow-hidden rounded-xl bg-gray-950">
                <video ref={videoRef} muted playsInline className={`aspect-video w-full object-cover ${cameraOn ? "" : "hidden"}`} />
                {!cameraOn && <div className="flex aspect-video items-center justify-center text-sm text-gray-300">Camera is stopped.</div>}
              </div>
              {cameraOn ? <Button variant="outline" className="w-full" onClick={stopCamera}>Stop scanner</Button> : <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={startCamera}>Start QR scanner</Button>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Manual entry</CardTitle><CardDescription>Enter the student ID printed on the student QR card.</CardDescription></CardHeader>
            <CardContent>
              <form onSubmit={submitManual} className="flex gap-2">
                <Input value={manualId} onChange={(event) => setManualId(event.target.value)} maxLength={15} placeholder="Student ID" required />
                <Button type="submit" disabled={busy}><Search className="mr-2 h-4 w-4" />{busy ? "Checking…" : "Check in"}</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white">
            <CardHeader><CardTitle className="text-white">Aurora Night entry</CardTitle><CardDescription className="text-amber-50">Payment and check-in eligibility are verified server-side for every scan.</CardDescription></CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-sm">Check-in availability</span><Badge variant="outline" className="border-white/50 bg-white/15 text-white">Server verified</Badge>
            </CardContent>
          </Card>

          {guest && <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5 text-gray-500" />Guest details</CardTitle></CardHeader>
            <CardContent><p className="font-semibold">{guest.name}</p><p className="text-sm text-gray-500">{guest.id}</p><p className="text-sm text-gray-500">{[guest.program, guest.course].filter(Boolean).join(" · ")}</p></CardContent>
          </Card>}

          {result && <div className={`rounded-xl border p-5 ${resultStyles}`}>
            <div className="flex items-start gap-3">
              {result.kind === "success" ? <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" /> : result.kind === "warning" ? <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0" />}
              <div><p className="font-bold">{result.title}</p><p className="mt-1 text-sm">{result.detail}</p>{result.ticketId && <p className="mt-3 inline-block rounded bg-white/60 px-2 py-1 font-mono text-sm font-bold">{result.ticketId}</p>}</div>
            </div>
          </div>}

          <Card>
            <CardHeader><CardTitle>Recent check-ins <Badge variant="secondary">{total}</Badge></CardTitle><CardDescription>Latest entries from Aurora Night check-in records.</CardDescription></CardHeader>
            <CardContent>
              {recent.length === 0 ? <p className="py-4 text-center text-sm text-gray-500">No check-ins recorded yet.</p> : (
                <div className="space-y-3">{recent.map((entry) => (
                  <div key={`${entry.student_id}-${entry.checked_in_at}`} className="flex items-center justify-between gap-3 border-b pb-3 last:border-0">
                    <div><p className="text-sm font-medium">{entry.student_name}</p><p className="text-xs text-gray-500">{entry.student_id}</p></div>
                    <span className="text-right text-xs text-gray-500">{entry.checked_in_at}</span>
                  </div>
                ))}</div>
              )}
              <Button variant="ghost" className="mt-2 w-full" onClick={() => loadRecent().catch((err: unknown) => setError(err instanceof Error ? err.message : "Unable to refresh check-ins."))}>Refresh check-ins</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
