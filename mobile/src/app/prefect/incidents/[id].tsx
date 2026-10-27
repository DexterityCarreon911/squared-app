import { Redirect, useLocalSearchParams } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import PrefectNavigation from "@/components/PrefectNavigation"
import { usePrefect } from "@/contexts/PrefectContext"
import { api, type PrefectIncident, type PrefectIncidentAction, type PrefectViolation } from "@/services/api"

const statuses = ["open", "under_review", "resolved", "dismissed"]

export default function PrefectIncidentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user, csrfToken, loading: authLoading } = usePrefect()
  const [incident, setIncident] = useState<PrefectIncident | null>(null)
  const [timeline, setTimeline] = useState<PrefectIncidentAction[]>([])
  const [violations, setViolations] = useState<PrefectViolation[]>([])
  const [studentId, setStudentId] = useState("")
  const [violationId, setViolationId] = useState("")
  const [severity, setSeverity] = useState("a")
  const [description, setDescription] = useState("")
  const [incidentAt, setIncidentAt] = useState("")
  const [reportedBy, setReportedBy] = useState("")
  const [status, setStatus] = useState("")
  const [sanction, setSanction] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  useEffect(() => {
    if (!user || !id) return
    let active = true
    Promise.all([api.getPrefectIncident(id), api.getPrefectViolations()])
      .then(([result, catalog]) => {
        if (!active) return
        setIncident(result.incident)
        setTimeline(result.timeline)
        setStudentId(result.incident.student_id)
        setViolationId(String(result.incident.violation_id || ""))
        setSeverity(result.incident.severity)
        setDescription(result.incident.description || "")
        setIncidentAt(result.incident.incident_at || "")
        setReportedBy(result.incident.reported_by || "")
        setStatus(result.incident.status)
        setSanction(result.incident.sanction_applied || "")
        setViolations(catalog.violations)
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load incident.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user, id])

  if (authLoading) return <View style={styles.center}><ActivityIndicator color="#92400e" /></View>
  if (!user) return <Redirect href="/prefect/login" />

  const reload = async () => {
    if (!id) return
    const result = await api.getPrefectIncident(id)
    setIncident(result.incident)
    setTimeline(result.timeline)
    setStudentId(result.incident.student_id)
    setViolationId(String(result.incident.violation_id || ""))
    setSeverity(result.incident.severity)
    setDescription(result.incident.description || "")
    setIncidentAt(result.incident.incident_at || "")
    setReportedBy(result.incident.reported_by || "")
    setStatus(result.incident.status)
    setSanction(result.incident.sanction_applied || "")
  }

  const perform = async (body: Record<string, string | number | null>) => {
    if (!incident || saving) return
    setSaving(true)
    setError("")
    setNotice("")
    try {
      const result = await api.updatePrefectIncident({ incident_id: incident.id, ...body }, csrfToken)
      setNotice(result.message || "Case updated.")
      await reload()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save case changes.")
    } finally {
      setSaving(false)
    }
  }

  const saveCase = () => {
    if (!incident) return
    void perform({
      action: "update",
      student_id: studentId,
      violation_id: Number(violationId),
      severity,
      description,
      incident_at: incidentAt,
      reported_by: reportedBy,
      status,
      sanction_applied: sanction,
    })
  }

  if (loading) return <View style={styles.center}><ActivityIndicator color="#92400e" /></View>
  if (!incident) return (
    <View style={styles.page}>
      <PrefectNavigation />
      <Text accessibilityRole="alert" style={styles.error}>{error || "Incident could not be found."}</Text>
    </View>
  )

  return (
    <View style={styles.page}>
      <PrefectNavigation />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>{incident.case_no}</Text>
        <Text style={styles.subtitle}>{incident.first_name} {incident.last_name} · {incident.student_id}</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {notice ? <Text accessibilityRole="status" style={styles.success}>{notice}</Text> : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Case details</Text>
          <Text style={styles.detail}>{incident.occurrences_applied} occurrence(s)</Text>
          <Text style={styles.label}>STUDENT ID</Text>
          <TextInput autoCapitalize="characters" maxLength={40} onChangeText={setStudentId} style={styles.input} value={studentId} />
          <Text style={styles.label}>VIOLATION</Text>
          <View style={styles.options}>
            {violations.map((item) => (
              <Pressable key={item.id} onPress={() => setViolationId(String(item.id))} style={[styles.chip, violationId === String(item.id) && styles.selectedChip]}>
                <Text style={[styles.chipText, violationId === String(item.id) && styles.selectedChipText]}>{item.name}{Number(item.is_active) ? "" : " (inactive)"}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>CATEGORY</Text>
          <View style={styles.options}>
            {["a", "b", "c"].map((item) => <Pressable key={item} onPress={() => setSeverity(item)} style={[styles.chip, severity === item && styles.selectedChip]}><Text style={[styles.chipText, severity === item && styles.selectedChipText]}>Category {item.toUpperCase()}</Text></Pressable>)}
          </View>
          <Text style={styles.label}>INCIDENT DATE AND TIME</Text>
          <TextInput autoCapitalize="none" onChangeText={setIncidentAt} placeholder="YYYY-MM-DD HH:MM:SS" placeholderTextColor="#94a3b8" style={styles.input} value={incidentAt} />
          <Text style={styles.label}>REPORTED BY</Text>
          <TextInput maxLength={150} onChangeText={setReportedBy} style={styles.input} value={reportedBy} />
          <Text style={styles.label}>DESCRIPTION</Text>
          <TextInput multiline maxLength={5000} onChangeText={setDescription} style={[styles.input, styles.textArea]} textAlignVertical="top" value={description} />
          <Text style={styles.label}>STATUS</Text>
          <View style={styles.options}>
            {statuses.map((item) => <Pressable key={item} onPress={() => setStatus(item)} style={[styles.chip, status === item && styles.selectedChip]}><Text style={[styles.chipText, status === item && styles.selectedChipText]}>{item.replace("_", " ")}</Text></Pressable>)}
          </View>
          <Text style={styles.label}>SANCTION APPLIED</Text>
          <TextInput maxLength={255} onChangeText={setSanction} placeholder="Sanction" placeholderTextColor="#94a3b8" style={styles.input} value={sanction} />
          <Pressable disabled={saving || !csrfToken || !studentId.trim() || !violationId} onPress={saveCase} style={[styles.button, (saving || !csrfToken || !studentId.trim() || !violationId) && styles.disabled]}><Text style={styles.buttonText}>{saving ? "Saving..." : "Save case details"}</Text></Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Case actions</Text>
          <Text style={styles.label}>ADD AUDIT NOTE</Text>
          <TextInput multiline onChangeText={setNote} placeholder="Add a note to the case timeline" placeholderTextColor="#94a3b8" style={[styles.input, styles.textArea]} textAlignVertical="top" value={note} />
          <Pressable disabled={saving || !note.trim()} onPress={() => {
            const current = note.trim()
            void perform({ action: "note", note: current }).then(() => setNote(""))
          }} style={[styles.secondaryButton, (saving || !note.trim()) && styles.disabled]}><Text style={styles.secondaryText}>Add note</Text></Pressable>
          <Text style={styles.label}>CHANGE STATUS</Text>
          <Pressable disabled={saving} onPress={() => void perform({ action: "status", status })} style={styles.secondaryButton}><Text style={styles.secondaryText}>Update status</Text></Pressable>
          <Text style={styles.label}>SAVE SANCTION</Text>
          <Pressable disabled={saving} onPress={() => void perform({ action: "sanction", sanction_applied: sanction })} style={styles.secondaryButton}><Text style={styles.secondaryText}>Save sanction</Text></Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          {timeline.length === 0 ? <Text style={styles.muted}>No case actions recorded yet.</Text> : timeline.map((item) => (
            <View key={item.id} style={styles.timelineItem}>
              <Text style={styles.detail}>{item.note}</Text>
              <Text style={styles.muted}>{item.display_name || "System"} · {item.created_at} · {item.action_type.replaceAll("_", " ")}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#f8fafc", flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  center: { alignItems: "center", backgroundColor: "#f8fafc", flex: 1, justifyContent: "center" },
  heading: { color: "#0f172a", fontSize: 25, fontWeight: "900" },
  subtitle: { color: "#64748b", fontSize: 13, marginTop: 6 },
  card: { backgroundColor: "#fff", borderColor: "#e2e8f0", borderRadius: 12, borderWidth: 1, marginTop: 12, padding: 14 },
  sectionTitle: { color: "#0f172a", fontSize: 16, fontWeight: "800" },
  detail: { color: "#334155", fontSize: 13, lineHeight: 20, marginTop: 8 },
  label: { color: "#475569", fontSize: 10, fontWeight: "900", letterSpacing: 0.6, marginTop: 14 },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  chip: { borderColor: "#cbd5e1", borderRadius: 14, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 7 },
  selectedChip: { backgroundColor: "#92400e", borderColor: "#92400e" },
  chipText: { color: "#475569", fontSize: 10, textTransform: "capitalize" },
  selectedChipText: { color: "#fff", fontWeight: "800" },
  input: { backgroundColor: "#fff", borderColor: "#cbd5e1", borderRadius: 9, borderWidth: 1, color: "#0f172a", marginTop: 7, paddingHorizontal: 10, paddingVertical: 10 },
  textArea: { height: 84 },
  button: { alignItems: "center", backgroundColor: "#92400e", borderRadius: 9, justifyContent: "center", minHeight: 43, marginTop: 12 },
  buttonText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  secondaryButton: { alignItems: "center", backgroundColor: "#0f172a", borderRadius: 9, justifyContent: "center", minHeight: 39, marginTop: 8 },
  secondaryText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  disabled: { opacity: 0.55 },
  timelineItem: { borderLeftColor: "#fbbf24", borderLeftWidth: 2, marginTop: 12, paddingLeft: 10 },
  muted: { color: "#64748b", fontSize: 11, lineHeight: 17, marginTop: 5 },
  error: { backgroundColor: "#fef2f2", borderRadius: 9, color: "#991b1b", lineHeight: 20, margin: 14, overflow: "hidden", padding: 12 },
  success: { backgroundColor: "#f0fdf4", borderRadius: 9, color: "#166534", lineHeight: 20, marginTop: 10, overflow: "hidden", padding: 12 },
})
