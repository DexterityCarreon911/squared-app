import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Download, QrCode, User, Printer, Share2 } from "lucide-react"
import LoadingState from "@/components/LoadingState"

export default function QRCard() {
  const [student, setStudent] = useState<{ name: string; id: string; program: string; avatar?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/php/profile.php", { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          if (data.status === "success") {
            setStudent(data.student || data)
          }
        }
      } catch { /* use fallback */ }
      setLoading(false)
    }
    fetchProfile()
  }, [])

  const handleDownload = async () => {
    const canvas = document.getElementById("qr-card-canvas") as HTMLCanvasElement
    if (!canvas) return
    const link = document.createElement("a")
    link.download = `squared-qr-${student?.id || "card"}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  if (loading) return <LoadingState message="Loading your QR card..." />

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My QR Card</h1>
        <p className="text-gray-500">Use this QR code for attendance at school events.</p>
      </div>

      {/* QR Card */}
      <div className="relative">
        {/* Card mockup */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-[#187C19]/20 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-[#187C19] to-[#69B41E] p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium opacity-80">Squared QR</p>
                <p className="text-lg font-bold">Student ID Card</p>
              </div>
              <img
                src="/images/Squared_Logo.png"
                alt="Squared"
                className="h-8 w-8 brightness-0 invert"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
              />
            </div>
          </div>

          {/* QR Code Area */}
          <div className="p-6 flex flex-col items-center">
            <div className="w-48 h-48 bg-white rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
              <canvas
                id="qr-card-canvas"
                className="w-full h-full"
                // In production, render the actual QR code using a library or API
              >
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-[#187C19] mx-auto mb-2" />
                  <p className="text-xs text-gray-400">QR Code</p>
                </div>
              </canvas>
            </div>

            {/* Student Info */}
            <div className="text-center w-full">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Avatar className="w-12 h-12 border-2 border-[#187C19]">
                  <AvatarImage src={student?.avatar ? `/avatars/${student.avatar}.png` : "/avatars/JOY.png"} />
                  <AvatarFallback><User className="w-5 h-5" /></AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="font-bold text-gray-900">{student?.name || "Student Name"}</p>
                  <p className="text-sm text-gray-500">{student?.id || "ID: —"}</p>
                </div>
              </div>
              {student?.program && (
                <span className="inline-block bg-[#f1f8e9] text-[#187C19] text-xs font-bold px-3 py-1 rounded-full">
                  {student.program}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button className="flex-1" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" /> Download
        </Button>
        <Button variant="outline" className="flex-1">
          <Printer className="w-4 h-4 mr-2" /> Print
        </Button>
        <Button variant="outline" className="flex-1">
          <Share2 className="w-4 h-4 mr-2" /> Share
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">How to Use</CardTitle>
          <CardDescription>Follow these steps to use your QR card</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#187C19] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
            <span>Download or take a screenshot of your QR card above.</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#187C19] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
            <span>Present the QR code at the event scanner when asked.</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#187C19] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
            <span>Wait for the confirmation beep and check your attendance status.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
