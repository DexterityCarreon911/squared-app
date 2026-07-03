import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QrCode, Calendar, Clock, CheckCircle, XCircle, Sparkles } from "lucide-react"

interface AttendanceRecord {
  event_name: string
  event_date: string
  status: string
  time_in: string
}

export default function StudentHome() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/php/get_attendance.php", {
          credentials: "include",
        })
        if (res.redirected) {
          window.location.href = "/login"
          return
        }
        const data = await res.json()
        if (data.status === "success" && data.attendance) {
          setAttendance(data.attendance)
          const present = data.attendance.filter((a: AttendanceRecord) => a.status === "Present").length
          const absent = data.attendance.filter((a: AttendanceRecord) => a.status === "Absent").length
          setStats({ present, absent, total: data.attendance.length })
        }
      } catch (err) {
        console.error("Failed to fetch attendance", err)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back! Here's your attendance overview.</p>
        </div>
        <Link
          to="/attendance"
          className="inline-flex items-center gap-2 bg-[#187C19] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#146414] transition-colors"
        >
          <QrCode className="w-4 h-4" /> Scan QR
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.present}</p>
              <p className="text-sm text-gray-500">Present</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.absent}</p>
              <p className="text-sm text-gray-500">Absent</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Events</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading attendance...</div>
          ) : attendance.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No attendance records yet.</p>
              <p className="text-sm">Attend an event to see your records here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium">Event</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Time In</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.slice(0, 10).map((record, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-3">{record.event_name}</td>
                      <td className="py-3">{record.event_date}</td>
                      <td className="py-3 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {record.time_in || "—"}
                      </td>
                      <td className="py-3">
                        <Badge variant={record.status === "Present" ? "success" : "destructive"}>
                          {record.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
