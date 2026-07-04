import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, QrCode, AlertCircle, CheckCircle, Scan, History } from "lucide-react"

export default function ScanForm() {
  const [eventCode, setEventCode] = useState("")
  const [scannerOpen, setScannerOpen] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [recentScans, setRecentScans] = useState<{ event: string; time: string; status: string }[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventCode.trim()) return
    setLoading(true)
    setStatus(null)

    try {
      const res = await fetch("/php/record_attendance.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
        body: new URLSearchParams({ event_code: eventCode, csrf_token: "" }),
      })
      const data = await res.json()
      if (data.status === "success") {
        setStatus({ type: "success", message: data.message || "Attendance recorded!" })
        setRecentScans((prev) => [
          { event: eventCode, time: new Date().toLocaleTimeString(), status: "Present" },
          ...prev.slice(0, 4),
        ])
        setEventCode("")
      } else {
        setStatus({ type: "error", message: data.message || "Failed." })
      }
    } catch {
      setStatus({ type: "error", message: "Connection error." })
    }
    setLoading(false)
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scan Form</h1>
        <p className="text-gray-500">Quickly scan or enter event codes for attendance.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-[#187C19]" />
            Quick Attendance
          </CardTitle>
          <CardDescription>Enter the event code manually or scan the QR code.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status && (
            <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
              status.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-600"
            }`}>
              {status.type === "success" ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
              <span>{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Event Code</label>
              <Input
                placeholder="Enter event code"
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value)}
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !eventCode.trim()}>
              {loading ? "Processing..." : "Submit Attendance"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">or scan QR</span></div>
          </div>

          <Button variant="outline" className="w-full" onClick={() => setScannerOpen(!scannerOpen)}>
            <Camera className="w-4 h-4 mr-2" />
            {scannerOpen ? "Close Scanner" : "Open Camera Scanner"}
          </Button>

          {scannerOpen && (
            <div className="bg-gray-100 rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
              <Camera className="w-16 h-16 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-500 font-medium">Camera Scanner</p>
              <p className="text-xs text-gray-400 mt-1">Point your camera at the event QR code to scan.</p>
              <div className="mt-4 w-48 h-48 mx-auto border-2 border-[#187C19] rounded-lg relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-gray-300" />
                </div>
                {/* Scanner line animation */}
                <div className="absolute left-0 right-0 h-0.5 bg-[#187C19] top-1/2 animate-pulse" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <History className="w-4 h-4" /> Recent Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentScans.map((scan, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                  <span className="font-medium text-gray-700">{scan.event}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{scan.time}</span>
                    <Badge variant="success" className="text-[0.6rem]">Present</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
