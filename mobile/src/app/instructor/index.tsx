import { Link, Redirect } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native"
import { useInstructor } from "@/contexts/InstructorContext"
import { api, type InstructorAttendanceRecord } from "@/services/api"
import { colors } from "@/theme"

export default function InstructorDashboardScreen() {
  const { instructor, subjects, loading, error, refresh, logout } = useInstructor()
  const [data, setData] = useState<{
    stats: { total: number; time_in: number; time_out: number }
    sessions: string[]
    recent: InstructorAttendanceRecord[]
  } | null>(null)
  const [dataError, setDataError] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (!instructor) return
    let active = true
    api.getInstructorDashboard()
      .then((result) => { if (active) setData(result) })
      .catch((loadError: unknown) => {
        if (active) setDataError(loadError instanceof Error ? loadError.message : "Could not load dashboard.")
      })
    return () => { active = false }
  }, [instructor])

  if (!loading && !instructor) return <Redirect href="/instructor/login" />

  const refreshAll = async () => {
    setRefreshing(true)
    setDataError("")
    await Promise.all([refresh(), api.getInstructorDashboard().then(setData).catch((err: unknown) => {
      setDataError(err instanceof Error ? err.message : "Could not refresh dashboard.")
    })])
    setRefreshing(false)
  }

  const signOut = async () => {
    try { await logout() } catch (logoutError) {
      setDataError(logoutError instanceof Error ? logoutError.message : "Could not sign out.")
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refreshAll()} tintColor={colors.primary} />} style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>SQUARED NSTP</Text>
          <Text style={styles.heading}>Instructor portal</Text>
          <Text style={styles.subtitle}>Welcome, {instructor?.name || instructor?.id}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => void signOut()}><Text style={styles.signOut}>Sign out</Text></Pressable>
      </View>
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error || dataError ? <Text accessibilityRole="alert" style={styles.error}>{error || dataError}</Text> : null}

      <View style={styles.stats}>
        <Metric label="Time In today" value={data?.stats.time_in || 0} />
        <Metric label="Time Out today" value={data?.stats.time_out || 0} />
        <Metric label="Records" value={data?.stats.total || 0} />
      </View>

      <Text style={styles.sectionTitle}>Instructor tools</Text>
      <Link href="/instructor/subjects" asChild><Action title="Assigned subjects" detail="Review subjects and enrolled student counts." /></Link>
      <Link href="/instructor/scanner" asChild><Action title="Attendance scanner" detail="Time students in and out with QR or student ID." /></Link>
      <Link href="/instructor/records" asChild><Action title="Attendance history" detail="Filter and review NSTP attendance records." /></Link>
      <Link href="/instructor/evaluations" asChild><Action title="Evaluations" detail="Review student-submitted NSTP evaluations." /></Link>
      <Link href="/instructor/certificates" asChild><Action title="Certificates" detail="Review completion and issue status." /></Link>
      <Link href="/instructor/scanners" asChild><Action title="Scanners" detail="Review scanners assigned to instructor subjects." /></Link>

      <Text style={styles.sectionTitle}>Your subjects</Text>
      {subjects.length === 0 ? (
        <View style={styles.card}><Text style={styles.muted}>No subjects are assigned to this instructor account yet.</Text></View>
      ) : subjects.map((subject) => (
        <View key={subject.subject_code} style={styles.card}>
          <Text style={styles.cardTitle}>{subject.subject_code}{subject.section ? ` · ${subject.section}` : ""}</Text>
          <Text style={styles.muted}>{subject.subject_name}</Text>
          <Text style={styles.detail}>{subject.student_count} enrolled</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Recent attendance</Text>
      {data?.recent.map((record) => (
        <View key={record.id} style={styles.card}>
          <Text style={styles.cardTitle}>{record.first_name} {record.last_name} · {record.student_id}</Text>
          <Text style={styles.muted}>{record.subject_code} · {record.session_date}</Text>
          <Text style={styles.detail}>In {record.time_in || "—"} · Out {record.time_out || "—"}</Text>
        </View>
      ))}
      {!data?.recent.length && !loading ? <View style={styles.card}><Text style={styles.muted}>No recent attendance records.</Text></View> : null}
    </ScrollView>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>
}

function Action({ title, detail }: { title: string; detail: string }) {
  return <Pressable style={styles.action}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.muted}>{detail}</Text></Pressable>
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingTop: 28, paddingBottom: 36 },
  header: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between" },
  headerText: { flex: 1 },
  eyebrow: { color: colors.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  heading: { color: colors.text, fontSize: 26, fontWeight: "900", marginTop: 6 },
  subtitle: { color: colors.muted, fontSize: 14, marginTop: 5 },
  signOut: { color: colors.danger, fontSize: 12, fontWeight: "800", padding: 8 },
  stats: { flexDirection: "row", gap: 8, marginTop: 20 },
  metric: { alignItems: "center", backgroundColor: "#fff", borderColor: colors.border, borderRadius: 13, borderWidth: 1, flex: 1, padding: 12 },
  metricValue: { color: colors.primary, fontSize: 21, fontWeight: "900" },
  metricLabel: { color: colors.muted, fontSize: 10, marginTop: 5, textAlign: "center" },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: "800", marginBottom: 9, marginTop: 22 },
  action: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 14, borderWidth: 1, marginBottom: 9, padding: 15 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 14, borderWidth: 1, marginBottom: 9, padding: 15 },
  cardTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 5 },
  detail: { color: colors.muted, fontSize: 12, marginTop: 8 },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginTop: 12, overflow: "hidden", padding: 12 },
})
