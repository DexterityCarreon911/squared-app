import { useCallback, useEffect, useState } from "react"
import { Link } from "expo-router"
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { api, type StudentProfile } from "@/services/api"
import { colors } from "@/theme"

export default function StudentHomeScreen() {
  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  const loadStudent = useCallback(async () => {
    setRefreshing(true)
    setError("")
    try {
      setStudent(await api.getStudent())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load your profile.")
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    api.getStudent()
      .then((profile) => {
        if (active) setStudent(profile)
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load your profile.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const firstName = student?.first_name || "there"
  const displayName = [student?.first_name, student?.middle_name, student?.last_name, student?.suffix]
    .filter(Boolean)
    .join(" ")

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadStudent()} tintColor={colors.primary} />}
      style={styles.page}
    >
      <Text style={styles.eyebrow}>SQUARED STUDENT</Text>
      <Text style={styles.heading}>Hello, {firstName}</Text>
      <Text style={styles.subtitle}>Your campus activities, attendance, and student QR card.</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.muted}>Loading your dashboard...</Text>
        </View>
      ) : error ? (
        <View style={styles.card}>
          <Text style={styles.error}>{error}</Text>
          <Text style={styles.muted}>Pull down to try again.</Text>
        </View>
      ) : student ? (
        <>
          <View style={styles.profileCard}>
            <Text style={styles.cardLabel}>STUDENT PROFILE</Text>
            <Text style={styles.name}>{displayName || "Student"}</Text>
            <Text style={styles.profileDetail}>Student ID: {student.student_id || "—"}</Text>
            {!!student.program && <Text style={styles.pill}>{student.program}</Text>}
            {!!student.course && <Text style={styles.profileDetail}>{student.course}</Text>}
          </View>

          <Text style={styles.sectionTitle}>Quick access</Text>
          <Link href="/(student)/attendance" asChild>
            <Text style={styles.action}>
              <Text style={styles.actionTitle}>Record attendance</Text>
              {"\n"}Enter an event code or scan its QR code.
            </Text>
          </Link>
          <Link href="/(student)/qr-card" asChild>
            <Text style={styles.action}>
              <Text style={styles.actionTitle}>My QR card</Text>
              {"\n"}Show your student QR code at campus events.
            </Text>
          </Link>
          <Link href="/(student)/generate-qr" asChild>
            <Text style={styles.action}>
              <Text style={styles.actionTitle}>Generate a QR code</Text>
              {"\n"}Create a code from text, a URL, or an event code.
            </Text>
          </Link>
          <Link href="/(student)/attendance-record" asChild>
            <Text style={styles.action}>
              <Text style={styles.actionTitle}>Attendance history</Text>
              {"\n"}Review your event and NSTP attendance records.
            </Text>
          </Link>
          <Link href="/(student)/notifications" asChild>
            <Text style={styles.action}>
              <Text style={styles.actionTitle}>Notifications</Text>
              {"\n"}View and manage campus updates.
            </Text>
          </Link>
          <Link href="/(student)/confessions" asChild>
            <Text style={styles.action}>
              <Text style={styles.actionTitle}>Confessions</Text>
              {"\n"}Share and react to community posts.
            </Text>
          </Link>
          <Link href="/(student)/voting" asChild>
            <Text style={styles.action}>
              <Text style={styles.actionTitle}>Voting</Text>
              {"\n"}Vote in active campus elections.
            </Text>
          </Link>
          <Link href="/(student)/payments" asChild>
            <Text style={styles.action}>
              <Text style={styles.actionTitle}>Payments</Text>
              {"\n"}Review balances, payment status, and receipts.
            </Text>
          </Link>
          <Link href="/(student)/purchases" asChild>
            <Text style={styles.action}>
              <Text style={styles.actionTitle}>My purchases</Text>
              {"\n"}Review campus purchases and receipts.
            </Text>
          </Link>
          <Link href="/(student)/qr-quest" asChild>
            <Text style={styles.action}>
              <Text style={styles.actionTitle}>QR Quest</Text>
              {"\n"}Scan QR codes, collect students, and check rankings.
            </Text>
          </Link>
        </>
      ) : (
        <View style={styles.card}>
          <Text style={styles.error}>Your student profile was not returned by the server.</Text>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { padding: 22, paddingTop: 28, paddingBottom: 36 },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: "900", letterSpacing: 1.5 },
  heading: { color: colors.text, fontSize: 31, fontWeight: "900", marginTop: 8 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 8, marginBottom: 24 },
  center: { alignItems: "center", paddingVertical: 48 },
  muted: { color: colors.muted, marginTop: 12, lineHeight: 20 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 18, borderWidth: 1, padding: 20 },
  profileCard: { backgroundColor: colors.primary, borderRadius: 20, padding: 22 },
  cardLabel: { color: "#d5f0d6", fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  name: { color: "#fff", fontSize: 23, fontWeight: "800", marginTop: 12 },
  profileDetail: { color: "#e1f2e1", fontSize: 14, marginTop: 8 },
  pill: {
    alignSelf: "flex-start",
    backgroundColor: "#e4f3e4",
    borderRadius: 20,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 14,
  },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "800", marginTop: 28, marginBottom: 12 },
  action: {
    backgroundColor: "#fff",
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.muted,
    lineHeight: 21,
    marginBottom: 12,
    overflow: "hidden",
    padding: 18,
  },
  actionTitle: { color: colors.text, fontSize: 16, fontWeight: "800" },
  error: { color: colors.danger, fontWeight: "700", lineHeight: 21 },
})
