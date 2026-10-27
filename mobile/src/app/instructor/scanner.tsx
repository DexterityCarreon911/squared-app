import { CameraView, useCameraPermissions } from "expo-camera"
import { Redirect } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import { useInstructor } from "@/contexts/InstructorContext"
import { api, type InstructorAttendanceRecord } from "@/services/api"
import { colors } from "@/theme"

export default function InstructorScannerScreen() {
  const { instructor, csrfToken, loading: authLoading } = useInstructor()
  const [permission, requestPermission] = useCameraPermissions()
  const [mode, setMode] = useState<"time_in" | "time_out">("time_in")
  const [studentId, setStudentId] = useState("")
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [records, setRecords] = useState<InstructorAttendanceRecord[]>([])

  const loadToday = useCallback(async () => {
    const today = new Date().toLocaleDateString("en-CA")
    const result = await api.getInstructorRecords("history", { from: today, to: today })
    setRecords(result.records)
  }, [])

  useEffect(() => {
    if (!instructor) return
    let active = true
    const today = new Date().toLocaleDateString("en-CA")
    api.getInstructorRecords("history", { from: today, to: today })
      .then((result) => { if (active) setRecords(result.records) })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load today's attendance.")
      })
    return () => { active = false }
  }, [instructor])

  if (authLoading) return <View style={styles.loading}><ActivityIndicator color={colors.primary} /></View>
  if (!instructor) return <Redirect href="/instructor/login" />

  const submitScan = async (value: string) => {
    const id = value.trim()
    if (!id || submitting) return
    setSubmitting(true)
    setError("")
    setNotice("")
    try {
      const result = await api.instructorScan(mode, id, csrfToken)
      setNotice(`${result.message || "Attendance recorded."}${result.student_name ? ` ${result.student_name}.` : ""}`)
      setStudentId("")
      setScanned(true)
      setScanning(false)
      await loadToday()
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Could not record attendance.")
    } finally {
      setSubmitting(false)
    }
  }

  const openScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission()
      if (!result.granted) {
        setError("Camera permission is required to scan student QR codes.")
        return
      }
    }
    setError("")
    setScanned(false)
    setScanning(true)
  }

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" style={styles.page}>
      <Text style={styles.heading}>NSTP attendance scanner</Text>
      <Text style={styles.subtitle}>Select the action before scanning or entering a student ID.</Text>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {notice ? <Text accessibilityRole="status" style={styles.success}>{notice}</Text> : null}
      <View style={styles.modeRow}>
        <Pressable accessibilityRole="radio" accessibilityState={{ checked: mode === "time_in" }} onPress={() => setMode("time_in")} style={[styles.mode, mode === "time_in" && styles.selectedMode]}><Text style={[styles.modeText, mode === "time_in" && styles.selectedModeText]}>Time In</Text></Pressable>
        <Pressable accessibilityRole="radio" accessibilityState={{ checked: mode === "time_out" }} onPress={() => setMode("time_out")} style={[styles.mode, mode === "time_out" && styles.selectedMode]}><Text style={[styles.modeText, mode === "time_out" && styles.selectedModeText]}>Time Out</Text></Pressable>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Scan student QR</Text>
        {scanning ? (
          <>
            <CameraView
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={scanned ? undefined : ({ data }) => {
                setStudentId(data)
                setScanned(true)
                setScanning(false)
                void submitScan(data)
              }}
              style={styles.camera}
            />
            <Pressable onPress={() => setScanning(false)} style={styles.secondaryButton}><Text style={styles.secondaryText}>Close camera</Text></Pressable>
          </>
        ) : (
          <Pressable disabled={submitting} onPress={() => void openScanner()} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>{permission?.granted ? "Open camera scanner" : "Allow camera and scan"}</Text>
          </Pressable>
        )}
        <Text style={styles.label}>OR ENTER STUDENT ID</Text>
        <TextInput autoCapitalize="none" autoCorrect={false} onChangeText={setStudentId} onSubmitEditing={() => void submitScan(studentId)} placeholder="Student ID" placeholderTextColor={colors.placeholder} returnKeyType="go" style={styles.input} value={studentId} />
        <Pressable disabled={!studentId.trim() || submitting} onPress={() => void submitScan(studentId)} style={[styles.button, (!studentId.trim() || submitting) && styles.disabled]}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Record {mode === "time_in" ? "Time In" : "Time Out"}</Text>}
        </Pressable>
      </View>
      <View style={styles.stats}>
        <Metric label="Time In today" value={records.filter((record) => record.time_in).length} />
        <Metric label="Time Out today" value={records.filter((record) => record.time_out).length} />
      </View>
      <Text style={styles.sectionTitle}>Today’s records</Text>
      {records.map((record) => (
        <View key={record.id} style={styles.card}>
          <Text style={styles.cardTitle}>{record.first_name} {record.last_name} · {record.student_id}</Text>
          <Text style={styles.muted}>{record.subject_code} · {record.session_date}</Text>
          <Text style={styles.muted}>In: {record.time_in || "—"} · Out: {record.time_out || "—"}</Text>
        </View>
      ))}
      {!records.length ? <View style={styles.card}><Text style={styles.muted}>No attendance records today.</Text></View> : null}
    </ScrollView>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.muted}>{label}</Text></View>
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 20, paddingTop: 28, paddingBottom: 36 },
  heading: { color: colors.text, fontSize: 26, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20, marginBottom: 16, marginTop: 7 },
  modeRow: { backgroundColor: "#e8eee8", borderRadius: 12, flexDirection: "row", padding: 4 },
  mode: { alignItems: "center", borderRadius: 9, flex: 1, justifyContent: "center", minHeight: 40 },
  selectedMode: { backgroundColor: colors.primary },
  modeText: { color: colors.muted, fontSize: 13, fontWeight: "800" },
  selectedModeText: { color: "#fff" },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 15, borderWidth: 1, marginTop: 12, padding: 15 },
  cardTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  secondaryButton: { alignItems: "center", borderColor: colors.primary, borderRadius: 11, borderWidth: 1, justifyContent: "center", minHeight: 44, marginTop: 13 },
  secondaryText: { color: colors.primary, fontWeight: "800" },
  camera: { height: 280, borderRadius: 12, marginTop: 12, overflow: "hidden" },
  label: { color: colors.muted, fontSize: 10, fontWeight: "900", letterSpacing: 0.8, marginTop: 16 },
  input: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, marginTop: 7, paddingHorizontal: 12, paddingVertical: 11 },
  button: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 11, justifyContent: "center", minHeight: 45, marginTop: 12 },
  buttonText: { color: "#fff", fontWeight: "800" },
  disabled: { opacity: 0.55 },
  loading: { alignItems: "center", backgroundColor: colors.background, flex: 1, justifyContent: "center" },
  stats: { flexDirection: "row", gap: 10, marginTop: 12 },
  metric: { alignItems: "center", backgroundColor: "#fff", borderColor: colors.border, borderRadius: 13, borderWidth: 1, flex: 1, padding: 12 },
  metricValue: { color: colors.primary, fontSize: 21, fontWeight: "900" },
  muted: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: "800", marginTop: 20 },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginBottom: 8, overflow: "hidden", padding: 12 },
  success: { backgroundColor: "#eaf7eb", borderRadius: 10, color: colors.primary, lineHeight: 20, marginBottom: 8, overflow: "hidden", padding: 12 },
})
