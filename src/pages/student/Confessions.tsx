import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Flag, Sparkles, Send } from "lucide-react"

interface Confession {
  id: number
  content: string
  category: string
  likes: number
  comments: number
  created_at: string
  is_anonymous: boolean
  liked?: boolean
}

export default function Confessions() {
  const [confessions, setConfessions] = useState<Confession[]>([])
  const [newContent, setNewContent] = useState("")
  const [category, setCategory] = useState("general")
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const categories = ["general", "love", "school", "rants", "shoutout", "advice"]

  const fetchConfessions = async () => {
    try {
      const res = await fetch("/php/get_confessions.php", {
        credentials: "include",
      })
      const data = await res.json()
      if (data.status === "success") {
        setConfessions(data.confessions || [])
      }
    } catch (err) {
      console.error("Failed to fetch confessions", err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchConfessions()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContent.trim()) return

    setSubmitting(true)
    setError("")

    try {
      const res = await fetch("/php/submit_confession.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
        body: new URLSearchParams({
          content: newContent,
          category,
          is_anonymous: isAnonymous ? "1" : "0",
          csrf_token: "",
        }),
      })
      const data = await res.json()
      if (data.status === "success") {
        setNewContent("")
        fetchConfessions()
      } else {
        setError(data.message || "Failed to submit confession.")
      }
    } catch {
      setError("Connection error.")
    }
    setSubmitting(false)
  }

  const handleReact = async (id: number) => {
    try {
      await fetch("/php/react_confession.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
        body: new URLSearchParams({ confession_id: String(id), csrf_token: "" }),
      })
      fetchConfessions()
    } catch (err) {
      console.error("Failed to react", err)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Confessions</h1>
        <p className="text-gray-500">Share your thoughts anonymously or openly.</p>
      </div>

      {/* Submit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Write a Confession</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm mb-4">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              className="w-full min-h-[100px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#187C19]"
              placeholder="What's on your mind?"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              maxLength={500}
              required
            />
            <div className="flex items-center gap-3 flex-wrap">
              <select
                className="h-9 rounded-lg border border-input bg-transparent px-3 py-1 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded"
                />
                Post anonymously
              </label>
              <Button type="submit" size="sm" disabled={submitting || !newContent.trim()} className="ml-auto">
                <Send className="w-4 h-4 mr-1" />
                {submitting ? "Posting..." : "Post"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Confessions Feed */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading confessions...</div>
      ) : confessions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-gray-500">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No confessions yet.</p>
            <p className="text-sm">Be the first to share!</p>
          </CardContent>
        </Card>
      ) : (
        confessions.map((confession) => (
          <Card key={confession.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <Badge variant="outline" className="text-xs">
                  {confession.category}
                </Badge>
                <span className="text-xs text-gray-400">{confession.created_at}</span>
              </div>
              <p className="text-gray-800 mb-3">{confession.content}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <button
                  onClick={() => handleReact(confession.id)}
                  className={`flex items-center gap-1 hover:text-red-500 transition-colors ${confession.liked ? "text-red-500" : ""}`}
                >
                  <Heart className={`w-4 h-4 ${confession.liked ? "fill-current" : ""}`} />
                  {confession.likes}
                </button>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {confession.comments}
                </span>
                <button className="flex items-center gap-1 hover:text-red-500 transition-colors ml-auto">
                  <Flag className="w-4 h-4" />
                  Report
                </button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
