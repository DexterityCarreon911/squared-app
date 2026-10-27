import { Redirect } from "expo-router"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import { useInstructor } from "@/contexts/InstructorContext"
import { colors } from "@/theme"

export default function InstructorSubjectsScreen() {
  const { instructor, subjects, loading, error } = useInstructor()
  if (!loading && !instructor) return <Redirect href="/instructor/login" />

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.page}>
      <Text style={styles.heading}>Assigned subjects</Text>
      <Text style={styles.subtitle}>Subject assignments and enrolment details.</Text>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {loading ? <View style={styles.card}><Text style={styles.muted}>Loading subjects...</Text></View> : subjects.length === 0 ? (
        <View style={styles.card}><Text style={styles.cardTitle}>No assigned NSTP subjects</Text><Text style={styles.muted}>Contact the NSTP administrator to review your account assignments.</Text></View>
      ) : subjects.map((subject) => (
        <View key={subject.subject_code} style={styles.card}>
          <Text style={styles.code}>{subject.subject_code}</Text>
          <Text style={styles.cardTitle}>{subject.subject_name || "NSTP subject"}</Text>
          <Text style={styles.muted}>{subject.section ? `Section ${subject.section}` : "Section not set"}</Text>
          <Text style={styles.count}>{subject.student_count} students enrolled</Text>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 20, paddingTop: 28, paddingBottom: 36 },
  heading: { color: colors.text, fontSize: 27, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 14, marginBottom: 18, marginTop: 7 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 15, borderWidth: 1, marginBottom: 11, padding: 16 },
  code: { color: colors.primary, fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: "800", marginTop: 6 },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 5 },
  count: { color: colors.primary, fontSize: 12, fontWeight: "800", marginTop: 13 },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginBottom: 12, overflow: "hidden", padding: 12 },
})
