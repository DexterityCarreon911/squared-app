import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send, Search, CheckCircle, Clock, AlertCircle } from "lucide-react"

interface Ticket {
  id: number
  student_id: string
  student_name: string
  subject: string
  message: string
  status: string
  created_at: string
  last_reply: string
}

export default function AdminSupport() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [reply, setReply] = useState("")

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch("/admin/php/get_support_tickets.php", {
          credentials: "include",
        })
        if (res.redirected) {
          window.location.href = "/admin"
          return
        }
        const data = await res.json()
        if (data.status === "success") {
          setTickets(data.tickets || [])
        }
      } catch (err) {
        console.error("Failed to fetch tickets", err)
      }
      setLoading(false)
    }
    fetchTickets()
  }, [])

  const filtered = tickets.filter((t) =>
    t.subject.toLowerCase().includes(search.toLowerCase()) ||
    t.student_name.toLowerCase().includes(search.toLowerCase())
  )

  const openCount = tickets.filter((t) => t.status === "open").length

  const handleSendReply = async () => {
    if (!reply.trim() || !selectedTicket) return
    try {
      const res = await fetch("/admin/php/reply_support.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
        body: new URLSearchParams({
          ticket_id: String(selectedTicket.id),
          message: reply,
          csrf_token: "",
        }),
      })
      const data = await res.json()
      if (data.status === "success") {
        setReply("")
        // Update ticket status
        setTickets((prev) =>
          prev.map((t) => (t.id === selectedTicket.id ? { ...t, status: "replied" } : t))
        )
      }
    } catch (err) {
      console.error("Failed to send reply", err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support</h1>
          <p className="text-gray-500">Manage support tickets from students.</p>
        </div>
        <Badge variant="destructive" className="text-sm px-3 py-1">
          {openCount} open
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="Search tickets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4 text-gray-500 text-sm">Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No tickets found.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filtered.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedTicket?.id === ticket.id
                          ? "bg-[#187C19] text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">{ticket.subject}</span>
                        <Badge
                          variant={ticket.status === "open" ? "destructive" : ticket.status === "replied" ? "success" : "secondary"}
                          className="text-xs"
                        >
                          {ticket.status}
                        </Badge>
                      </div>
                      <p className={`text-xs truncate ${selectedTicket?.id === ticket.id ? "text-white/70" : "text-gray-500"}`}>
                        {ticket.student_name}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ticket Detail */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedTicket.subject}</CardTitle>
                    <CardDescription>
                      From {selectedTicket.student_name} ({selectedTicket.student_id}) — {selectedTicket.created_at}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={selectedTicket.status === "open" ? "destructive" : "success"}
                  >
                    {selectedTicket.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Original Message */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-[#187C19] rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {selectedTicket.student_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{selectedTicket.student_name}</p>
                      <p className="text-xs text-gray-400">{selectedTicket.created_at}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{selectedTicket.message}</p>
                </div>

                {/* Reply Box */}
                <div className="border rounded-lg p-4">
                  <label className="text-sm font-medium mb-2 block">Reply</label>
                  <textarea
                    className="w-full min-h-[100px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#187C19]"
                    placeholder="Type your reply..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                  />
                  <div className="flex justify-end mt-2">
                    <Button onClick={handleSendReply} disabled={!reply.trim()}>
                      <Send className="w-4 h-4 mr-1" /> Send Reply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12 text-gray-500">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Select a ticket</p>
                <p className="text-sm">Choose a ticket from the list to view details and reply.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
