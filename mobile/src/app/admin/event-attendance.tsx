import { Redirect } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import * as FileSystem from "expo-file-system/legacy"
import * as Sharing from "expo-sharing"
import AdminNavigation from "@/components/AdminNavigation"
import { useAdmin } from "@/contexts/AdminContext"
import { api, type AdminEvent, type AdminEventAttendanceRecord } from "@/services/api"
import { colors } from "@/theme"

const attendanceStatuses = ["", "confirmed", "pending"] as const
type AttendanceStatus = typeof attendanceStatuses[number]

export default function AdminEventAttendanceScreen() {
  const { admin, loading: authLoading } = useAdmin()
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [eventId, setEventId] = useState<number | null>(null)
  const [status, setStatus] = useState<AttendanceStatus>("")
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [records, setRecords] = useState<AdminEventAttendanceRecord[]>([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [summary, setSummary] = useState({ total: 0, confirmed: 0, pending: 0 })
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [loadingReport, setLoadingReport] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!admin) return
    let active = true
    api.getAdminEvents()
      .then((items) => {
        if (!active) return
        setEvents(items)
        setEventId(items[0]?.event_id ?? null)
        if (items.length) setLoadingReport(true)
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load events.")
      })
      .finally(() => { if (active) setLoadingEvents(false) })
    return () => { active = false }
  }, [admin])

  useEffect(() => {
    if (!admin || !eventId) return
    let active = true
    api.getAdminEventAttendanceReport({ eventId, status, search, page })
      .then((result) => {
        if (!active) return
        setRecords(result.records)
        setPage(result.page)
        setPages(result.pages)
        setTotal(result.total)
        setSummary(result.summary)
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load attendance report.")
      })
      .finally(() => { if (active) setLoadingReport(false) })
    return () => { active = false }
  }, [admin, eventId, status, search, page])

  if (authLoading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
  if (!admin) return <Redirect href="/admin/login" />

  const selectedEvent = events.find((event) => event.event_id === eventId)
  const searchRecords = () => {
    setError("")
    const nextSearch = searchInput.trim()
    if (nextSearch !== search || page !== 1) {
      setLoadingReport(true)
      setPage(1)
      setSearch(nextSearch)
    }
  }
  const exportCsv = async () => {
    if (!eventId || exporting) return
    setError("")
    setExporting(true)
    try {
      const csv = await api.exportAdminEventAttendance(eventId)
      if (!FileSystem.cacheDirectory) throw new Error("Temporary file storage is unavailable on this device.")
      const uri = `${FileSystem.cacheDirectory}event-attendance-${eventId}.csv`
      await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 })
      if (!await Sharing.isAvailableAsync()) throw new Error("File sharing is not available on this device.")
      await Sharing.shareAsync(uri, { mimeType: "text/csv", dialogTitle: "Share confirmed event attendance" })
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Could not export event attendance.")
    } finally {
      setExporting(false)
    }
  }

  return (
    <View style={styles.page}>
      <AdminNavigation />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Event attendance report</Text>
        <Text style={styles.subtitle}>Review confirmed and pending attendance and export confirmed attendees.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <View style={styles.card}>
          <Text style={styles.label}>EVENT</Text>
          {loadingEvents ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : events.length === 0
            ? <Text style={styles.muted}>No events are available.</Text>
            : <View style={styles.chips}>{events.map((event) => (
              <Pressable key={event.event_id} onPress={() => {
                if (eventId === event.event_id) return
                setEventId(event.event_id)
                setPage(1)
                setError("")
                setLoadingReport(true)
              }} style={[styles.chip, eventId === event.event_id && styles.selectedChip]}>
                <Text style={[styles.chipText, eventId === event.event_id && styles.selectedChipText]}>{event.event_name}</Text>
              </Pressable>
            ))}</View>}
          {selectedEvent ? <Text style={styles.muted}>{selectedEvent.event_date} · {selectedEvent.status}</Text> : null}
        </View>
        {eventId ? (
          <>
            <View style={styles.stats}>
              <Metric label="Total" value={String(summary.total)} />
              <Metric label="Confirmed" value={String(summary.confirmed)} />
              <Metric label="Pending" value={String(summary.pending)} />
            </View>
            <View style={styles.card}>
              <Text style={styles.label}>STATUS</Text>
              <View style={styles.chips}>{attendanceStatuses.map((item) => (
                <Pressable key={item || "all"} onPress={() => {
                  if (status === item) return
                  setStatus(item)
                  setPage(1)
                  setError("")
                  setLoadingReport(true)
                }} style={[styles.chip, status === item && styles.selectedChip]}>
                  <Text style={[styles.chipText, status === item && styles.selectedChipText]}>{item || "All"}</Text>
                </Pressable>
              ))}</View>
              <View style={styles.row}>
                <TextInput autoCapitalize="none" autoCorrect={false} onChangeText={setSearchInput} onSubmitEditing={searchRecords} placeholder="Student ID or name" placeholderTextColor={colors.placeholder} style={[styles.input, styles.flex]} value={searchInput} />
                <Pressable onPress={searchRecords} style={styles.button}><Text style={styles.buttonText}>Search</Text></Pressable>
              </View>
              <Pressable disabled={exporting} onPress={() => void exportCsv()} style={[styles.secondary, exporting && styles.disabled]}>
                <Text style={styles.secondaryText}>{exporting ? "Preparing export…" : "Export all confirmed attendance"}</Text>
              </Pressable>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{total} matching records</Text>
              {loadingReport ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : records.length === 0
                ? <Text style={styles.muted}>No attendance records match these filters.</Text>
                : records.map((record) => (
                  <View key={`${record.student_id}-${record.scanned_at}`} style={styles.record}>
                    <Text style={styles.recordName}>{record.student_name} · {record.student_id}</Text>
                    <Text style={styles.muted}>{record.program} · {record.course}</Text>
                    <Text style={styles.muted}>{record.sex} · {record.status} · Scanned {record.scanned_at}</Text>
                    {record.evaluated_at ? <Text style={styles.muted}>Evaluation completed {record.evaluated_at}</Text> : null}
                  </View>
                ))}
              {!loadingReport ? (
                <View style={styles.pagination}>
                  <Pressable disabled={page <= 1} onPress={() => { setLoadingReport(true); setPage((value) => value - 1) }} style={[styles.secondary, page <= 1 && styles.disabled]}><Text style={styles.secondaryText}>Previous</Text></Pressable>
                  <Text style={styles.muted}>Page {page} of {pages}</Text>
                  <Pressable disabled={page >= pages} onPress={() => { setLoadingReport(true); setPage((value) => value + 1) }} style={[styles.secondary, page >= pages && styles.disabled]}><Text style={styles.secondaryText}>Next</Text></Pressable>
                </View>
              ) : null}
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.muted}>{label}</Text></View>
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  center: { alignItems: "center", backgroundColor: colors.background, flex: 1, justifyContent: "center" },
  heading: { color: colors.text, fontSize: 25, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 12, borderWidth: 1, marginTop: 10, padding: 12 },
  cardTitle: { color: colors.text, fontSize: 13, fontWeight: "800" },
  label: { color: colors.text, fontSize: 10, fontWeight: "800" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  chip: { borderColor: colors.border, borderRadius: 15, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 7 },
  selectedChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.muted, fontSize: 10 },
  selectedChipText: { color: "#fff", fontWeight: "800" },
  stats: { flexDirection: "row", gap: 7, marginTop: 10 },
  metric: { backgroundColor: "#e8f5e9", borderRadius: 10, flex: 1, padding: 9 },
  metricValue: { color: colors.primary, fontSize: 17, fontWeight: "900" },
  row: { alignItems: "center", flexDirection: "row", gap: 7 },
  flex: { flex: 1 },
  input: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 9, borderWidth: 1, color: colors.text, marginTop: 9, paddingHorizontal: 10, paddingVertical: 10 },
  button: { backgroundColor: colors.primary, borderRadius: 8, marginTop: 9, paddingHorizontal: 12, paddingVertical: 10 },
  buttonText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  secondary: { alignSelf: "flex-start", backgroundColor: "#f1f7f1", borderRadius: 8, marginTop: 8, paddingHorizontal: 10, paddingVertical: 8 },
  secondaryText: { color: colors.primary, fontSize: 10, fontWeight: "800" },
  disabled: { opacity: 0.5 },
  record: { borderTopColor: colors.border, borderTopWidth: 1, marginTop: 9, paddingTop: 9 },
  recordName: { color: colors.text, fontSize: 12, fontWeight: "800" },
  muted: { color: colors.muted, fontSize: 10, lineHeight: 16, marginTop: 4 },
  loading: { marginVertical: 12 },
  pagination: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginTop: 10, padding: 12 },
})
