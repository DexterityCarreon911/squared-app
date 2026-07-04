import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import LoadingState from "@/components/LoadingState"
import ErrorState from "@/components/ErrorState"
import EmptyState from "@/components/EmptyState"
import { Calendar, Clock, QrCode, Smartphone, Download, CalendarX } from "lucide-react"

interface Event {
  event_name: string
  event_date: string
  start_time: string
  end_time: string
  evaluation_link?: string
}

function getEventStatus(
  eventDate: string,
  startTime: string,
  endTime: string,
  today: string,
  currentTime: string
): "Upcoming" | "Ongoing" | "Ended" {
  if (eventDate > today) return "Upcoming"
  if (eventDate < today) return "Ended"

  const cur = currentTime
  const start = startTime
  const end = endTime

  if (cur >= start && cur <= end) return "Ongoing"
  if (cur < start) return "Upcoming"
  return "Ended"
}

function formatTime(time: string) {
  try {
    const [h, m] = time.split(":")
    const hour = parseInt(h)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${m} ${ampm}`
  } catch {
    return time
  }
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr + "T00:00:00")
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  } catch {
    return dateStr
  }
}

interface GroupedEvent {
  date: string
  isToday: boolean
  label: string
  events: Event[]
}

const statusStyles: Record<string, string> = {
  Upcoming: "bg-green-50 text-green-700 border-green-300",
  Ongoing: "bg-amber-50 text-amber-700 border-amber-300",
  Ended: "bg-gray-50 text-gray-500 border-gray-300",
}

export default function UpcomingEventsSection() {
  const [groupedEvents, setGroupedEvents] = useState<GroupedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchEvents = async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch("/api/events.php", { credentials: "include" })
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      const today = new Date().toISOString().split("T")[0]
      const now = new Date()
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`

      const events: Event[] = data.events || data || []
      const grouped: Record<string, Event[]> = {}
      events.forEach((ev: Event) => {
        const key = ev.event_date
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(ev)
      })

      const result: GroupedEvent[] = Object.entries(grouped)
        .map(([date, evs]) => ({
          date,
          isToday: date === today,
          label: date === today ? "Today's Event" : formatDate(date),
          events: evs,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

      setGroupedEvents(result)
    } catch {
      setError(true)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const today = new Date().toISOString().split("T")[0]
  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`

  return (
    <section
      id="upcoming-events"
      className="relative py-16 md:py-20 bg-gradient-to-br from-[#f8fdf0] via-[#e8f5e9] to-[#f0f8ff] overflow-hidden"
    >
      {/* Animated top bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2AAD7A] via-[#87A52B] to-[#3B9E40] bg-[length:200%_100%] animate-[colorFlow_8s_ease-in-out_infinite]" />

      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2AAD7A] to-[#3B9E40] text-white text-xs font-bold tracking-widest px-6 py-2.5 rounded-full uppercase shadow-lg shadow-green-500/30 relative overflow-hidden">
            <Calendar className="w-3.5 h-3.5" />
            Upcoming Activities
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_3s_ease-in-out_infinite] -translate-x-full" />
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-[#1a1d28] mt-4 mb-2">
            Schedule of{" "}
            <span className="bg-gradient-to-r from-[#2AAD7A] via-[#87A52B] to-[#3B9E40] bg-clip-text text-transparent relative">
              Attendance
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#2AAD7A] via-[#87A52B] to-[#3B9E40] rounded-full animate-pulse" />
            </span>
          </h2>
          <p className="text-gray-600 text-base md:text-lg">
            Prepare your Squared QR Code for upcoming events
          </p>
        </div>

        {/* Events */}
        {loading ? (
          <LoadingState message="Loading upcoming events..." />
        ) : error ? (
          <ErrorState message="Could not load events." onRetry={fetchEvents} />
        ) : groupedEvents.length === 0 ? (
          <EmptyState
            icon={<CalendarX className="w-8 h-8 text-[#2AAD7A]" />}
            title="No Upcoming Events"
            message="Check back later for new activities and announcements."
          />
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {groupedEvents.map((group) => (
              <div
                key={group.date}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 md:p-7 shadow-lg border border-transparent hover:border-[#2AAD7A]/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                {/* Event Header */}
                <div className="flex items-center gap-4 pb-5 mb-5 border-b-2 border-dashed border-[#2AAD7A]/20">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2AAD7A] via-[#87A52B] to-[#3B9E40] flex items-center justify-center text-white shadow-lg shrink-0 relative overflow-hidden">
                    <QrCode className="w-6 h-6 relative z-10" />
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_3s_ease-in-out_infinite]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg md:text-xl font-extrabold text-[#1a1d28]">{group.label}</h4>
                    {!group.isToday && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-[#2AAD7A]" />
                        <span>{formatDate(group.date)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Schedule Rows */}
                <div className="space-y-3">
                  {group.events.map((event, i) => {
                    const status = getEventStatus(event.event_date, event.start_time, event.end_time, today, currentTime)
                    const startFormatted = formatTime(event.start_time)
                    const endFormatted = formatTime(event.end_time)
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-3 p-4 bg-gray-50 hover:bg-[#e8f5e9] rounded-xl transition-all duration-200 hover:translate-x-1 group border border-transparent hover:border-[#2AAD7A]/20"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Clock className="w-4 h-4 text-[#2AAD7A] shrink-0" />
                          <span className="text-sm font-bold text-[#1a1d28] truncate">
                            {event.event_name}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 whitespace-nowrap shrink-0">
                          {startFormatted} - {endFormatted}
                        </span>
                        <span
                          className={`text-[0.65rem] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap shrink-0 ${
                            statusStyles[status] || "bg-gray-50 text-gray-500"
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Evaluation Link */}
                {group.events[0]?.evaluation_link && (
                  <div className="mt-5 pt-5 border-t-2 border-dashed border-[#2AAD7A]/20 bg-gradient-to-r from-amber-50 to-amber-50/50 rounded-xl p-4 hover:bg-amber-50/80 transition-all duration-200 hover:-translate-y-0.5">
                    <a
                      href={group.events[0].evaluation_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-gray-600"
                    >
                      <span className="text-amber-500 text-lg animate-bounce">📋</span>
                      <span>Complete the evaluation form for this event</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* QR Reminder CTA */}
        <div className="max-w-3xl mx-auto mt-8">
          <div className="relative bg-gradient-to-br from-[#1a1d28] via-[#2d3142] to-[#1a1d28] rounded-2xl p-6 md:p-8 text-white shadow-xl overflow-hidden">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#2AAD7A]/10 rounded-full" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2AAD7A] via-[#87A52B] to-[#3B9E40]" />

            <div className="flex items-start gap-5 md:gap-7 relative z-10">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-[#2AAD7A] to-[#3B9E40] flex items-center justify-center text-white text-2xl shrink-0 shadow-lg shadow-green-500/30 animate-pulse">
                <Smartphone className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <div className="flex-1">
                <h5 className="text-lg md:text-xl font-extrabold mb-2">Prepare Your QR Code</h5>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-4">
                  Download or take a screenshot of your Squared QR Code from your profile. This will be
                  your mode of attendance for all upcoming activities.
                </p>
                <Button
                  asChild
                  className="bg-gradient-to-r from-[#2AAD7A] to-[#3B9E40] hover:from-[#239e6d] hover:to-[#338a38] text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  <Link to="/qr-card">
                    <Download className="w-4 h-4 mr-2" /> Get Your QR Code
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes colorFlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </section>
  )
}
