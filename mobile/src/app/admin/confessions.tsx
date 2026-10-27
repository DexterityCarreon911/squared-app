import { Redirect } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import AdminNavigation from "@/components/AdminNavigation"
import { useAdmin } from "@/contexts/AdminContext"
import { api, type AdminConfession, type AdminConfessionReport } from "@/services/api"
import { colors } from "@/theme"

type Filter = "all" | "pending" | "reported"

export default function AdminConfessionsScreen() {
  const { admin, csrfToken, loading: authLoading } = useAdmin()
  const [filter, setFilter] = useState<Filter>("pending")
  const [confessions, setConfessions] = useState<AdminConfession[]>([])
  const [reports, setReports] = useState<AdminConfessionReport[]>([])
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, open_reports: 0 })
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!admin) return
    let active = true
    api.getAdminConfessions(filter, page)
      .then((data) => {
        if (!active) return
        setConfessions((current) => page === 1 ? data.confessions : [...current, ...data.confessions])
        setReports(data.reports)
        setStats(data.stats)
        setPages(data.pages)
        setError("")
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load confession moderation.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [admin, filter, page, reloadKey])

  if (authLoading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
  if (!admin) return <Redirect href="/admin/login" />

  const moderate = async (action: "approve" | "reject" | "delete" | "resolve_report", id: number) => {
    setActionId(id)
    setError("")
    setNotice("")
    try {
      const result = await api.moderateAdminConfession(action, id, csrfToken)
      setNotice(result.message || "Moderation action completed.")
      setLoading(true)
      setPage(1)
      setReloadKey((current) => current + 1)
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Could not update confession moderation.")
    } finally {
      setActionId(null)
    }
  }

  const confirmAction = (action: "approve" | "reject" | "delete" | "resolve_report", id: number, title: string) => {
    const messages = {
      approve: "Approve and publish this confession?",
      reject: "Reject this confession?",
      delete: "Delete this confession and its related reports/comments? This cannot be undone.",
      resolve_report: "Mark this report as resolved?",
    }
    Alert.alert(title, messages[action], [
      { text: "Cancel", style: "cancel" },
      {
        text: action === "delete" ? "Delete" : "Continue",
        style: action === "delete" || action === "reject" ? "destructive" : "default",
        onPress: () => void moderate(action, id),
      },
    ])
  }

  return (
    <View style={styles.page}>
      <AdminNavigation />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Confessions</Text>
        <Text style={styles.subtitle}>Review student submissions, moderate content, and resolve open reports.</Text>
        <View style={styles.stats}>
          <Metric label="Total" value={stats.total} />
          <Metric label="Pending" value={stats.pending} />
          <Metric label="Approved" value={stats.approved} />
          <Metric label="Reports" value={stats.open_reports} />
        </View>
        <View style={styles.filters}>
          {([
            ["pending", `Pending · ${stats.pending}`],
            ["all", "All"],
            ["reported", `Reports · ${stats.open_reports}`],
          ] as const).map(([value, label]) => (
            <Pressable key={value} onPress={() => {
              setLoading(true)
              setPage(1)
              setFilter(value)
              setError("")
            }} style={[styles.filterButton, filter === value && styles.selectedFilter]}>
              <Text style={[styles.filterText, filter === value && styles.selectedFilterText]}>{label}</Text>
            </Pressable>
          ))}
        </View>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {notice ? <Text accessibilityRole="status" style={styles.success}>{notice}</Text> : null}
        {loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : filter === "reported" ? (
          reports.length === 0 ? <Empty message="There are no open reports." /> : reports.map((report) => (
            <View key={report.id} style={styles.card}>
              <Text style={styles.cardTitle}>Report #{report.id} · {report.reason}</Text>
              <Text style={styles.muted}>Reported by {report.student_id} · {report.created_at}</Text>
              <Text style={styles.body}>{report.content}</Text>
              <Text style={styles.tag}>{report.category} · Confession #{report.confession_id}</Text>
              <Pressable
                accessibilityRole="button"
                disabled={actionId !== null}
                onPress={() => confirmAction("resolve_report", report.id, "Resolve report")}
                style={[styles.secondaryButton, actionId === report.id && styles.disabled]}
              >
                <Text style={styles.secondaryText}>{actionId === report.id ? "Saving..." : "Resolve report"}</Text>
              </Pressable>
            </View>
          ))
        ) : confessions.length === 0 ? <Empty message={filter === "pending" ? "No confessions are waiting for review." : "No confessions found."} /> : (
          confessions.map((confession) => (
            <View key={confession.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.tag}>{confession.category}</Text>
                <Text style={[styles.status, confession.status === "approved" ? styles.approved : confession.status === "rejected" ? styles.rejected : styles.pending]}>
                  {confession.status}
                </Text>
              </View>
              <Text style={styles.body}>{confession.content}</Text>
              <Text style={styles.muted}>{confession.is_anonymous ? "Anonymous" : confession.author || confession.student_id} · {confession.created_at}</Text>
              <Text style={styles.muted}>{confession.likes} likes · {confession.comments} comments · {confession.reported} open reports</Text>
              <View style={styles.actions}>
                {confession.status === "pending" ? (
                  <>
                    <Pressable accessibilityRole="button" disabled={actionId !== null} onPress={() => void moderate("approve", confession.id)} style={[styles.actionButton, styles.approveButton, actionId === confession.id && styles.disabled]}>
                      <Text style={styles.actionText}>{actionId === confession.id ? "Saving..." : "Approve"}</Text>
                    </Pressable>
                    <Pressable accessibilityRole="button" disabled={actionId !== null} onPress={() => confirmAction("reject", confession.id, "Reject confession")} style={[styles.actionButton, styles.rejectButton, actionId === confession.id && styles.disabled]}>
                      <Text style={styles.actionText}>Reject</Text>
                    </Pressable>
                  </>
                ) : null}
                <Pressable accessibilityRole="button" disabled={actionId !== null} onPress={() => confirmAction("delete", confession.id, "Delete confession")} style={[styles.actionButton, styles.deleteButton, actionId === confession.id && styles.disabled]}>
                  <Text style={styles.actionText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
        {!loading && page < pages ? (
          <Pressable accessibilityRole="button" onPress={() => { setLoading(true); setPage((current) => current + 1) }} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>{filter === "reported" ? "Load more reports" : "Load more confessions"}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>
}

function Empty({ message }: { message: string }) {
  return <View style={styles.card}><Text style={styles.muted}>{message}</Text></View>
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  center: { alignItems: "center", backgroundColor: colors.background, flex: 1, justifyContent: "center" },
  heading: { color: colors.text, fontSize: 26, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 14 },
  metric: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 11, borderWidth: 1, flexGrow: 1, minWidth: "22%", padding: 10 },
  metricValue: { color: colors.primary, fontSize: 18, fontWeight: "900" },
  metricLabel: { color: colors.muted, fontSize: 10, marginTop: 3 },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 9, marginTop: 14 },
  filterButton: { borderColor: colors.border, borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 },
  selectedFilter: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.text, fontSize: 11, fontWeight: "800" },
  selectedFilterText: { color: "#fff" },
  loader: { marginTop: 22 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 13, borderWidth: 1, marginBottom: 10, padding: 14 },
  cardHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  cardTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  body: { color: colors.text, fontSize: 13, lineHeight: 20, marginTop: 10 },
  muted: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 7 },
  tag: { color: colors.muted, fontSize: 10, fontWeight: "800", marginTop: 8, textTransform: "capitalize" },
  status: { borderRadius: 9, fontSize: 10, fontWeight: "800", overflow: "hidden", paddingHorizontal: 8, paddingVertical: 5, textTransform: "capitalize" },
  pending: { backgroundColor: "#fff4df", color: "#8a5700" },
  approved: { backgroundColor: "#e8f5e9", color: colors.primary },
  rejected: { backgroundColor: "#fff1f0", color: colors.danger },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 12 },
  actionButton: { borderRadius: 9, paddingHorizontal: 11, paddingVertical: 9 },
  approveButton: { backgroundColor: colors.primary },
  rejectButton: { backgroundColor: colors.danger },
  deleteButton: { backgroundColor: "#59645b" },
  actionText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  secondaryButton: { alignItems: "center", borderColor: colors.primary, borderRadius: 9, borderWidth: 1, marginBottom: 12, marginTop: 4, padding: 11 },
  secondaryText: { color: colors.primary, fontSize: 11, fontWeight: "800" },
  disabled: { opacity: 0.55 },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginBottom: 10, padding: 12 },
  success: { backgroundColor: "#eaf7eb", borderRadius: 10, color: colors.primary, lineHeight: 20, marginBottom: 10, padding: 12 },
})
