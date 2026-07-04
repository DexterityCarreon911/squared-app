import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Download, Calendar, Clock, CheckCircle, XCircle, Filter } from "lucide-react"
import LoadingState from "@/components/LoadingState"
import EmptyState from "@/components/EmptyState"
import ErrorState from "@/components/ErrorState"

interface AttendanceRecord {
  event_name: string
  event_date: string
  time_in: string
  status: string
}

export default function AttendanceRecord() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [filtered, setFiltered] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const fetchRecords = async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch("/php/get_attendance.php", { credentials: "include" })
      if (!res.ok) throw new Error("Failed")
      const data = await res.json()
      if (data.status === "success" && data.attendance) {
        setRecords(data.attendance)
        setFiltered(data.attendance)
      }
    } catch {
      setError(true)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  useEffect(() => {
    let result = records
    if (search) {
      result = result.filter((r) =>
        r.event_name.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (statusFilter !== "all") {
      result = result.filter((r) => r.status.toLowerCase() === statusFilter.toLowerCase())
    }
    setFiltered(result)
  }, [search, statusFilter, records])

  const handleExport = () => {
    const csv = [
      ["Event", "Date", "Time In", "Status"],
      ...filtered.map((r) => [r.event_name, r.event_date, r.time_in, r.status]),
    ]
      .map((row) => row.join(","))
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "attendance-record.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const present = records.filter((r) => r.status === "Present").length
  const absent = records.filter((r) => r.status === "Absent").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Record</h1>
          <p className="text-gray-500">View your complete attendance history.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={filtered.length === 0}>
          <Download className="w-4 h-4 mr-1" /> Export CSV
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-xl font-bold">{present}</p>
              <p className="text-xs text-gray-500">Present</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-xl font-bold">{absent}</p>
              <p className="text-xs text-gray-500">Absent</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xl font-bold">{records.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["all", "Present", "Absent"].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
            >
              {s === "all" ? "All" : s}
            </Button>
          ))}
        </div>
      </div>

      {/* Records */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState onRetry={fetchRecords} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No records found" message={search ? "Try a different search term." : "No attendance records yet."} />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left">
                    <th className="p-4 font-medium text-gray-500">Event</th>
                    <th className="p-4 font-medium text-gray-500">Date</th>
                    <th className="p-4 font-medium text-gray-500">Time In</th>
                    <th className="p-4 font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((record, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-4 font-medium">{record.event_name}</td>
                      <td className="p-4 text-gray-600">{record.event_date}</td>
                      <td className="p-4 text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {record.time_in || "—"}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant={record.status === "Present" ? "success" : "destructive"}>
                          {record.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
