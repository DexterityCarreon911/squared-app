import { Redirect } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native"
import * as FileSystem from "expo-file-system/legacy"
import * as Sharing from "expo-sharing"
import { useInstructor } from "@/contexts/InstructorContext"
import { api, type InstructorAttendanceRecord } from "@/services/api"
import { colors } from "@/theme"

type RecordMode = "history" | "reports" | "evaluations" | "certificates"

function dateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function weekStart() {
  const date = new Date()
  const day = date.getDay() || 7
  date.setDate(date.getDate() - day + 1)
  return dateString(date)
}

function weekEnd() {
  const date = new Date()
  const day = date.getDay() || 7
  date.setDate(date.getDate() + 7 - day)
  return dateString(date)
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00`)
  return Number.isFinite(date.getTime()) && dateString(date) === value
}

function csvCell(value: unknown) {
  let text = String(value ?? "").replace(/[\r\n]+/g, " ")
  if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

function duration(record: InstructorAttendanceRecord) {
  if (!record.time_in || !record.time_out) return "—"
  const start = new Date(record.time_in.replace(" ", "T")).getTime()
  const end = new Date(record.time_out.replace(" ", "T")).getTime()
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return "—"
  const minutes = Math.floor((end - start) / 60_000)
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`
}

export default function InstructorRecordsScreen() {
  const { instructor, csrfToken, subjects } = useInstructor()
  const [mode, setMode] = useState<RecordMode>("history")
  const [from, setFrom] = useState(weekStart)
  const [to, setTo] = useState(weekEnd)
  const [subject, setSubject] = useState("")
  const [appliedFilters, setAppliedFilters] = useState({ from: weekStart(), to: weekEnd(), subject: "" })
  const [records, setRecords] = useState<InstructorAttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [issuingId, setIssuingId] = useState<number | null>(null)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!instructor) return
    let active = true
    const filters = mode === "reports" ? appliedFilters : { from, to, subject }
    const params: Record<string, string> = { from: filters.from, to: filters.to }
    if (filters.subject.trim()) params.subject = filters.subject.trim()
    const action = mode === "reports" ? "history" : mode
    api.getInstructorRecords(action, params)
      .then((result) => {
        if (!active) return
        setRecords(result.records)
        setError("")
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load instructor records.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [instructor, mode, from, to, subject, appliedFilters, refreshKey])

  if (!instructor) return <Redirect href="/instructor/login" />

  const applyReportFilters = () => {
    if (!isValidDate(from) || !isValidDate(to) || from > to) {
      setError("Enter valid dates in YYYY-MM-DD format, with From on or before To.")
      return
    }
    setError("")
    setNotice("")
    setLoading(true)
    setAppliedFilters({ from, to, subject })
    setRefreshKey((value) => value + 1)
  }

  const exportReport = async () => {
    if (!records.length || exporting) return
    setError("")
    setNotice("")
    setExporting(true)
    try {
      const headings = ["Student ID", "Student Name", "Subject", "Date", "Time In", "Time Out", "Duration", "Evaluation Status", "Certificate Issued"]
      const rows = records.map((record) => [
        record.student_id,
        `${record.first_name} ${record.last_name}`,
        record.subject_code,
        record.session_date,
        record.time_in || "",
        record.time_out || "",
        duration(record),
        record.evaluation_status || "confirmed",
        record.certificate_issued_at || "",
      ].map(csvCell).join(","))
      const csv = `\uFEFF${headings.map(csvCell).join(",")}\r\n${rows.join("\r\n")}`
      if (!FileSystem.cacheDirectory) throw new Error("Temporary file storage is unavailable on this device.")
      const uri = `${FileSystem.cacheDirectory}nstp-report-${appliedFilters.from}-to-${appliedFilters.to}.csv`
      await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 })
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "text/csv", dialogTitle: "Share NSTP attendance report" })
      } else {
        await Share.share({ title: "NSTP attendance report", message: csv })
      }
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Could not export this report.")
    } finally {
      setExporting(false)
    }
  }

  const issueCertificate = async (record: InstructorAttendanceRecord) => {
    setIssuingId(record.id)
    setError("")
    setNotice("")
    try {
      const result = await api.instructorIssueCertificate(record.id, csrfToken)
      setNotice(result.message || "Certificate issuance was recorded.")
      setRecords((current) => current.map((item) =>
        item.id === record.id ? { ...item, certificate_issued_at: new Date().toISOString() } : item,
      ))
    } catch (issueError) {
      setError(issueError instanceof Error ? issueError.message : "Could not update certificate status.")
    } finally {
      setIssuingId(null)
    }
  }

  const modes: { value: RecordMode; label: string }[] = [
    { value: "history", label: "History" },
    { value: "reports", label: "Reports" },
    { value: "evaluations", label: "Evaluations" },
    { value: "certificates", label: "Certificates" },
  ]

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" style={styles.page}>
      <Text style={styles.heading}>NSTP records</Text>
      <Text style={styles.subtitle}>Filter attendance history, review evaluation responses, and record certificate issuance.</Text>
      <View style={styles.modeRow}>
        {modes.map((item) => (
          <Pressable key={item.value} onPress={() => { setLoading(true); setMode(item.value) }} style={[styles.mode, mode === item.value && styles.selectedMode]}>
            <Text style={[styles.modeText, mode === item.value && styles.selectedModeText]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.filters}>
        <TextInput autoCapitalize="none" onChangeText={(value) => { if (mode !== "reports") setLoading(true); setFrom(value) }} placeholder="From YYYY-MM-DD" placeholderTextColor={colors.placeholder} style={styles.input} value={from} />
        <TextInput autoCapitalize="none" onChangeText={(value) => { if (mode !== "reports") setLoading(true); setTo(value) }} placeholder="To YYYY-MM-DD" placeholderTextColor={colors.placeholder} style={styles.input} value={to} />
        {mode === "reports" ? (
          <>
            <Text style={styles.filterLabel}>SUBJECT</Text>
            <View style={styles.subjectOptions}>
              {[{ subject_code: "", subject_name: "All subjects" }, ...subjects].map((item) => (
                <Pressable key={item.subject_code || "all"} onPress={() => setSubject(item.subject_code)} style={[styles.subjectOption, subject === item.subject_code && styles.selectedSubject]}>
                  <Text style={[styles.subjectText, subject === item.subject_code && styles.selectedSubjectText]}>{item.subject_code || item.subject_name}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable accessibilityRole="button" onPress={applyReportFilters} style={styles.button}>
              <Text style={styles.buttonText}>Apply report filters</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={!records.length || exporting || loading} onPress={() => void exportReport()} style={[styles.secondaryButton, (!records.length || exporting || loading) && styles.disabled]}>
              <Text style={styles.secondaryButtonText}>{exporting ? "Preparing CSV..." : "Export CSV"}</Text>
            </Pressable>
          </>
        ) : (
          <TextInput autoCapitalize="characters" onChangeText={(value) => { setLoading(true); setSubject(value) }} placeholder="Subject code (optional)" placeholderTextColor={colors.placeholder} style={styles.input} value={subject} />
        )}
      </View>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {notice ? <Text accessibilityRole="status" style={styles.success}>{notice}</Text> : null}
      {mode === "reports" && !loading && !error ? (
        <View style={styles.metrics}>
          <View style={styles.metric}><Text style={styles.metricValue}>{records.length}</Text><Text style={styles.muted}>Attendance records</Text></View>
          <View style={styles.metric}><Text style={styles.metricValue}>{records.filter((record) => record.time_in).length}</Text><Text style={styles.muted}>With Time In</Text></View>
          <View style={styles.metric}><Text style={styles.metricValue}>{records.filter((record) => record.time_out).length}</Text><Text style={styles.muted}>With Time Out</Text></View>
        </View>
      ) : null}
      {loading ? <View style={styles.card}><ActivityIndicator color={colors.primary} /><Text style={styles.muted}>Loading records...</Text></View> : records.length === 0 ? (
        <View style={styles.card}><Text style={styles.muted}>No records match these filters.</Text></View>
      ) : records.map((record) => (
        <View key={record.id} style={styles.card}>
          <Text style={styles.cardTitle}>{record.first_name} {record.last_name}</Text>
          <Text style={styles.muted}>{record.student_id} · {record.subject_code} · {record.session_date}</Text>
          {mode === "evaluations" ? (
            <>
              <Text style={styles.detail}>Submitted: {record.evaluation_submitted_at || "Not submitted"}</Text>
              {record.evaluation_data && Object.keys(record.evaluation_data).length > 0 ? Object.entries(record.evaluation_data).map(([key, value]) => (
                <View key={key} style={styles.answer}>
                  <Text style={styles.answerLabel}>{key.replace(/_/g, " ")}</Text>
                  <Text style={styles.answerValue}>{String(value ?? "—")}</Text>
                </View>
              )) : <Text style={styles.muted}>No evaluation response provided.</Text>}
            </>
          ) : (
            <>
              <Text style={styles.detail}>Time In: {record.time_in || "—"}</Text>
              <Text style={styles.detail}>Time Out: {record.time_out || "—"}</Text>
              {mode === "certificates" ? (
                <View style={styles.certRow}>
                  <Text style={styles.muted}>Certificate: {record.certificate_issued_at || "Not issued"}</Text>
                  {!record.certificate_issued_at ? (
                    <Pressable disabled={issuingId !== null} onPress={() => void issueCertificate(record)} style={[styles.smallButton, issuingId !== null && styles.disabled]}>
                      <Text style={styles.smallButtonText}>{issuingId === record.id ? "Saving..." : "Mark issued"}</Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
            </>
          )}
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 20, paddingTop: 28, paddingBottom: 36 },
  heading: { color: colors.text, fontSize: 26, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20, marginBottom: 15, marginTop: 7 },
  modeRow: { backgroundColor: "#e8eee8", borderRadius: 11, flexDirection: "row", padding: 3 },
  mode: { alignItems: "center", borderRadius: 9, flex: 1, justifyContent: "center", minHeight: 38, paddingHorizontal: 1 },
  selectedMode: { backgroundColor: colors.primary },
  modeText: { color: colors.muted, fontSize: 11, fontWeight: "800" },
  selectedModeText: { color: "#fff" },
  filters: { gap: 8, marginTop: 12 },
  input: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, paddingHorizontal: 12, paddingVertical: 10 },
  filterLabel: { color: colors.muted, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  subjectOptions: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  subjectOption: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 9, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 },
  selectedSubject: { backgroundColor: colors.primary, borderColor: colors.primary },
  subjectText: { color: colors.text, fontSize: 11, fontWeight: "700" },
  selectedSubjectText: { color: "#fff" },
  button: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 10, justifyContent: "center", minHeight: 42, marginTop: 3 },
  buttonText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  secondaryButton: { alignItems: "center", borderColor: colors.primary, borderRadius: 10, borderWidth: 1, justifyContent: "center", minHeight: 42 },
  secondaryButtonText: { color: colors.primary, fontSize: 12, fontWeight: "800" },
  disabled: { opacity: 0.55 },
  metrics: { flexDirection: "row", gap: 7, marginTop: 12 },
  metric: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 11, borderWidth: 1, flex: 1, padding: 11 },
  metricValue: { color: colors.primary, fontSize: 18, fontWeight: "900" },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 14, borderWidth: 1, marginTop: 11, padding: 15 },
  cardTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  muted: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  detail: { color: colors.text, fontSize: 12, marginTop: 8 },
  answer: { backgroundColor: colors.background, borderRadius: 9, marginTop: 8, padding: 10 },
  answerLabel: { color: colors.muted, fontSize: 10, fontWeight: "800", textTransform: "capitalize" },
  answerValue: { color: colors.text, fontSize: 13, lineHeight: 19, marginTop: 4 },
  certRow: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 6 },
  smallButton: { backgroundColor: colors.primary, borderRadius: 9, paddingHorizontal: 11, paddingVertical: 8 },
  smallButtonText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginTop: 10, overflow: "hidden", padding: 12 },
  success: { backgroundColor: "#eaf7eb", borderRadius: 10, color: colors.primary, lineHeight: 20, marginTop: 10, overflow: "hidden", padding: 12 },
})
