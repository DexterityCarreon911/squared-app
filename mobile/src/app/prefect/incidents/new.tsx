import { Redirect, router } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import PrefectNavigation from "@/components/PrefectNavigation"
import { usePrefect } from "@/contexts/PrefectContext"
import { api, type PrefectStudentMatch, type PrefectViolation } from "@/services/api"

const severities = ["a", "b", "c"]
const incidentStatuses = ["open", "under_review", "resolved", "dismissed"]

export default function PrefectIncidentFormScreen() {
  const { user, csrfToken, loading: authLoading } = usePrefect()
  const [violations, setViolations] = useState<PrefectViolation[]>([])
  const [query, setQuery] = useState("")
  const [matches, setMatches] = useState<PrefectStudentMatch[]>([])
  const [student, setStudent] = useState<PrefectStudentMatch | null>(null)
  const [form, setForm] = useState({
    student_id: "",
    violation_id: "",
    severity: "a",
    description: "",
    incident_at: "",
    reported_by: "",
    status: "open",
    sanction_applied: "",
  })
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user) return
    let active = true
    api.getPrefectViolations()
      .then((result) => { if (active) setViolations(result.violations.filter((violation) => Number(violation.is_active))) })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load violation catalog.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user])

  if (authLoading) return <View style={styles.center}><ActivityIndicator color="#92400e" /></View>
  if (!user) return <Redirect href="/prefect/login" />

  const searchStudents = async () => {
    if (!query.trim()) {
      setError("Enter a student name or ID to search.")
      return
    }
    setSearching(true)
    setError("")
    try {
      setMatches((await api.searchPrefectStudents(query.trim())).matches)
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "Student search failed.")
    } finally {
      setSearching(false)
    }
  }

  const selectViolation = (id: string) => {
    const violation = violations.find((item) => String(item.id) === id)
    setForm((current) => ({
      ...current,
      violation_id: id,
      severity: violation?.severity || current.severity,
      sanction_applied: violation?.default_sanction || "",
    }))
  }

  const submit = async () => {
    if (!student || !form.violation_id || submitting) {
      setError("Select a student and violation before filing the incident.")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      const result = await api.createPrefectIncident({
        ...form,
        violation_id: Number(form.violation_id),
      }, csrfToken)
      router.replace({ pathname: "/prefect/incidents/[id]", params: { id: String(result.incident_id) } })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to file incident.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={styles.page}>
      <PrefectNavigation />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>File incident</Text>
        <Text style={styles.subtitle}>Select a student, record the violation, then save the case.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Student</Text>
          <View style={styles.searchRow}>
            <TextInput onChangeText={setQuery} onSubmitEditing={() => void searchStudents()} placeholder="Student ID or name" placeholderTextColor="#94a3b8" style={styles.flexInput} value={query} />
            <Pressable disabled={searching} onPress={() => void searchStudents()} style={styles.searchButton}><Text style={styles.buttonText}>{searching ? "..." : "Find"}</Text></Pressable>
          </View>
          {matches.map((match) => (
            <Pressable key={match.student_id} onPress={() => { setStudent(match); setForm((current) => ({ ...current, student_id: match.student_id })); setMatches([]) }} style={styles.match}>
              <Text style={styles.matchText}>{match.first_name} {match.last_name} · {match.student_id}</Text>
              <Text style={styles.muted}>{match.program}</Text>
            </Pressable>
          ))}
          {student ? <Text style={styles.selectedStudent}>Selected: {student.first_name} {student.last_name} ({student.student_id})</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Case details</Text>
          <Text style={styles.label}>VIOLATION</Text>
          {loading ? <ActivityIndicator color="#92400e" /> : violations.length === 0 ? (
            <Text style={styles.muted}>No active violations are configured.</Text>
          ) : violations.map((violation) => (
            <Pressable key={violation.id} onPress={() => selectViolation(String(violation.id))} style={[styles.choice, form.violation_id === String(violation.id) && styles.selectedChoice]}>
              <Text style={styles.choiceTitle}>{violation.name}</Text>
              <Text style={styles.muted}>Category {violation.severity.toUpperCase()} · {violation.occurrences} occurrence(s)</Text>
            </Pressable>
          ))}

          <Text style={styles.label}>CATEGORY</Text>
          <View style={styles.options}>
            {severities.map((item) => <Pressable key={item} onPress={() => setForm({ ...form, severity: item })} style={[styles.chip, form.severity === item && styles.selectedChip]}><Text style={[styles.chipText, form.severity === item && styles.selectedChipText]}>Category {item.toUpperCase()}</Text></Pressable>)}
          </View>
          <Field label="Incident date/time (YYYY-MM-DD HH:MM)" value={form.incident_at} onChangeText={(value) => setForm({ ...form, incident_at: value })} placeholder="2026-10-23 14:00" />
          <Field label="Reported by" value={form.reported_by} onChangeText={(value) => setForm({ ...form, reported_by: value })} />
          <Text style={styles.label}>STATUS</Text>
          <View style={styles.options}>
            {incidentStatuses.map((item) => <Pressable key={item} onPress={() => setForm({ ...form, status: item })} style={[styles.chip, form.status === item && styles.selectedChip]}><Text style={[styles.chipText, form.status === item && styles.selectedChipText]}>{item.replace("_", " ")}</Text></Pressable>)}
          </View>
          <Field label="Sanction applied" value={form.sanction_applied} onChangeText={(value) => setForm({ ...form, sanction_applied: value })} />
          <Text style={styles.label}>DESCRIPTION</Text>
          <TextInput multiline onChangeText={(value) => setForm({ ...form, description: value })} placeholder="Describe the incident" placeholderTextColor="#94a3b8" style={[styles.input, styles.textArea]} textAlignVertical="top" value={form.description} />
        </View>
        <Pressable accessibilityRole="button" disabled={submitting || !csrfToken} onPress={() => void submit()} style={[styles.submit, (submitting || !csrfToken) && styles.disabled]}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Record incident</Text>}
        </Pressable>
      </ScrollView>
    </View>
  )
}

function Field({ label, value, onChangeText, placeholder }: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string }) {
  return (
    <>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <TextInput onChangeText={onChangeText} placeholder={placeholder || label} placeholderTextColor="#94a3b8" style={styles.input} value={value} />
    </>
  )
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#f8fafc", flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  center: { alignItems: "center", backgroundColor: "#f8fafc", flex: 1, justifyContent: "center" },
  heading: { color: "#0f172a", fontSize: 25, fontWeight: "900" },
  subtitle: { color: "#64748b", fontSize: 13, lineHeight: 19, marginBottom: 12, marginTop: 6 },
  card: { backgroundColor: "#fff", borderColor: "#e2e8f0", borderRadius: 12, borderWidth: 1, marginTop: 10, padding: 14 },
  sectionTitle: { color: "#0f172a", fontSize: 16, fontWeight: "800" },
  searchRow: { flexDirection: "row", gap: 7, marginTop: 10 },
  flexInput: { backgroundColor: "#fff", borderColor: "#cbd5e1", borderRadius: 9, borderWidth: 1, color: "#0f172a", flex: 1, paddingHorizontal: 10, paddingVertical: 10 },
  searchButton: { alignItems: "center", backgroundColor: "#0f172a", borderRadius: 9, justifyContent: "center", paddingHorizontal: 16 },
  buttonText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  match: { borderBottomColor: "#e2e8f0", borderBottomWidth: 1, paddingVertical: 10 },
  matchText: { color: "#0f172a", fontSize: 13, fontWeight: "700" },
  selectedStudent: { backgroundColor: "#f0fdf4", borderRadius: 8, color: "#166534", fontSize: 12, marginTop: 10, overflow: "hidden", padding: 10 },
  label: { color: "#475569", fontSize: 10, fontWeight: "900", letterSpacing: 0.6, marginTop: 14 },
  choice: { borderColor: "#e2e8f0", borderRadius: 9, borderWidth: 1, marginTop: 8, padding: 10 },
  selectedChoice: { backgroundColor: "#fffbeb", borderColor: "#92400e" },
  choiceTitle: { color: "#0f172a", fontSize: 13, fontWeight: "800" },
  muted: { color: "#64748b", fontSize: 11, lineHeight: 17, marginTop: 4 },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  chip: { borderColor: "#cbd5e1", borderRadius: 14, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 7 },
  selectedChip: { backgroundColor: "#92400e", borderColor: "#92400e" },
  chipText: { color: "#475569", fontSize: 10, textTransform: "capitalize" },
  selectedChipText: { color: "#fff", fontWeight: "800" },
  input: { backgroundColor: "#fff", borderColor: "#cbd5e1", borderRadius: 9, borderWidth: 1, color: "#0f172a", marginTop: 7, paddingHorizontal: 10, paddingVertical: 10 },
  textArea: { height: 90 },
  submit: { alignItems: "center", backgroundColor: "#92400e", borderRadius: 10, justifyContent: "center", minHeight: 46, marginTop: 12 },
  disabled: { opacity: 0.55 },
  error: { backgroundColor: "#fef2f2", borderRadius: 9, color: "#991b1b", lineHeight: 20, marginTop: 10, overflow: "hidden", padding: 12 },
})
