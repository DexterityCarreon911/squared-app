import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ImagePlus, GripVertical, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react"

interface Slide {
  id: number
  image: string
  title: string
  subtitle: string
  active: boolean
  order: number
}

export default function AdminSlider() {
  const [slides, setSlides] = useState<Slide[]>([
    { id: 1, image: "/images/Cover.jpg", title: "Streamline Your School Events", subtitle: "QR-based attendance tracking, real-time evaluations, and student management.", active: true, order: 1 },
    { id: 2, image: "/images/Cover1.jpg", title: "Smart Attendance Tracking", subtitle: "Quick and secure attendance tracking with instant QR code scanning.", active: true, order: 2 },
    { id: 3, image: "/images/Cover2.jpg", title: "Empowering Student Engagement", subtitle: "Connect, participate, and engage with campus activities.", active: true, order: 3 },
  ])

  const moveSlide = (id: number, direction: "up" | "down") => {
    setSlides((prev) => {
      const idx = prev.findIndex((s) => s.id === id)
      if (idx === -1) return prev
      const newIdx = direction === "up" ? idx - 1 : idx + 1
      if (newIdx < 0 || newIdx >= prev.length) return prev
      const copy = [...prev]
      ;[copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]]
      return copy.map((s, i) => ({ ...s, order: i + 1 }))
    })
  }

  const toggleActive = (id: number) => {
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)))
  }

  const deleteSlide = (id: number) => {
    setSlides((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Slider Management</h1>
          <p className="text-gray-500">Manage hero slider images and content.</p>
        </div>
        <Button>
          <ImagePlus className="w-4 h-4 mr-2" /> Add Slide
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hero Slides ({slides.length})</CardTitle>
          <CardDescription>Drag or use arrows to reorder slides. Active slides appear on the landing page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="flex items-center gap-4 p-4 bg-white border rounded-xl hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-1">
                <button onClick={() => moveSlide(slide.id, "up")} className="text-gray-400 hover:text-gray-700" disabled={slide.order === 1}>
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button onClick={() => moveSlide(slide.id, "down")} className="text-gray-400 hover:text-gray-700" disabled={slide.order === slides.length}>
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>

              <div className="w-32 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                <img src={slide.image} alt="" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{slide.title}</p>
                <p className="text-sm text-gray-500 truncate">{slide.subtitle}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={slide.active ? "success" : "secondary"}>
                  {slide.active ? "Active" : "Hidden"}
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => toggleActive(slide.id)}>
                  {slide.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteSlide(slide.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
