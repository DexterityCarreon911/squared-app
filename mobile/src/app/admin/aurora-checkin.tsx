import { CameraView, useCameraPermissions } from "expo-camera"
import { Redirect } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import AdminNavigation from "@/components/AdminNavigation"
import { useAdmin } from "@/contexts/AdminContext"
import { api, type AdminAuroraCheckin } from "@/services/api"
import { colors } from "@/theme"

interface Guest {
  id: string
  name: string
  program?: string
  course?: string
}

export default function AdminAuroraCheckinScreen() {
  const { admin, csrfToken, loading: authLoading } = useAdmin()
  const [permission, requestPermission] = useCameraPermissions()
  const [studentId, setStudentId] = useState("")
  const [guest, setGuest] = useState<Guest | null>(null)
  const [recent, setRecent] = useState<AdminAuroraCheckin[]>([])
  const [total, setTotal] = useState(0)
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [busy, setBusy] = useState(false)
  const [loadingRecent, setLoadingRecent] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  useEffect(() => {
    if (!admin) return
    let active = true
    api.getAdminAuroraCheckins()
      .then((result) => {
        if (!active) return
        setRecent(result.checkins)
        setTotal(result.total)
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load check-ins.")
      })
      .finally(() => { if (active) setLoadingRecent(false) })
    return () => { active = false }
  }, [admin])

  if (authLoading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
  if (!admin) return <Redirect href="/admin/login" />

  const refreshRecent = async () => {
    const result = await api.getAdminAuroraCheckins()
    setRecent(result.checkins)
    setTotal(result.total)
  }

  const processStudent = async (rawId: string) => {
    const id = rawId.trim()
    if (!id || busy) return
    setBusy(true)
    setError("")
    setNotice("")
    setGuest(null)
    try {
      const status = await api.getAdminAuroraStudentStatus(id)
      const student = status.student
      const aurora = status.aurora_night
      if (!student) throw new Error("Student details were not returned.")
      setGuest(student)
      if (!aurora?.active) {
        setNotice("Aurora Night check-in is currently inactive.")
        return
      }
      if (!aurora.is_paid) {
        setError(`${student.name} has not paid the Aurora Night registration fee.`)
        return
      }
      const existing = await api.checkAdminAuroraGuest(student.id, "check", csrfToken)
      if (existing.already_checked_in) {
        setNotice(`${student.name} already checked in at ${existing.checked_in_at || "an earlier time"}.`)
        return
      }
      const result = await api.checkAdminAuroraGuest(student.id, "checkin", csrfToken)
      if (!result.success) throw new Error(result.message || "Unable to record this check-in.")
      setNotice(`${student.name} checked in successfully.${result.ticket_id ? ` Ticket ${result.ticket_id}.` : ""}`)
      setStudentId("")
      await refreshRecent()
    } catch (checkinError) {
      setError(checkinError instanceof Error ? checkinError.message : "Unable to check in this student.")
    } finally {
      setBusy(false)
    }
  }

  const openScanner = async () => {
    setError("")
    setNotice("")
    if (!permission?.granted) {
      const result = await requestPermission()
      if (!result.granted) {
        setError("Camera permission is required to scan an Aurora guest QR code.")
        return
      }
    }
    setScanned(false)
    setScanning(true)
  }

  return (
    <View style={styles.page}>
      <AdminNavigation />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Aurora Night check-in</Text>
        <Text style={styles.subtitle}>Verify event payment before checking in a guest. Duplicate check-ins are blocked by the server.</Text>
        <View style={styles.summary}><Text style={styles.summaryValue}>{total}</Text><Text style={styles.summaryLabel}>Guests checked in</Text></View>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {notice ? <Text accessibilityRole="status" style={styles.success}>{notice}</Text> : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Scan guest QR code</Text>
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
              <Pressable onPress={() => setScanning(false)} style={styles.secondary}><Text style={styles.secondaryText}>Close scanner</Text></Pressable>
            </>
          ) : (
            <Pressable accessibilityRole="button" disabled={busy} onPress={() => void openScanner()} style={styles.button}>
              <Text style={styles.buttonText}>{permission?.granted ? "Open camera scanner" : "Allow camera and scan"}</Text>
            </Pressable>
          )}
          <Text style={styles.label}>OR ENTER STUDENT ID</Text>
          <View style={styles.formRow}>
            <TextInput autoCapitalize="characters" autoCorrect={false} editable={!busy} maxLength={15} onChangeText={setStudentId} onSubmitEditing={() => void processStudent(studentId)} placeholder="Student ID" placeholderTextColor={colors.placeholder} style={styles.input} value={studentId} />
            <Pressable accessibilityRole="button" disabled={busy || !studentId.trim()} onPress={() => void processStudent(studentId)} style={[styles.smallButton, (busy || !studentId.trim()) && styles.disabled]}>
              <Text style={styles.buttonText}>{busy ? "…" : "Check in"}</Text>
            </Pressable>
          </View>
          {guest ? <View style={styles.guest}><Text style={styles.guestName}>{guest.name}</Text><Text style={styles.muted}>{guest.id} · {guest.program || "—"} · {guest.course || "—"}</Text></View> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recent check-ins</Text>
          {loadingRecent ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : recent.length === 0 ? (
            <Text style={styles.muted}>No check-ins have been recorded yet.</Text>
          ) : recent.map((item) => (
            <View key={`${item.student_id}-${item.checked_in_at}`} style={styles.checkin}>
              <View style={styles.itemMain}><Text style={styles.guestName}>{item.student_name}</Text><Text style={styles.muted}>{item.student_id}</Text></View>
              <Text style={styles.time}>{item.checked_in_at}</Text>
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
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  summary: { alignItems: "center", alignSelf: "flex-start", backgroundColor: "#e8f5e9", borderRadius: 12, marginTop: 13, paddingHorizontal: 18, paddingVertical: 10 },
  summaryValue: { color: colors.primary, fontSize: 22, fontWeight: "900" },
  summaryLabel: { color: colors.muted, fontSize: 10, fontWeight: "700" },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 13, borderWidth: 1, marginTop: 13, padding: 14 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: "900" },
  camera: { height: 300, marginTop: 12, width: "100%" },
  button: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 10, justifyContent: "center", minHeight: 43, marginTop: 12, paddingHorizontal: 12 },
  buttonText: { color: "#fff", fontSize: 11, fontWeight: "900" },
  secondary: { alignItems: "center", backgroundColor: "#0f172a", borderRadius: 9, marginTop: 8, padding: 11 },
  secondaryText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  label: { color: colors.muted, fontSize: 10, fontWeight: "900", marginTop: 16 },
  formRow: { alignItems: "center", flexDirection: "row", gap: 7 },
  input: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 9, borderWidth: 1, color: colors.text, flex: 1, marginTop: 8, paddingHorizontal: 10, paddingVertical: 10 },
  smallButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 9, justifyContent: "center", marginTop: 8, minHeight: 41, paddingHorizontal: 12 },
  disabled: { opacity: 0.5 },
  guest: { backgroundColor: "#f8fafc", borderRadius: 9, marginTop: 10, padding: 11 },
  guestName: { color: colors.text, fontSize: 12, fontWeight: "800" },
  muted: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 4 },
  checkin: { alignItems: "center", borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", gap: 8, marginTop: 10, paddingTop: 10 },
  itemMain: { flex: 1 },
  time: { color: colors.muted, fontSize: 10, textAlign: "right" },
  loading: { marginTop: 12 },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginTop: 11, overflow: "hidden", padding: 12 },
  success: { backgroundColor: "#e8f5e9", borderRadius: 10, color: colors.primary, lineHeight: 20, marginTop: 11, overflow: "hidden", padding: 12 },
})
