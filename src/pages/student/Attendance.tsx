import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QrCode, Camera, AlertCircle, CheckCircle, Clock } from "lucide-react"

export default function Attendance() {
  const [eventCode, setEventCode] = useState("")
  const [scanning, setScanning] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [loading, setLoading] = useState(false)

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
        body: new URLSearchParams({
          event_code: eventCode,
          csrf_token: "",
        }),
      })
      const data = await res.json()
      if (data.status === "success") {
        setStatus({ type: "success", message: data.message || "Attendance recorded!" })
        setEventCode("")
      } else {
        setStatus({ type: "error", message: data.message || "Failed to record attendance." })
      }
    } catch {
      setStatus({ type: "error", message: "Connection error." })
    }
    setLoading(false)
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-500">Enter event code or scan QR to record attendance.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#187C19]" />
            Record Attendance
          </CardTitle>
          <CardDescription>
            Enter the event code shown at the event or scan the QR code.
          </CardDescription>
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
                placeholder="Enter or scan event code"
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !eventCode.trim()}>
              {loading ? "Recording..." : "Submit Attendance"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">or</span>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={() => setScanning(!scanning)}>
            <Camera className="w-4 h-4 mr-2" />
            {scanning ? "Close Scanner" : "Open QR Scanner"}
          </Button>

          {scanning && (
            <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500 border-2 border-dashed">
              <Camera className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Camera access would be requested here.</p>
              <p className="text-xs mt-1">Point your camera at the event QR code.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">Event Name #{i}</span>
                </div>
                <Badge variant="success">Present</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
