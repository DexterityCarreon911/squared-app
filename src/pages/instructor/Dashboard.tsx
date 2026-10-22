import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, CalendarDays, Clock3, LogIn, LogOut, QrCode, Users } from "lucide-react"
import { Card, dateLabel, getPortal, LoadingState, Notice, PageHeading, PortalFrame, shortDate, useRequireInstructor } from "./portal"

type DashboardData = {
  stats: { total: number; time_in: number; time_out: number }
  sessions: string[]
  recent: Array<{ id: number; first_name: string; last_name: string; student_id: string; subject_code: string; session_date: string; time_in: string | null; time_out: string | null }>
}

export default function InstructorDashboard() {
  const portal = useRequireInstructor()
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!portal.instructor) return
    let active = true
    getPortal<DashboardData & { success?: boolean }>("dashboard")
      .then((response) => { if (active) setData(response) })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : "Could not load dashboard.") })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [portal.instructor])

  const today = new Date()
  const todayText = today.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })
  return <PortalFrame instructor={portal.instructor} csrfToken={portal.csrfToken}>
    {portal.loading || loading ? <LoadingState /> : <>
      {portal.error && <Notice>{portal.error}</Notice>}
      {error && <Notice>{error}</Notice>}
      <PageHeading title={`Welcome${portal.instructor?.name ? `, ${portal.instructor.name}` : ""}`} description={`${todayText} · Your assigned NSTP subjects and attendance activity.`} />
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Time In today", value: data?.stats.time_in ?? 0, icon: LogIn, color: "text-[#187C19] bg-green-50" },
          { label: "Time Out today", value: data?.stats.time_out ?? 0, icon: LogOut, color: "text-amber-600 bg-amber-50" },
          { label: "Attendance records", value: data?.stats.total ?? 0, icon: Users, color: "text-gray-800 bg-gray-100" },
        ].map(({ label, value, icon: Icon, color }) => <div key={label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><span className="text-sm font-semibold text-gray-500">{label}</span><span className={`rounded-xl p-2 ${color}`}><Icon className="h-5 w-5" /></span></div>
          <p className="mt-3 text-3xl font-black">{value}</p>
        </div>)}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Your NSTP subjects" aside={<Link to="/instructor/subjects" className="inline-flex items-center gap-1 text-sm font-semibold text-[#187C19]">View all <ArrowRight className="h-4 w-4" /></Link>}>
          {!portal.subjects.length ? <p className="text-sm text-gray-500">No subjects are assigned to this instructor account yet. Contact the NSTP administrator.</p> : <div className="divide-y divide-gray-100">
            {portal.subjects.slice(0, 5).map((subject) => <div key={subject.subject_code} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div><p className="font-bold">{subject.subject_code}{subject.section ? ` · ${subject.section}` : ""}</p><p className="text-sm text-gray-500">{subject.subject_name || "NSTP subject"}</p></div>
              <span className="text-xs font-semibold text-gray-500">{subject.student_count} enrolled</span>
            </div>)}
          </div>}
        </Card>
        <Card title="Sessions this week">
          {!data?.sessions.length ? <p className="text-sm text-gray-500">No attendance sessions recorded for your subjects this week.</p> : <div className="space-y-2">
            {data.sessions.map((date) => <div key={date} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 text-sm"><CalendarDays className="h-4 w-4 text-[#187C19]" /><span className="font-semibold">{shortDate(date)}</span></div>)}
          </div>}
        </Card>
      </div>
      <Card title="Recent attendance" aside={<Link to="/instructor/attendance" className="inline-flex items-center gap-1 text-sm font-semibold text-[#187C19]">Scan history <ArrowRight className="h-4 w-4" /></Link>}>
        {!data?.recent.length ? <p className="text-sm text-gray-500">There are no attendance records for your assigned subjects yet.</p> : <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-gray-400"><tr><th className="pb-3">Student</th><th className="pb-3">Subject</th><th className="pb-3">Date</th><th className="pb-3">Latest scan</th><th className="pb-3">Status</th></tr></thead>
            <tbody>{data.recent.map((row) => <tr key={row.id} className="border-t border-gray-100">
              <td className="py-3 font-semibold">{row.first_name} {row.last_name}<span className="block text-xs font-normal text-gray-500">{row.student_id}</span></td>
              <td>{row.subject_code}</td><td>{shortDate(row.session_date)}</td>
              <td><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5 text-gray-400" />{dateLabel(row.time_out || row.time_in)}</span></td>
              <td>{row.time_out ? <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">Complete</span> : row.time_in ? <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">Time In</span> : "—"}</td>
            </tr>)}</tbody>
          </table>
        </div>}
      </Card>
      <Link to="/instructor/scan" className="flex items-center justify-between rounded-2xl bg-[#187C19] p-5 text-white shadow-lg shadow-green-900/10 transition hover:bg-green-800">
        <span className="flex items-center gap-3"><QrCode className="h-6 w-6" /><span><strong className="block">Record attendance</strong><span className="text-sm text-white/75">Scan or enter a student ID to Time In or Time Out.</span></span></span><ArrowRight className="h-5 w-5" />
      </Link>
    </>}
  </PortalFrame>
}
