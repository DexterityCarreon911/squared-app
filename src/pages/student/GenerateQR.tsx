import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QrCode, Download, RefreshCw, Link } from "lucide-react"

export default function GenerateQR() {
  const [text, setText] = useState("")
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const generateQR = async () => {
    if (!text.trim()) return
    setGenerating(true)
    try {
      // Use a QR code API to generate
      const encoded = encodeURIComponent(text)
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encoded}`
      setQrDataUrl(url)
    } catch {
      // Fallback: show a placeholder
      setQrDataUrl(null)
    }
    setGenerating(false)
  }

  const handleDownload = () => {
    if (!qrDataUrl) return
    const link = document.createElement("a")
    link.download = `qr-${Date.now()}.png`
    link.href = qrDataUrl
    link.click()
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Generate QR Code</h1>
        <p className="text-gray-500">Create a QR code for any text or link.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#187C19]" />
            QR Code Generator
          </CardTitle>
          <CardDescription>Enter any text, URL, or code to generate a QR code.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Content</label>
            <Input
              placeholder="Enter text or URL..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateQR()}
            />
          </div>
          <Button onClick={generateQR} disabled={!text.trim() || generating} className="w-full">
            {generating ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><QrCode className="w-4 h-4 mr-2" /> Generate QR Code</>
            )}
          </Button>
        </CardContent>
      </Card>

      {qrDataUrl && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <img src={qrDataUrl} alt="Generated QR Code" className="w-56 h-56 mb-4" />
            <p className="text-sm text-gray-500 mb-4 text-center break-all max-w-xs">{text}</p>
            <div className="flex gap-3">
              <Button onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" /> Download
              </Button>
              <Button variant="outline" onClick={() => { setText(""); setQrDataUrl(null) }}>
                <RefreshCw className="w-4 h-4 mr-2" /> New
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-500 space-y-2">
          <p className="flex items-start gap-2">
            <Link className="w-4 h-4 mt-0.5 shrink-0 text-[#187C19]" />
            <span>Use links like <code className="bg-gray-100 px-1 rounded">https://example.com</code> for URL QR codes.</span>
          </p>
          <p className="flex items-start gap-2">
            <QrCode className="w-4 h-4 mt-0.5 shrink-0 text-[#187C19]" />
            <span>Event codes can also be encoded for quick scanning.</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
