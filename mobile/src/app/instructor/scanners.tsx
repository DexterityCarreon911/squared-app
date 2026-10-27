import { Redirect } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import { useInstructor } from "@/contexts/InstructorContext"
import { api, type InstructorScanner } from "@/services/api"
import { colors } from "@/theme"

export default function InstructorScannersScreen() {
  const { instructor, csrfToken } = useInstructor()
  const [scanners, setScanners] = useState<InstructorScanner[]>([])
  const [studentId, setStudentId] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const load = async () => {
    setError("")
    try {
      setScanners(await api.getInstructorScanners())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load scanner permissions.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!instructor) return
    let active = true
    api.getInstructorScanners()
      .then((result) => { if (active) setScanners(result) })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load scanner permissions.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [instructor])

  if (!instructor) return <Redirect href="/instructor/login" />

  const add = async () => {
    if (!studentId.trim() || saving) return
    setSaving(true)
    setError("")
    setNotice("")
    try {
      const result = await api.addInstructorScanner(studentId.trim(), csrfToken)
      setNotice(result.message || "Student authorized as an NSTP scanner.")
      setStudentId("")
      await load()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not authorize student.")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (scanner: InstructorScanner) => {
    Alert.alert(
      "Remove scanner access?",
      `Remove NSTP scanning permission for ${scanner.first_name} ${scanner.last_name} (${scanner.student_id})?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => void confirmRemove(scanner) },
      ],
    )
  }

  const confirmRemove = async (scanner: InstructorScanner) => {
    setRemovingId(scanner.id)
    setError("")
    setNotice("")
    try {
      const result = await api.removeInstructorScanner(scanner.id, csrfToken)
      setNotice(result.message || "Scanner permission removed.")
      await load()
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Could not remove scanner permission.")
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" style={styles.page}>
      <Text style={styles.heading}>Student scanners</Text>
      <Text style={styles.subtitle}>Manage students allowed to assist with NSTP attendance scanning.</Text>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {notice ? <Text accessibilityRole="status" style={styles.success}>{notice}</Text> : null}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Authorize a student</Text>
        <Text style={styles.muted}>The student must already have an account.</Text>
        <TextInput autoCapitalize="none" autoCorrect={false} onChangeText={setStudentId} onSubmitEditing={() => void add()} placeholder="Student ID" placeholderTextColor={colors.placeholder} style={styles.input} value={studentId} />
        <Pressable accessibilityRole="button" disabled={!studentId.trim() || saving} onPress={() => void add()} style={[styles.button, (!studentId.trim() || saving) && styles.disabled]}>
          <Text style={styles.buttonText}>{saving ? "Authorizing..." : "Authorize scanner"}</Text>
        </Pressable>
      </View>
      <Text style={styles.sectionTitle}>Authorized scanners · {scanners.length}</Text>
      {loading ? <View style={styles.card}><ActivityIndicator color={colors.primary} /></View> : scanners.length === 0 ? (
        <View style={styles.card}><Text style={styles.muted}>No students currently have scanner permission.</Text></View>
      ) : scanners.map((scanner) => (
        <View key={scanner.id} style={styles.card}>
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.cardTitle}>{scanner.first_name} {scanner.last_name}</Text>
              <Text style={styles.muted}>{scanner.student_id}{scanner.program ? ` · ${scanner.program}` : ""}</Text>
            </View>
            <Pressable accessibilityRole="button" disabled={removingId !== null} onPress={() => void remove(scanner)} style={[styles.remove, removingId !== null && styles.disabled]}>
              <Text style={styles.removeText}>{removingId === scanner.id ? "Removing..." : "Remove"}</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 20, paddingTop: 28, paddingBottom: 36 },
  heading: { color: colors.text, fontSize: 26, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 7 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 14, borderWidth: 1, marginTop: 12, padding: 15 },
  cardTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  muted: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  input: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, marginTop: 12, paddingHorizontal: 12, paddingVertical: 11 },
  button: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 10, justifyContent: "center", minHeight: 43, marginTop: 10 },
  buttonText: { color: "#fff", fontWeight: "800" },
  disabled: { opacity: 0.55 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: "800", marginTop: 22 },
  row: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  info: { flex: 1 },
  remove: { borderColor: "#f2bbbb", borderRadius: 9, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 },
  removeText: { color: colors.danger, fontSize: 11, fontWeight: "800" },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginTop: 10, overflow: "hidden", padding: 12 },
  success: { backgroundColor: "#eaf7eb", borderRadius: 10, color: colors.primary, lineHeight: 20, marginTop: 10, overflow: "hidden", padding: 12 },
})
