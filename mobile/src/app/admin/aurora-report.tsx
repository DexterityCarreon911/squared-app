import { Redirect } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import * as FileSystem from "expo-file-system/legacy"
import * as Sharing from "expo-sharing"
import AdminNavigation from "@/components/AdminNavigation"
import { useAdmin } from "@/contexts/AdminContext"
import { api, type AdminAuroraReportRecord } from "@/services/api"
import { colors } from "@/theme"

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export default function AdminAuroraReportScreen() {
  const { admin, loading: authLoading } = useAdmin()
  const [records, setRecords] = useState<AdminAuroraReportRecord[]>([])
  const [search, setSearch] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalAll, setTotalAll] = useState(0)
  const [today, setToday] = useState(0)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!admin) return
    let active = true
    api.getAdminAuroraReport({ page: 1, search: "", dateFrom: "", dateTo: "" })
      .then((result) => {
        if (!active) return
        setRecords(result.checkins); setPages(result.pages); setTotal(result.total)
        setTotalAll(result.totalAll); setToday(result.today)
      })
      .catch((loadError: unknown) => { if (active) setError(loadError instanceof Error ? loadError.message : "Could not load Aurora report.") })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [admin])

  if (authLoading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
  if (!admin) return <Redirect href="/admin/login" />

  const load = async (targetPage = 1, filters = { search: search.trim(), dateFrom: from.trim(), dateTo: to.trim() }) => {
    if ((filters.dateFrom && !isValidDate(filters.dateFrom)) || (filters.dateTo && !isValidDate(filters.dateTo)) ||
      (filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo)) {
      setError("Enter valid dates in YYYY-MM-DD format, with From on or before To.")
      return
    }
    setLoading(true); setError("")
    try {
      const result = await api.getAdminAuroraReport({ page: targetPage, ...filters })
      setRecords(result.checkins); setPage(result.page); setPages(result.pages); setTotal(result.total)
      setTotalAll(result.totalAll); setToday(result.today)
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Could not load Aurora report.") }
    finally { setLoading(false) }
  }
  const exportCsv = async () => {
    if (exporting) return
    const filters = { search: search.trim(), dateFrom: from.trim(), dateTo: to.trim() }
    if ((filters.dateFrom && !isValidDate(filters.dateFrom)) || (filters.dateTo && !isValidDate(filters.dateTo)) ||
      (filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo)) {
      setError("Enter valid dates in YYYY-MM-DD format, with From on or before To.")
      return
    }
    setExporting(true); setError("")
    try {
      const content = await api.exportAdminAuroraReport(filters)
      if (!FileSystem.cacheDirectory) throw new Error("Temporary file storage is unavailable on this device.")
      const uri = `${FileSystem.cacheDirectory}aurora-checkin-report-${new Date().toISOString().slice(0, 10)}.csv`
      await FileSystem.writeAsStringAsync(uri, content, { encoding: FileSystem.EncodingType.UTF8 })
      if (!await Sharing.isAvailableAsync()) throw new Error("File sharing is not available on this device.")
      await Sharing.shareAsync(uri, { mimeType: "text/csv", dialogTitle: "Share filtered Aurora check-in report" })
    } catch (exportError) { setError(exportError instanceof Error ? exportError.message : "Could not export Aurora report.") }
    finally { setExporting(false) }
  }

  return (
    <View style={styles.page}>
      <AdminNavigation />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Aurora check-in report</Text>
        <Text style={styles.subtitle}>Search check-ins by student and filter by date range.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <View style={styles.stats}><Metric label="All check-ins" value={totalAll} /><Metric label="Today" value={today} /><Metric label="Filtered" value={total} /></View>
        <View style={styles.card}>
          <TextInput onChangeText={setSearch} onSubmitEditing={() => void load()} placeholder="Student ID or name" placeholderTextColor={colors.placeholder} style={styles.input} value={search} />
          <View style={styles.row}><TextInput onChangeText={setFrom} placeholder="From YYYY-MM-DD" placeholderTextColor={colors.placeholder} style={[styles.input, styles.flex]} value={from} /><TextInput onChangeText={setTo} placeholder="To YYYY-MM-DD" placeholderTextColor={colors.placeholder} style={[styles.input, styles.flex]} value={to} /></View>
          <View style={styles.row}><Pressable onPress={() => void load()} style={styles.button}><Text style={styles.buttonText}>Apply filters</Text></Pressable><Pressable disabled={exporting} onPress={() => void exportCsv()} style={[styles.secondary, exporting && styles.disabled]}><Text style={styles.secondaryText}>{exporting ? "Preparing CSV…" : "Export all filtered CSV"}</Text></Pressable><Pressable onPress={() => { setSearch(""); setFrom(""); setTo(""); void load(1, { search: "", dateFrom: "", dateTo: "" }) }} style={styles.secondary}><Text style={styles.secondaryText}>Clear</Text></Pressable></View>
        </View>
        {loading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : records.length === 0 ? <View style={styles.card}><Text style={styles.muted}>No check-ins match the selected filters.</Text></View> : records.map((record) => (
          <View key={`${record.student_id}-${record.checked_in_at}`} style={styles.card}>
            <Text style={styles.cardTitle}>{record.student_name}</Text>
            <Text style={styles.muted}>{record.student_id} · {record.program || "—"} · {record.course || "—"}</Text>
            <Text style={styles.muted}>Ticket {record.ticket_id || "—"} · {record.checked_in_at}</Text>
            <Text style={styles.muted}>Scanned by {record.scanned_by || "—"}</Text>
          </View>
        ))}
        {!loading ? <View style={styles.pagination}><Pressable disabled={page <= 1} onPress={() => void load(page - 1)} style={[styles.secondary, page <= 1 && styles.disabled]}><Text style={styles.secondaryText}>Previous</Text></Pressable><Text style={styles.muted}>Page {page} of {pages}</Text><Pressable disabled={page >= pages} onPress={() => void load(page + 1)} style={[styles.secondary, page >= pages && styles.disabled]}><Text style={styles.secondaryText}>Next</Text></Pressable></View> : null}
      </ScrollView>
    </View>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.muted}>{label}</Text></View>
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  center: { alignItems: "center", backgroundColor: colors.background, flex: 1, justifyContent: "center" },
  heading: { color: colors.text, fontSize: 25, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  stats: { flexDirection: "row", gap: 7, marginTop: 12 },
  metric: { alignItems: "center", backgroundColor: "#e8f5e9", borderRadius: 10, flex: 1, padding: 9 },
  metricValue: { color: colors.primary, fontSize: 19, fontWeight: "900" },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 12, borderWidth: 1, marginTop: 9, padding: 12 },
  input: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 9, borderWidth: 1, color: colors.text, marginTop: 8, paddingHorizontal: 10, paddingVertical: 10 },
  row: { alignItems: "center", flexDirection: "row", gap: 7 },
  flex: { flex: 1 },
  button: { backgroundColor: colors.primary, borderRadius: 8, marginTop: 9, paddingHorizontal: 12, paddingVertical: 9 },
  buttonText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  secondary: { backgroundColor: "#f1f7f1", borderRadius: 8, marginTop: 9, paddingHorizontal: 10, paddingVertical: 9 },
  secondaryText: { color: colors.primary, fontSize: 10, fontWeight: "800" },
  disabled: { opacity: 0.5 },
  cardTitle: { color: colors.text, fontSize: 13, fontWeight: "800" },
  muted: { color: colors.muted, fontSize: 10, lineHeight: 16, marginTop: 4 },
  loading: { margin: 18 },
  pagination: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginTop: 10, padding: 12 },
})
