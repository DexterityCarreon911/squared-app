import { useState, useEffect } from "react"
import { Megaphone, Calendar } from "lucide-react"
import LoadingState from "@/components/LoadingState"
import ErrorState from "@/components/ErrorState"

interface Announcement {
  id: number
  title: string
  content: string
  created_at: string
}

export default function AnnouncementSection() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchAnnouncement = async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch("/api/announcements.php", { credentials: "include" })
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      if (data.announcement) {
        setAnnouncement(data.announcement)
      } else if (data.id) {
        setAnnouncement(data)
      }
    } catch {
      setError(true)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAnnouncement()
  }, [])

  return (
    <section className="relative py-16 md:py-20 bg-gradient-to-br from-white to-[#f8fdf0] overflow-hidden">
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#69B41E] via-[#187C19] to-[#0D5B11]" />

      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-[#187C19] to-[#69B41E] bg-clip-text text-transparent relative inline-block">
            Latest Announcement
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#69B41E] to-[#8DC71E] rounded-full" />
          </h2>
          <p className="text-gray-500 text-lg mt-6 max-w-2xl mx-auto">
            Stay updated with the latest news from Squared QR System
          </p>
        </div>

        {loading ? (
          <LoadingState message="Loading announcement..." />
        ) : error ? (
          <ErrorState message="Could not load announcement." onRetry={fetchAnnouncement} />
        ) : announcement ? (
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl border-2 border-transparent hover:border-[#69B41E] transition-all duration-300 group">
            {/* Hover top bar */}
            <div className="h-1 bg-gradient-to-r from-[#69B41E] to-[#8DC71E] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            <div className="p-8 md:p-10">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                {announcement.title}
              </h3>
              <div className="bg-[#f8fdf0] border-l-4 border-[#69B41E] rounded-lg p-5 md:p-6 mb-6 text-gray-600 leading-relaxed whitespace-pre-line">
                {announcement.content}
              </div>
              <div className="flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 text-[#69B41E] text-sm font-semibold">
                  <Calendar className="w-4 h-4" />
                  Posted on:{" "}
                  {new Date(announcement.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
                <span className="text-xs font-bold px-3 py-1.5 bg-[#f1f8e9] text-[#187C19] rounded-full">
                  <Megaphone className="w-3 h-3 inline mr-1" />
                  Latest Update
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Megaphone className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Announcements Available</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              There are currently no announcements to display. Check back later for updates.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
