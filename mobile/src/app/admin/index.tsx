import { Link, Redirect } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import AdminNavigation from "@/components/AdminNavigation"
import { useAdmin } from "@/contexts/AdminContext"
import { api } from "@/services/api"
import { colors } from "@/theme"

const programCourses: Record<string, string[]> = {
  ITE: ["Bachelor of Science in Information Technology"],
  CELA: [
    "Bachelor of Arts Major in History",
    "Bachelor of Arts Major in Political Science",
    "Bachelor of Elementary Education – Generalist",
    "Bachelor of Special Needs Education",
    "Bachelor of Secondary Education Major in English",
    "Bachelor of Secondary Education Major in Mathematics",
    "Bachelor of Secondary Education Major in Science",
    "Bachelor of Secondary Education Major in Social Studies",
    "Bachelor of Technology and Livelihood Education Major in Home Economics",
  ],
  CBA: [
    "Bachelor of Science in Business Administration Major in Financial Management",
    "Bachelor of Science in Business Administration Major in Human Resource Management",
    "Bachelor of Science in Business Administration Major in Marketing Management",
  ],
  HME: ["Bachelor of Science in Hospitality Management"],
  CJE: ["Bachelor of Science in Criminology"],
}

export default function AdminDashboardScreen() {
  const { admin, loading: authLoading } = useAdmin()
  const [stats, setStats] = useState<Awaited<ReturnType<typeof api.getAdminDashboard>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null)

  useEffect(() => {
    if (!admin) return
    let active = true
    api.getAdminDashboard()
      .then((result) => { if (active) setStats(result) })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load dashboard.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [admin])

  if (authLoading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
  if (!admin) return <Redirect href="/admin/login" />

  return (
    <View style={styles.page}>
      <AdminNavigation />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Dashboard</Text>
        <Text style={styles.subtitle}>Student enrollment overview by program.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {loading ? <ActivityIndicator color={colors.primary} /> : (
          <>
            <View style={styles.stats}>
              <Metric label="Total students" value={stats?.total_students || 0} />
              <Metric label="Male students" value={stats?.male_count || 0} />
              <Metric label="Female students" value={stats?.female_count || 0} />
            </View>
            <Text style={styles.sectionTitle}>Program enrollment</Text>
            {["ITE", "CELA", "CBA", "HME", "CJE"].map((program) => {
              const programStats = stats?.programs?.[program]
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: expandedProgram === program }}
                  key={program}
                  onPress={() => setExpandedProgram((current) => current === program ? null : program)}
                  style={styles.card}
                >
                  <Text style={styles.cardTitle}>{program} {expandedProgram === program ? "−" : "+"}</Text>
                  <Text style={styles.detail}>{programStats?.total || 0} students</Text>
                  <Text style={styles.muted}>Male {programStats?.male || 0} · Female {programStats?.female || 0}</Text>
                  {expandedProgram === program ? (
                    <View style={styles.courseList}>
                      {(programCourses[program] || []).map((course) => {
                        const courseStats = stats?.courses?.[course]
                        return (
                          <View key={course} style={styles.courseRow}>
                            <Text style={styles.courseName}>{course}</Text>
                            <Text style={styles.courseCount}>Total {courseStats?.total || 0} · Male {courseStats?.male || 0} · Female {courseStats?.female || 0}</Text>
                          </View>
                        )
                      })}
                    </View>
                  ) : null}
                </Pressable>
              )
            })}
          </>
        )}
        <Text style={styles.sectionTitle}>Management</Text>
        <Link href="/admin/students" asChild><Action title="Students" detail="Find student accounts and enrollment details." /></Link>
        <Link href="/admin/events" asChild><Action title="Events" detail="Review scheduled and past events." /></Link>
        <Link href="/admin/announcements" asChild><Action title="Announcements" detail="Publish and manage campus announcements." /></Link>
        <Link href="/admin/confessions" asChild><Action title="Confession moderation" detail="Review pending posts and manage open reports." /></Link>
        <Link href="/admin/payments" asChild><Action title="Student payments" detail="Review membership and event-fee payment records." /></Link>
        <Link href="/admin/support" asChild><Action title="Support requests" detail="Review student questions and send replies." /></Link>
        <Link href="/admin/pos" asChild><Action title="Point of sale" detail="Process cash sales, update inventory, and view receipts." /></Link>
        <Link href="/admin/aurora-checkin" asChild><Action title="Aurora Night check-in" detail="Verify payment and check in guests using QR or student ID." /></Link>
        <Link href="/admin/aurora-payments" asChild><Action title="Aurora Night payments" detail="Look up students, record event fees, and view payment receipts." /></Link>
      </ScrollView>
    </View>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.muted}>{label}</Text></View>
}
function Action({ title, detail }: { title: string; detail: string }) {
  return <Pressable style={styles.card}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.muted}>{detail}</Text></Pressable>
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 20, paddingBottom: 36 },
  center: { alignItems: "center", backgroundColor: colors.background, flex: 1, justifyContent: "center" },
  heading: { color: colors.text, fontSize: 26, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 14, marginBottom: 16, marginTop: 6 },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metric: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 12, borderWidth: 1, flexGrow: 1, minWidth: "30%", padding: 12 },
  metricValue: { color: colors.primary, fontSize: 22, fontWeight: "900" },
  muted: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: "800", marginBottom: 8, marginTop: 20 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 13, borderWidth: 1, marginBottom: 9, padding: 14 },
  cardTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  detail: { color: colors.text, fontSize: 14, fontWeight: "700", marginTop: 8 },
  courseList: { borderTopColor: colors.border, borderTopWidth: 1, marginTop: 12, paddingTop: 4 },
  courseRow: { borderBottomColor: colors.border, borderBottomWidth: 1, paddingVertical: 8 },
  courseName: { color: colors.text, fontSize: 11, fontWeight: "700", lineHeight: 16 },
  courseCount: { color: colors.muted, fontSize: 10, marginTop: 3 },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginBottom: 12, overflow: "hidden", padding: 12 },
})
