import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Camera, QrCode, CheckCircle, AlertCircle, User } from "lucide-react"

interface ScanResult {
  student_id: string
  name: string
  course: string
  status: string
  event: string
}

export default function AdminScanner() {
  const [eventCode, setEventCode] = useState("")
  const [eventName, setEventName] = useState("")
  const [scanning, setScanning] = useState(false)
  const [lastScan, setLastScan] = useState<ScanResult | null>(null)
  const [manualId, setManualId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [recentScans, setRecentScans] = useState<ScanResult[]>([])

  const handleManualScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualId.trim() || !eventCode.trim()) return

    setLoading(true)
    setError("")
    try {
      const res = await fetch("/php/record_attendance.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
        body: new URLSearchParams({
          event_code: eventCode,
          student_id: manualId,
          csrf_token: "",
        }),
      })
      const data = await res.json()
      if (data.status === "success") {
        const result: ScanResult = {
          student_id: manualId,
          name: data.name || manualId,
          course: data.course || "—",
          status: "Present",
          event: eventName || eventCode,
        }
        setLastScan(result)
        setRecentScans((prev) => [result, ...prev].slice(0, 20))
        setManualId("")
      } else {
        setError(data.message || "Failed to record attendance.")
      }
    } catch {
      setError("Connection error.")
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scanner</h1>
        <p className="text-gray-500">Scan QR codes or manually enter student IDs for attendance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scan Controls */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#187C19]" />
                QR Scanner
              </CardTitle>
              <CardDescription>Point camera at student's QR code to record attendance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Event Code</label>
                <Input
                  placeholder="Enter event code"
                  value={eventCode}
                  onChange={(e) => setEventCode(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Event Name (optional)</label>
                <Input
                  placeholder="e.g. General Assembly"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                />
              </div>
              <Button
                size="xl"
                className="w-full"
                onClick={() => setScanning(!scanning)}
              >
                <Camera className="w-5 h-5 mr-2" />
                {scanning ? "Stop Scanner" : "Start Scanner"}
              </Button>
              {scanning && (
                <div className="bg-gray-100 rounded-lg p-12 text-center border-2 border-dashed">
                  <Camera className="w-16 h-16 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500">Camera active — scanning for QR codes...</p>
                  <p className="text-xs text-gray-400 mt-1">Point camera at a student's QR code.</p>
                  <div className="mt-4">
                    <div className="w-48 h-48 mx-auto border-2 border-[#187C19] rounded-lg animate-pulse" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manual Entry */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Manual Entry</CardTitle>
              <CardDescription>Enter student ID manually if QR scan fails.</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm mb-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {lastScan && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm mb-3 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Attendance Recorded</p>
                    <p className="text-xs mt-1">{lastScan.name} — {lastScan.event}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleManualScan} className="flex gap-2">
                <Input
                  placeholder="Enter Student ID"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={loading || !manualId.trim() || !eventCode.trim()}>
                  {loading ? "..." : "Record"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Recent Scans */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Scans</CardTitle>
            </CardHeader>
            <CardContent>
              {recentScans.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  <QrCode className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No scans yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentScans.map((scan, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{scan.name}</p>
                        <p className="text-xs text-gray-400 truncate">{scan.student_id}</p>
                      </div>
                      <Badge variant="success" className="text-xs">Present</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
