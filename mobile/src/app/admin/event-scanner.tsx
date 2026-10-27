import { CameraView, useCameraPermissions } from "expo-camera"
import { Redirect } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import AdminNavigation from "@/components/AdminNavigation"
import { useAdmin } from "@/contexts/AdminContext"
import { api, type AdminEvent, type AdminEventScanRecord } from "@/services/api"
import { colors } from "@/theme"

export default function AdminEventScannerScreen() {
  const { admin, csrfToken, loading: authLoading } = useAdmin()
  const [permission, requestPermission] = useCameraPermissions()
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [eventId, setEventId] = useState<number | null>(null)
  const [recent, setRecent] = useState<AdminEventScanRecord[]>([])
  const [studentId, setStudentId] = useState("")
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const loadFeed = useCallback(async (id: number) => {
    try {
      const result = await api.getAdminEventScanFeed(id)
      setRecent(result.recentScans)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load event scans.")
    }
  }, [])

  useEffect(() => {
    if (!admin) return
    let active = true
    api.getAdminEvents()
      .then((result) => {
        if (!active) return
        setEvents(result)
        const selected = result.find((event) => event.status === "Active")
        setEventId(selected?.event_id ?? result[0]?.event_id ?? null)
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load events.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [admin])

  useEffect(() => {
    if (!eventId) return
    let active = true
    api.getAdminEventScanFeed(eventId)
      .then((result) => {
        if (!active) return
        setRecent(result.recentScans)
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load event scans.")
      })
    return () => { active = false }
  }, [eventId])

  if (authLoading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
  if (!admin) return <Redirect href="/admin/login" />

  const processStudent = async (value: string) => {
    const id = value.trim()
    if (!eventId || !id || busy) return
    setBusy(true)
    setError("")
    setNotice("")
    try {
      const result = await api.scanAdminEvent(eventId, id, csrfToken)
      setNotice(`${result.student?.name || id} recorded. Attendance is pending until the student completes the event evaluation.`)
      setStudentId("")
      await loadFeed(eventId)
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Could not record event attendance.")
    } finally {
      setBusy(false)
    }
  }

  const openScanner = async () => {
    setError("")
    setNotice("")
    if (!eventId || events.find((event) => event.event_id === eventId)?.status !== "Active") {
      setError("Select an active event before scanning attendance.")
      return
    }
    if (!permission?.granted) {
      const result = await requestPermission()
      if (!result.granted) {
        setError("Camera permission is required to scan student QR codes.")
        return
      }
    }
    setScanned(false)
    setScanning(true)
  }

  const selectedEvent = events.find((event) => event.event_id === eventId)

  return (
    <View style={styles.page}>
      <AdminNavigation />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Event attendance scanner</Text>
        <Text style={styles.subtitle}>Scan or enter a student ID to record event attendance.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {notice ? <Text accessibilityRole="status" style={styles.success}>{notice}</Text> : null}
        <View style={styles.notice}>
          <Text style={styles.noticeText}>Admin scans are recorded as pending. Students must complete the configured evaluation to confirm attendance.</Text>
          <Text style={styles.noticeText}>Backend prerequisite: apply squared-old/admin/php/migrations/20261023_admin_event_scanner.sql before using administrator scans.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select an event</Text>
          {loading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : events.length === 0 ? (
            <Text style={styles.muted}>No events are configured.</Text>
          ) : (
            <View style={styles.chips}>
              {events.map((event) => (
                <Pressable
                  key={event.event_id}
                  accessibilityRole="button"
                  onPress={() => { setEventId(event.event_id); setError(""); setNotice(""); setScanning(false) }}
                  style={[styles.chip, eventId === event.event_id && styles.selectedChip]}
                >
                  <Text style={[styles.chipText, eventId === event.event_id && styles.selectedChipText]}>{event.event_name} · {event.status}</Text>
                </Pressable>
              ))}
            </View>
          )}
          {selectedEvent && selectedEvent.status !== "Active" ? <Text style={styles.errorInline}>This event is inactive. Activate it in Events before scanning.</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Scan student QR code</Text>
          {scanning ? (
            <>
              <CameraView
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={scanned ? undefined : ({ data }) => {
                  setScanned(true)
                  setScanning(false)
                  setStudentId(data)
                  void processStudent(data)
                }}
                style={styles.camera}
              />
              <Pressable accessibilityRole="button" onPress={() => setScanning(false)} style={styles.secondary}><Text style={styles.secondaryText}>Close scanner</Text></Pressable>
            </>
          ) : (
            <Pressable accessibilityRole="button" disabled={!selectedEvent || selectedEvent.status !== "Active" || busy} onPress={() => void openScanner()} style={[styles.button, (!selectedEvent || selectedEvent.status !== "Active" || busy) && styles.disabled]}>
              <Text style={styles.buttonText}>{permission?.granted ? "Open camera scanner" : "Allow camera and scan"}</Text>
            </Pressable>
          )}
          <Text style={styles.label}>OR ENTER STUDENT ID</Text>
          <View style={styles.formRow}>
            <TextInput autoCapitalize="characters" autoCorrect={false} editable={!busy} maxLength={15} onChangeText={setStudentId} onSubmitEditing={() => void processStudent(studentId)} placeholder="Student ID" placeholderTextColor={colors.placeholder} style={[styles.input, styles.flex]} value={studentId} />
            <Pressable accessibilityRole="button" disabled={busy || !studentId.trim() || !eventId || selectedEvent?.status !== "Active"} onPress={() => void processStudent(studentId)} style={[styles.button, styles.scanButton, (busy || !studentId.trim() || !eventId || selectedEvent?.status !== "Active") && styles.disabled]}>
              <Text style={styles.buttonText}>{busy ? "…" : "Record"}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent scans</Text>
          {recent.length === 0 ? <Text style={styles.muted}>No attendance scans for this event yet.</Text> : recent.map((scan) => (
            <View key={`${scan.student_id}-${scan.scanned_at}`} style={styles.scanRow}>
              <View style={styles.flex}>
                <Text style={styles.name}>{scan.first_name} {scan.last_name}</Text>
                <Text style={styles.muted}>{scan.student_id} · {scan.program || "No program"}</Text>
              </View>
              <View style={styles.scanMeta}><Text style={styles.status}>{scan.status}</Text><Text style={styles.muted}>{scan.scanned_at}</Text></View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  center: { alignItems: "center", backgroundColor: colors.background, flex: 1, justifyContent: "center" },
  heading: { color: colors.text, fontSize: 25, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginBottom: 12, marginTop: 6 },
  notice: { backgroundColor: "#fff8e1", borderRadius: 10, gap: 5, marginBottom: 12, padding: 12 },
  noticeText: { color: "#745b00", fontSize: 11, lineHeight: 16 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 13, borderWidth: 1, marginBottom: 12, padding: 14 },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: "800" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 10 },
  chip: { borderColor: colors.border, borderRadius: 16, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7 },
  selectedChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.muted, fontSize: 11 },
  selectedChipText: { color: "#fff", fontWeight: "800" },
  errorInline: { color: colors.danger, fontSize: 11, marginTop: 10 },
  loading: { marginVertical: 16 },
  muted: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 5 },
  button: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 9, justifyContent: "center", minHeight: 43, marginTop: 12, paddingHorizontal: 14 },
  buttonText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  secondary: { alignItems: "center", alignSelf: "flex-start", backgroundColor: "#f1f7f1", borderRadius: 9, marginTop: 10, paddingHorizontal: 12, paddingVertical: 9 },
  secondaryText: { color: colors.primary, fontSize: 11, fontWeight: "800" },
  disabled: { opacity: 0.5 },
  camera: { height: 280, marginTop: 10, overflow: "hidden", width: "100%" },
  label: { color: colors.muted, fontSize: 10, fontWeight: "800", marginTop: 12 },
  formRow: { alignItems: "center", flexDirection: "row", gap: 8 },
  input: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, marginTop: 10, paddingHorizontal: 12, paddingVertical: 11 },
  flex: { flex: 1 },
  scanButton: { minWidth: 82 },
  scanRow: { alignItems: "center", borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", gap: 8, paddingVertical: 10 },
  name: { color: colors.text, fontSize: 13, fontWeight: "800" },
  scanMeta: { alignItems: "flex-end" },
  status: { color: colors.primary, fontSize: 10, fontWeight: "800" },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginBottom: 12, overflow: "hidden", padding: 12 },
  success: { backgroundColor: "#eaf7eb", borderRadius: 10, color: colors.primary, lineHeight: 20, marginBottom: 12, overflow: "hidden", padding: 12 },
})
