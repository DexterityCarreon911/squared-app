import { CameraView, useCameraPermissions } from "expo-camera"
import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { api, type QRQuestEntry, type QRQuestLeaderboardEntry } from "@/services/api"
import { colors } from "@/theme"

export default function QRQuestScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [collection, setCollection] = useState<QRQuestEntry[]>([])
  const [leaderboard, setLeaderboard] = useState<QRQuestLeaderboardEntry[]>([])
  const [total, setTotal] = useState(0)
  const [studentId, setStudentId] = useState("")
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const loadQuest = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true)
    else setLoading(true)
    setError("")
    try {
      const result = await api.getQRQuest()
      setCollection(result.collection)
      setTotal(result.total)
      setLeaderboard(result.leaderboard)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load QR Quest.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    api.getQRQuest()
      .then((result) => {
        if (!active) return
        setCollection(result.collection)
        setTotal(result.total)
        setLeaderboard(result.leaderboard)
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load QR Quest.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const scanStudent = async (value: string) => {
    const id = value.trim()
    if (!id || submitting) return
    setSubmitting(true)
    setError("")
    setNotice("")
    try {
      const result = await api.scanQRQuestStudent(id, await api.getCsrfToken())
      setNotice(`${result.message}${result.student_name ? ` ${result.student_name} was added.` : ""}`)
      setStudentId("")
      setScanned(true)
      setScanning(false)
      await loadQuest(true)
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Could not scan student QR.")
    } finally {
      setSubmitting(false)
    }
  }

  const openScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission()
      if (!result.granted) {
        setError("Camera permission is required to scan a student QR code.")
        return
      }
    }
    setError("")
    setScanned(false)
    setScanning(true)
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadQuest(true)} tintColor={colors.primary} />}
      style={styles.page}
    >
      <Text style={styles.heading}>QR Quest</Text>
      <Text style={styles.subtitle}>Scan another student’s QR code to add them to your collection.</Text>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {notice ? <Text accessibilityRole="status" style={styles.success}>{notice}</Text> : null}

      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>STUDENTS COLLECTED</Text>
        <Text style={styles.score}>{total}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Scan a student QR code</Text>
        <Text style={styles.muted}>Scan a classmate’s Squared QR or enter the student ID manually.</Text>
        {scanning ? (
          <>
            <CameraView
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={scanned ? undefined : ({ data }) => {
                setStudentId(data)
                setScanned(true)
                setScanning(false)
                void scanStudent(data)
              }}
              style={styles.camera}
            />
            <Pressable onPress={() => setScanning(false)} style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>Close camera</Text>
            </Pressable>
          </>
        ) : (
          <Pressable disabled={submitting} onPress={() => void openScanner()} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>{permission?.granted ? "Open QR scanner" : "Allow camera and scan"}</Text>
          </Pressable>
        )}
        <Text style={styles.label}>STUDENT ID</Text>
        <TextInput
          accessibilityLabel="Student ID from QR"
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setStudentId}
          onSubmitEditing={() => void scanStudent(studentId)}
          placeholder="Enter student ID"
          placeholderTextColor={colors.placeholder}
          returnKeyType="go"
          style={styles.input}
          value={studentId}
        />
        <Pressable disabled={!studentId.trim() || submitting} onPress={() => void scanStudent(studentId)} style={[styles.button, (!studentId.trim() || submitting) && styles.disabled]}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Add to collection</Text>}
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>My collection</Text>
      {loading ? (
        <View style={styles.card}><Text style={styles.muted}>Loading collection...</Text></View>
      ) : collection.length === 0 ? (
        <View style={styles.card}><Text style={styles.muted}>Your collection is empty. Scan a student QR code to get started.</Text></View>
      ) : collection.map((entry, index) => (
        <View key={`${entry.name}-${entry.scanned_at}-${index}`} style={styles.card}>
          <Text style={styles.cardTitle}>{entry.name}</Text>
          <Text style={styles.muted}>{entry.program || "Student"} · {entry.scanned_at}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Leaderboard</Text>
      {leaderboard.length === 0 ? (
        <View style={styles.card}><Text style={styles.muted}>No leaderboard entries yet.</Text></View>
      ) : leaderboard.map((entry) => (
        <View key={`${entry.rank}-${entry.name}`} style={styles.rankRow}>
          <Text style={styles.rank}>#{entry.rank}</Text>
          <View style={styles.rankInfo}>
            <Text style={styles.cardTitle}>{entry.name}</Text>
            <Text style={styles.muted}>{entry.program || "Student"}</Text>
          </View>
          <Text style={styles.points}>{entry.score} scans</Text>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { padding: 22, paddingTop: 28, paddingBottom: 36 },
  heading: { color: colors.text, fontSize: 28, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, marginBottom: 18, marginTop: 8 },
  scoreCard: { backgroundColor: colors.primary, borderRadius: 18, marginBottom: 14, padding: 20 },
  scoreLabel: { color: "#d5f0d6", fontSize: 11, fontWeight: "900", letterSpacing: 1.1 },
  score: { color: "#fff", fontSize: 38, fontWeight: "900", marginTop: 5 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 16, borderWidth: 1, marginBottom: 11, padding: 16 },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: "800" },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  secondaryButton: { alignItems: "center", borderColor: colors.primary, borderRadius: 11, borderWidth: 1, justifyContent: "center", minHeight: 44, marginTop: 14 },
  secondaryText: { color: colors.primary, fontWeight: "800" },
  camera: { height: 280, borderRadius: 14, marginTop: 14, overflow: "hidden" },
  label: { color: colors.muted, fontSize: 11, fontWeight: "900", letterSpacing: 1, marginTop: 16 },
  input: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 11, borderWidth: 1, color: colors.text, marginTop: 8, paddingHorizontal: 13, paddingVertical: 12 },
  button: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 11, justifyContent: "center", minHeight: 45, marginTop: 12 },
  buttonText: { color: "#fff", fontWeight: "800" },
  disabled: { opacity: 0.55 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "800", marginBottom: 10, marginTop: 12 },
  rankRow: { alignItems: "center", backgroundColor: "#fff", borderColor: colors.border, borderRadius: 14, borderWidth: 1, flexDirection: "row", marginBottom: 8, padding: 14 },
  rank: { color: colors.primary, fontSize: 17, fontWeight: "900", width: 42 },
  rankInfo: { flex: 1 },
  points: { color: colors.text, fontSize: 12, fontWeight: "800" },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginBottom: 12, overflow: "hidden", padding: 12 },
  success: { backgroundColor: "#eaf7eb", borderRadius: 10, color: colors.primary, lineHeight: 20, marginBottom: 12, overflow: "hidden", padding: 12 },
})
