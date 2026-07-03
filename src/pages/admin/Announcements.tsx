import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Megaphone, Plus, Send, Trash2, Calendar } from "lucide-react"

interface Announcement {
  id: number
  title: string
  content: string
  status: string
  created_at: string
  target: string
}

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [target, setTarget] = useState("all")
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch("/admin/php/get_announcements.php", {
          credentials: "include",
        })
        if (res.redirected) {
          window.location.href = "/admin"
          return
        }
        const data = await res.json()
        if (data.status === "success") {
          setAnnouncements(data.announcements || [])
        }
      } catch (err) {
        console.error("Failed to fetch announcements", err)
      }
      setLoading(false)
    }
    fetchAnnouncements()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setCreating(true)
    try {
      const res = await fetch("/admin/php/create_announcement.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
        body: new URLSearchParams({ title, content, target, csrf_token: "" }),
      })
      const data = await res.json()
      if (data.status === "success") {
        setTitle("")
        setContent("")
        setTarget("all")
        setShowForm(false)
        // Refresh list
        const ref = await fetch("/admin/php/get_announcements.php", { credentials: "include" })
        const refData = await ref.json()
        if (refData.status === "success") setAnnouncements(refData.announcements || [])
      }
    } catch (err) {
      console.error("Failed to create announcement", err)
    }
    setCreating(false)
  }

  const handleDelete = async (id: number) => {
    try {
      await fetch("/admin/php/delete_announcement.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
        body: new URLSearchParams({ id: String(id), csrf_token: "" }),
      })
      setAnnouncements((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      console.error("Failed to delete announcement", err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500">Create and manage announcements for students.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" /> {showForm ? "Cancel" : "New Announcement"}
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#187C19]" />
              New Announcement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Content</label>
                <textarea
                  className="w-full min-h-[120px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#187C19]"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Target</label>
                <select
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                >
                  <option value="all">All Students</option>
                  <option value="ITE">ITE</option>
                  <option value="CELA">CELA</option>
                  <option value="CBA">CBA</option>
                  <option value="HME">HME</option>
                  <option value="CJE">CJE</option>
                </select>
              </div>
              <Button type="submit" disabled={creating}>
                <Send className="w-4 h-4 mr-1" /> {creating ? "Publishing..." : "Publish"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Announcements List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading announcements...</div>
      ) : announcements.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-gray-500">
            <Megaphone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No announcements yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <Card key={ann.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{ann.title}</h3>
                      <Badge variant="outline" className="text-xs">{ann.target}</Badge>
                      <Badge variant={ann.status === "active" ? "success" : "secondary"} className="text-xs">
                        {ann.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{ann.content}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {ann.created_at}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(ann.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
