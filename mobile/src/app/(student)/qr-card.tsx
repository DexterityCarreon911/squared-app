import { useEffect, useState } from "react"
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { api, type StudentProfile } from "@/services/api"
import { colors } from "@/theme"

export default function QRCardScreen() {
  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    let active = true
    api.getStudent()
      .then((profile) => {
        if (active) setStudent(profile)
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load your QR card.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const regenerateQR = async () => {
    setRegenerating(true)
    setError("")
    try {
      const result = await api.regenerateQR(await api.getCsrfToken())
      if (result.status !== "success") throw new Error(result.message || "Could not create a new QR code.")
      setStudent(await api.getStudent())
    } catch (regenerateError) {
      setError(regenerateError instanceof Error ? regenerateError.message : "Could not create a new QR code.")
    } finally {
      setRegenerating(false)
    }
  }

  const qrUri = student?.qr_code ? `${api.baseUrl}/qr_images/${encodeURIComponent(student.qr_code)}` : null

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.page}>
      <Text style={styles.heading}>My QR card</Text>
      <Text style={styles.subtitle}>Show this QR code to check in at Squared events.</Text>

      {loading ? (
        <View style={styles.card}><Text style={styles.muted}>Loading your student card...</Text></View>
      ) : (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.brand}>SQUARED QR</Text>
            <Text style={styles.cardLabel}>STUDENT ID</Text>
          </View>
          <View style={styles.qrFrame}>
            {qrUri ? (
              <Image accessibilityLabel="Student attendance QR code" resizeMode="contain" source={{ uri: qrUri }} style={styles.qrImage} />
            ) : (
              <Text style={styles.muted}>No QR code is available yet.</Text>
            )}
          </View>
          <Text style={styles.name}>
            {[student?.first_name, student?.middle_name, student?.last_name, student?.suffix].filter(Boolean).join(" ") || "Student"}
          </Text>
          <Text style={styles.studentId}>ID: {student?.student_id || "—"}</Text>
          {!!student?.program && <Text style={styles.program}>{student.program}</Text>}
        </View>
      )}

      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {!loading && !student?.qr_code ? (
        <Pressable disabled={regenerating} onPress={() => void regenerateQR()} style={styles.button}>
          <Text style={styles.buttonText}>{regenerating ? "Creating QR code..." : "Generate my QR code"}</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { padding: 22, paddingTop: 28, paddingBottom: 36 },
  heading: { color: colors.text, fontSize: 29, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 8, marginBottom: 22 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 22, borderWidth: 1, alignItems: "center", padding: 20 },
  cardHeader: { alignSelf: "stretch", backgroundColor: colors.primary, borderRadius: 14, padding: 16 },
  brand: { color: "#e5f5e5", fontSize: 11, fontWeight: "900", letterSpacing: 1.4 },
  cardLabel: { color: "#fff", fontSize: 18, fontWeight: "800", marginTop: 4 },
  qrFrame: { alignItems: "center", borderColor: colors.border, borderRadius: 14, borderWidth: 1, height: 230, justifyContent: "center", marginTop: 22, padding: 10, width: 230 },
  qrImage: { height: "100%", width: "100%" },
  muted: { color: colors.muted, textAlign: "center" },
  name: { color: colors.text, fontSize: 18, fontWeight: "800", marginTop: 18, textAlign: "center" },
  studentId: { color: colors.muted, marginTop: 5 },
  program: { backgroundColor: "#e9f5e9", borderRadius: 16, color: colors.primary, fontSize: 12, fontWeight: "800", overflow: "hidden", paddingHorizontal: 12, paddingVertical: 6, marginTop: 12 },
  error: { color: colors.danger, lineHeight: 20, marginTop: 16 },
  button: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 12, justifyContent: "center", minHeight: 48, marginTop: 18 },
  buttonText: { color: "#fff", fontWeight: "800" },
})
