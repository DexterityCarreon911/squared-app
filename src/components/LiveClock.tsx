import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

export default function LiveClock({ className = "" }: { className?: string }) {
  const [dateTime, setDateTime] = useState("")

  useEffect(() => {
    function updateClock() {
      const now = new Date()
      const options: Intl.DateTimeFormatOptions = {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
        timeZone: "Asia/Manila",
        timeZoneName: "short",
      }
      setDateTime(now.toLocaleDateString("en-US", options))
    }

    updateClock()
    const interval = setInterval(updateClock, 1000)

    const handleVisibility = () => {
      if (!document.hidden) updateClock()
    }
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [])

  return (
    <div className={`flex items-center justify-center gap-2 text-white ${className}`}>
      <Clock className="w-4 h-4" />
      <span className="font-semibold tracking-wide text-sm md:text-base">{dateTime}</span>
    </div>
  )
}
