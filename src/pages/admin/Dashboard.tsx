import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Megaphone, CreditCard, TrendingUp, TrendingDown } from "lucide-react"

interface AdminStats {
  total_students: number
  total_events: number
  active_announcements: number
  total_payments: number
  recent_attendance: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/admin/php/dashboard_stats.php", {
          credentials: "include",
        })
        if (res.redirected) {
          window.location.href = "/admin"
          return
        }
        const data = await res.json()
        if (data.status === "success") {
          setStats(data.stats)
        }
      } catch (err) {
        console.error("Failed to fetch admin stats", err)
      }
      setLoading(false)
    }
    fetchStats()
  }, [])

  const statCards = [
    { label: "Total Students", value: stats?.total_students ?? 0, icon: Users, color: "bg-blue-100 text-blue-600" },
    { label: "Total Events", value: stats?.total_events ?? 0, icon: Calendar, color: "bg-purple-100 text-purple-600" },
    { label: "Announcements", value: stats?.active_announcements ?? 0, icon: Megaphone, color: "bg-orange-100 text-orange-600" },
    { label: "Payments", value: `₱${(stats?.total_payments ?? 0).toLocaleString()}`, icon: CreditCard, color: "bg-green-100 text-green-600" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Overview of your organization's data.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading dashboard...</div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                  {stats?.recent_attendance ?? 0}
                  <span className="text-sm font-normal text-gray-500">checked in today</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a href="/admin/students" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <p className="font-medium text-sm">Manage Students</p>
                  <p className="text-xs text-gray-500">Add, edit, or view student records</p>
                </a>
                <a href="/admin/events" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <p className="font-medium text-sm">Manage Events</p>
                  <p className="text-xs text-gray-500">Create and manage school events</p>
                </a>
                <a href="/admin/announcements" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <p className="font-medium text-sm">Post Announcement</p>
                  <p className="text-xs text-gray-500">Send out announcements to students</p>
                </a>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
