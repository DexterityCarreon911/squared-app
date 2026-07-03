import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Trash2, Eye, EyeOff, Flag } from "lucide-react"

interface Confession {
  id: number
  content: string
  category: string
  likes: number
  comments: number
  created_at: string
  is_anonymous: number
  author: string
  status: string
  reported: number
}

export default function AdminConfessions() {
  const [confessions, setConfessions] = useState<Confession[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const fetchConfessions = async () => {
      try {
        const res = await fetch("/admin/php/get_confessions.php", {
          credentials: "include",
        })
        if (res.redirected) {
          window.location.href = "/admin"
          return
        }
        const data = await res.json()
        if (data.status === "success") {
          setConfessions(data.confessions || [])
        }
      } catch (err) {
        console.error("Failed to fetch confessions", err)
      }
      setLoading(false)
    }
    fetchConfessions()
  }, [])

  const filtered = filter === "all"
    ? confessions
    : filter === "reported"
    ? confessions.filter((c) => c.reported > 0)
    : confessions

  const handleDelete = async (id: number) => {
    try {
      await fetch("/admin/php/delete_confession.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
        body: new URLSearchParams({ id: String(id), csrf_token: "" }),
      })
      setConfessions((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      console.error("Failed to delete confession", err)
    }
  }

  const handleToggleVisibility = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "hidden" ? "visible" : "hidden"
    try {
      await fetch("/admin/php/toggle_confession.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
        body: new URLSearchParams({ id: String(id), status: newStatus, csrf_token: "" }),
      })
      setConfessions((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      )
    } catch (err) {
      console.error("Failed to toggle confession", err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Confessions</h1>
          <p className="text-gray-500">Moderate student confessions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
            All
          </Button>
          <Button variant={filter === "reported" ? "default" : "outline"} size="sm" onClick={() => setFilter("reported")}>
            <Flag className="w-4 h-4 mr-1" /> Reported
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading confessions...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No confessions found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((confession) => (
            <Card key={confession.id} className={confession.reported > 0 ? "border-red-200" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{confession.category}</Badge>
                      {confession.reported > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          <Flag className="w-3 h-3 mr-1" /> Reported
                        </Badge>
                      )}
                      <Badge variant={confession.status === "visible" ? "success" : "secondary"} className="text-xs">
                        {confession.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-800">{confession.content}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>By: {confession.is_anonymous ? "Anonymous" : confession.author}</span>
                      <span>{confession.created_at}</span>
                      <span>❤️ {confession.likes} likes</span>
                      <span>💬 {confession.comments} comments</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleVisibility(confession.id, confession.status)}
                    >
                      {confession.status === "visible" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(confession.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
