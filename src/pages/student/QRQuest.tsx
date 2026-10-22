import { useCallback, useEffect, useRef, useState, type FormEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trophy, QrCode, Users, Camera, CameraOff } from "lucide-react"

interface CollectionEntry {
  name: string
  avatar: string
  program: string
  scanned_at: string
}

interface LeaderboardEntry {
  rank: number
  name: string
  avatar: string
  program: string
  score: number
}

interface BarcodeDetectorLike {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>
}

type BarcodeDetectorConstructor = new (options?: { formats: string[] }) => BarcodeDetectorLike

interface ScanResult {
  success: boolean
  message: string
  student_name?: string
  total_count?: number
}

async function readJson<T>(response: Response): Promise<T> {
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || "Request failed")
  }
  return data as T
}

export default function QRQuest() {
  const [collection, setCollection] = useState<CollectionEntry[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [scanning, setScanning] = useState(false)
  const [manualId, setManualId] = useState("")
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [scanError, setScanError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [cameraError, setCameraError] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)

  const refreshData = useCallback(async () => {
    const [collectionResponse, leaderboardResponse] = await Promise.all([
      fetch("/php/qr_quest_my_collection.php", { credentials: "include" }),
      fetch("/php/qr_quest_leaderboard_json.php", { credentials: "include" }),
    ])
    const [collectionData, leaderboardData] = await Promise.all([
      readJson<{
        success: boolean
        message?: string
        total?: number
        collection?: CollectionEntry[]
      }>(collectionResponse),
      readJson<{ success: boolean; message?: string; leaderboard?: LeaderboardEntry[] }>(
        leaderboardResponse
      ),
    ])

    if (!collectionData.success) {
      throw new Error(collectionData.message || "Could not load your QR Quest collection.")
    }
    if (!leaderboardData.success) {
      throw new Error(leaderboardData.message || "Could not load the QR Quest leaderboard.")
    }

    setCollection(collectionData.collection || [])
    setTotal(collectionData.total || 0)
    setLeaderboard(leaderboardData.leaderboard || [])
  }, [])

  useEffect(() => {
    refreshData()
      .catch((error: unknown) => {
        setLoadError(error instanceof Error ? error.message : "Could not load QR Quest.")
      })
      .finally(() => setLoading(false))
  }, [refreshData])

  const submitScannedId = useCallback(async (studentId: string) => {
    const scannedId = studentId.trim()
    if (!scannedId || submitting) return

    setSubmitting(true)
    setScanError("")
    setScanResult(null)
    try {
      const tokenResponse = await fetch("/php/api/csrf_token.php", { credentials: "include" })
      const tokenData = await readJson<{ success: boolean; csrf_token?: string; message?: string }>(
        tokenResponse
      )
      if (!tokenData.success || !tokenData.csrf_token) {
        throw new Error(tokenData.message || "Could not obtain a security token. Please retry.")
      }

      const body = new URLSearchParams({
        scanned_id: scannedId,
        csrf_token: tokenData.csrf_token,
      })
      const response = await fetch("/php/qr_quest_scan.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      })
      const result = await readJson<ScanResult>(response)
      setScanResult(result)
      if (!result.success) {
        setScanError(result.message)
      } else {
        setManualId("")
        await refreshData()
      }
    } catch (error) {
      setScanError(error instanceof Error ? error.message : "QR scan failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }, [refreshData, submitting])

  useEffect(() => {
    if (!scanning) return

    let active = true
    let stream: MediaStream | null = null
    let timeoutId = 0
    const detectorConstructor = (window as typeof window & {
      BarcodeDetector?: BarcodeDetectorConstructor
    }).BarcodeDetector

    const startCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera access is unavailable. Enter the student ID from the QR code instead.")
        return
      }
      if (!detectorConstructor) {
        setCameraError("This browser cannot scan QR codes. Enter the student ID manually instead.")
        return
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "environment" } },
        })
        if (!active) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        await video.play()

        const detector = new detectorConstructor({ formats: ["qr_code"] })
        const scanFrame = async () => {
          if (!active || !videoRef.current || videoRef.current.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
            if (active) timeoutId = window.setTimeout(scanFrame, 200)
            return
          }
          try {
            const codes = await detector.detect(videoRef.current)
            const value = codes[0]?.rawValue
            if (active && value) {
              setScanning(false)
              await submitScannedId(value)
              return
            }
          } catch (error) {
            console.error("QR code detection failed", error)
          }
          if (active) timeoutId = window.setTimeout(scanFrame, 200)
        }
        scanFrame()
      } catch (error) {
        setCameraError(error instanceof Error ? error.message : "Could not start the camera.")
      }
    }

    setCameraError("")
    startCamera()
    return () => {
      active = false
      window.clearTimeout(timeoutId)
      stream?.getTracks().forEach((track) => track.stop())
      if (videoRef.current) videoRef.current.srcObject = null
    }
  }, [scanning, submitScannedId])

  const handleManualSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void submitScannedId(manualId)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">QR Quest</h1>
        <p className="text-gray-500">Scan another student’s QR code to add them to your collection.</p>
      </div>

      <Card className="bg-gradient-to-r from-[#187C19] to-emerald-600 text-white">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Students collected</p>
            <p className="text-4xl font-bold">{total}</p>
          </div>
          <Users className="w-12 h-12 opacity-80" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" /> Scan a student QR code
          </CardTitle>
          <CardDescription>Scanning is available on HTTPS in browsers that support QR detection.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" onClick={() => setScanning((value) => !value)} disabled={submitting}>
            {scanning ? <CameraOff className="w-4 h-4 mr-2" /> : <Camera className="w-4 h-4 mr-2" />}
            {scanning ? "Close camera" : "Open camera"}
          </Button>

          {scanning && (
            <div className="space-y-2">
              <video
                ref={videoRef}
                className="w-full max-h-80 rounded-lg bg-black object-contain"
                muted
                playsInline
                aria-label="QR code camera preview"
              />
              {cameraError && <p className="text-sm text-amber-700">{cameraError}</p>}
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <Input
              aria-label="Student ID from QR code"
              value={manualId}
              onChange={(event) => setManualId(event.target.value)}
              placeholder="Or enter the student ID"
              required
            />
            <Button type="submit" disabled={submitting || !manualId.trim()}>
              {submitting ? "Scanning..." : "Submit"}
            </Button>
          </form>

          {scanResult?.success && (
            <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
              {scanResult.message}{scanResult.student_name ? ` ${scanResult.student_name} was added.` : ""}
            </p>
          )}
          {scanError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{scanError}</p>}
        </CardContent>
      </Card>

      {loadError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{loadError}</p>}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">My collection</CardTitle>
          <CardDescription>Students you have collected with QR Quest.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-4 text-center text-gray-500">Loading collection...</p>
          ) : collection.length === 0 ? (
            <p className="py-4 text-center text-gray-500">Your collection is empty. Scan a student QR code to get started.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {collection.map((entry, index) => (
                <div key={`${entry.name}-${entry.scanned_at}-${index}`} className="flex items-center gap-3 rounded-lg border p-3">
                  {entry.avatar ? (
                    <img src={entry.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-green-100" aria-hidden="true" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{entry.name}</p>
                    <p className="truncate text-xs text-gray-500">{entry.program || "Student"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" /> Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-4 text-center text-gray-500">Loading leaderboard...</p>
          ) : leaderboard.length === 0 ? (
            <p className="py-4 text-center text-gray-500">No leaderboard entries yet.</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry) => (
                <div key={`${entry.rank}-${entry.name}`} className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Badge variant={entry.rank <= 3 ? "success" : "secondary"}>#{entry.rank}</Badge>
                    <span className="text-sm font-medium">{entry.name}</span>
                  </div>
                  <span className="text-sm font-bold">{entry.score} scans</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
