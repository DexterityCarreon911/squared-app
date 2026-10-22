import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, CheckCheck, Calendar, Megaphone, Info, CreditCard } from "lucide-react"
import LoadingState from "@/components/LoadingState"
import EmptyState from "@/components/EmptyState"

interface Notification {
  id: number
  type: "event" | "announcement" | "payment" | "info"
  title: string
  message: string
  time_ago: string
  is_read: boolean
}

const typeIcons: Record<string, React.ElementType> = {
  event: Calendar,
  announcement: Megaphone,
  payment: CreditCard,
  info: Info,
}

const typeColors: Record<string, string> = {
  event: "bg-blue-100 text-blue-600",
  announcement: "bg-purple-100 text-purple-600",
  payment: "bg-green-100 text-green-600",
  info: "bg-amber-100 text-amber-600",
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/php/get_notifications.php", { credentials: "include" })
        const data = await res.json()
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Could not load notifications.")
        }
        setNotifications(data.notifications || [])
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load notifications.")
      } finally {
        setLoading(false)
      }
    }
    void fetchNotifications()
  }, [])

  const markRead = async (id?: number) => {
    setError("")
    try {
      const body = new URLSearchParams(id ? { id: String(id) } : { all: "1" })
      const res = await fetch("/php/mark_notification_read.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not update notifications.")
      }
      setNotifications((prev) => prev.map((n) =>
        id === undefined || n.id === id ? { ...n, is_read: true } : n
      ))
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Could not update notifications.")
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : "No unread notifications"}
          </p>
        </div>
        {unreadCount > 0 && (
        <Button variant="outline" size="sm" onClick={() => void markRead()}>
            <CheckCheck className="w-4 h-4 mr-1" /> Mark All Read
          </Button>
        )}
      </div>

      {loading ? (
        <LoadingState />
      ) : error && notifications.length === 0 ? (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8 text-gray-400" />}
          title="No notifications"
          message="You're all caught up! Notifications will appear here when there's something new."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const Icon = typeIcons[notif.type] || Bell
            return (
              <Card
                key={notif.id}
                className={`transition-all hover:shadow-md ${!notif.is_read ? "border-l-4 border-l-[#187C19] bg-green-50/30" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${typeColors[notif.type] || "bg-gray-100 text-gray-600"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{notif.title}</p>
                          <p className="text-sm text-gray-500 mt-0.5">{notif.message}</p>
                        </div>
                        {!notif.is_read && (
                          <button
                            onClick={() => void markRead(notif.id)}
                            className="shrink-0 text-gray-400 hover:text-[#187C19] transition-colors"
                            title="Mark as read"
                            aria-label={`Mark ${notif.title} as read`}
                          >
                            <CheckCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-400">
                          {notif.time_ago}
                        </span>
                        {!notif.is_read && (
                          <Badge variant="default" className="text-[0.6rem] h-4 px-1.5 bg-[#187C19]">New</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
      {error && notifications.length > 0 && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}
    </div>
  )
}
