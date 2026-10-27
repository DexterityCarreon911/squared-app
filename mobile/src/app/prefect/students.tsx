import { Redirect } from "expo-router"
import { useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import PrefectNavigation from "@/components/PrefectNavigation"
import { usePrefect } from "@/contexts/PrefectContext"
import { api, type PrefectStudentMatch } from "@/services/api"

interface StudentRecord {
  student: PrefectStudentMatch
  stats: { total_cases: number; open_cases: number; total_occurrences: number; tier: string }
  incidents: {
    id: number
    case_no: string
    violation_name: string
    status: string
    severity: string
    occurrences_applied: number
    incident_at: string
  }[]
}

export default function PrefectStudentsScreen() {
  const { user, loading: authLoading } = usePrefect()
  const [query, setQuery] = useState("")
  const [matches, setMatches] = useState<PrefectStudentMatch[]>([])
  const [record, setRecord] = useState<StudentRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState("")

  if (authLoading) return <View style={styles.center}><ActivityIndicator color="#92400e" /></View>
  if (!user) return <Redirect href="/prefect/login" />

  const selectStudent = async (student: PrefectStudentMatch) => {
    setMatches([])
    setQuery(`${student.first_name} ${student.last_name} · ${student.student_id}`)
    setLoading(true)
    setError("")
    try {
      setRecord(await api.getPrefectStudent(student.student_id))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load student record.")
    } finally {
      setLoading(false)
    }
  }

  const search = async () => {
    if (!query.trim()) return
    setError("")
    setSearching(true)
    try {
      setMatches((await api.searchPrefectStudents(query.trim())).matches)
      setRecord(null)
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "Student search failed.")
    } finally {
      setSearching(false)
    }
  }

  return (
    <View style={styles.page}>
      <PrefectNavigation />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Student records</Text>
        <Text style={styles.subtitle}>Find students and review their discipline case history.</Text>
        <View style={styles.searchRow}>
        <TextInput onChangeText={(value) => { setQuery(value); setRecord(null); setMatches([]) }} onSubmitEditing={() => void search()} placeholder="Student ID or name" placeholderTextColor="#94a3b8" style={styles.input} value={query} />
          <Pressable onPress={() => void search()} style={styles.searchButton}><Text style={styles.buttonText}>{searching ? "..." : "Search"}</Text></Pressable>
        </View>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {matches.map((student) => (
          <Pressable key={student.student_id} onPress={() => void selectStudent(student)} style={styles.match}>
            <Text style={styles.cardTitle}>{student.first_name} {student.last_name} · {student.student_id}</Text>
            <Text style={styles.muted}>{student.program}</Text>
          </Pressable>
        ))}
        {loading ? <ActivityIndicator color="#92400e" style={styles.loading} /> : null}
        {record ? (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{record.student.first_name} {record.student.last_name}</Text>
              <Text style={styles.muted}>{record.student.student_id} · {record.student.program} · {record.student.course}</Text>
              <View style={styles.stats}>
                <Metric label="Total cases" value={record.stats.total_cases} />
                <Metric label="Open cases" value={record.stats.open_cases} />
                <Metric label="Occurrences" value={record.stats.total_occurrences} />
                <Metric label="Discipline tier" value={record.stats.tier} />
              </View>
            </View>
            <Text style={styles.sectionTitle}>Discipline history</Text>
            {record.incidents.length === 0 ? (
              <View style={styles.card}><Text style={styles.muted}>No discipline records for this student.</Text></View>
            ) : record.incidents.map((incident) => (
              <View key={incident.id} style={styles.card}>
                <Text style={styles.case}>{incident.case_no}</Text>
                <Text style={styles.cardTitle}>{incident.violation_name || "Uncategorized"}</Text>
                <Text style={styles.muted}>Category {incident.severity.toUpperCase()} · {incident.occurrences_applied} occurrence(s)</Text>
                <Text style={styles.muted}>{incident.incident_at || "—"} · {incident.status.replaceAll("_", " ")}</Text>
              </View>
            ))}
          </>
        ) : !matches.length && !searching && query.trim() ? (
          <Text style={styles.muted}>Search for a student, then choose a match to view their record.</Text>
        ) : null}
      </ScrollView>
    </View>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#f8fafc", flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  center: { alignItems: "center", backgroundColor: "#f8fafc", flex: 1, justifyContent: "center" },
  heading: { color: "#0f172a", fontSize: 25, fontWeight: "900" },
  subtitle: { color: "#64748b", fontSize: 13, lineHeight: 19, marginTop: 6 },
  searchRow: { flexDirection: "row", gap: 7, marginTop: 14 },
  input: { backgroundColor: "#fff", borderColor: "#cbd5e1", borderRadius: 9, borderWidth: 1, color: "#0f172a", flex: 1, paddingHorizontal: 11, paddingVertical: 10 },
  searchButton: { alignItems: "center", backgroundColor: "#0f172a", borderRadius: 9, justifyContent: "center", paddingHorizontal: 14 },
  buttonText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  match: { backgroundColor: "#fff", borderColor: "#e2e8f0", borderRadius: 9, borderWidth: 1, marginTop: 7, padding: 12 },
  card: { backgroundColor: "#fff", borderColor: "#e2e8f0", borderRadius: 12, borderWidth: 1, marginTop: 11, padding: 14 },
  cardTitle: { color: "#0f172a", fontSize: 14, fontWeight: "800" },
  muted: { color: "#64748b", fontSize: 11, lineHeight: 17, marginTop: 5 },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 12 },
  metric: { backgroundColor: "#f8fafc", borderRadius: 9, flexGrow: 1, minWidth: "40%", padding: 10 },
  metricValue: { color: "#0f172a", fontSize: 15, fontWeight: "900" },
  metricLabel: { color: "#64748b", fontSize: 10, marginTop: 4 },
  sectionTitle: { color: "#0f172a", fontSize: 17, fontWeight: "800", marginTop: 20 },
  case: { color: "#78350f", fontSize: 11, fontWeight: "900" },
  loading: { marginTop: 14 },
  error: { backgroundColor: "#fef2f2", borderRadius: 9, color: "#991b1b", lineHeight: 20, marginTop: 10, overflow: "hidden", padding: 12 },
})
