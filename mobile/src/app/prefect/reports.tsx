import { Redirect } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import PrefectNavigation from "@/components/PrefectNavigation"
import { usePrefect } from "@/contexts/PrefectContext"
import { api, type PrefectDisciplineReport } from "@/services/api"

const statuses = [
  { value: "", label: "All statuses" },
  { value: "open", label: "Open" },
  { value: "under_review", label: "Under review" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
]
const severities = [
  { value: "", label: "All categories" },
  { value: "a", label: "Category A" },
  { value: "b", label: "Category B" },
  { value: "c", label: "Category C" },
]

export default function PrefectReportsScreen() {
  const { user, loading: authLoading } = usePrefect()
  const [status, setStatus] = useState("")
  const [severity, setSeverity] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [report, setReport] = useState<PrefectDisciplineReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = async () => {
    setLoading(true)
    setError("")
    try {
      const filters: Record<string, string> = {}
      if (status) filters.status = status
      if (severity) filters.severity = severity
      if (from) filters.from = from
      if (to) filters.to = to
      setReport(await api.getPrefectReport(filters))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load report.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    let active = true
    const filters: Record<string, string> = {}
    api.getPrefectReport(filters)
      .then((result) => { if (active) setReport(result) })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load report.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user])

  if (authLoading) return <View style={styles.center}><ActivityIndicator color="#92400e" /></View>
  if (!user) return <Redirect href="/prefect/login" />

  const exportCsv = async () => {
    const params = new URLSearchParams()
    if (status) params.set("status", status)
    if (severity) params.set("severity", severity)
    if (from) params.set("from", from)
    if (to) params.set("to", to)
    try {
      await Linking.openURL(`${api.baseUrl}/prefect_admin/php/api/catalog.php?resource=export&${params.toString()}`)
    } catch (openError) {
      setError(openError instanceof Error ? openError.message : "Could not open the CSV export.")
    }
  }

  return (
    <View style={styles.page}>
      <PrefectNavigation />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Discipline reports</Text>
        <Text style={styles.subtitle}>Review filtered case totals and export the matching CSV report.</Text>
        <View style={styles.card}>
          <Text style={styles.label}>STATUS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.options}>
            {statuses.map((item) => <Pressable key={item.value || "all"} onPress={() => setStatus(item.value)} style={[styles.chip, status === item.value && styles.selectedChip]}><Text style={[styles.chipText, status === item.value && styles.selectedChipText]}>{item.label}</Text></Pressable>)}
          </ScrollView>
          <Text style={styles.label}>CATEGORY</Text>
          <View style={styles.options}>
            {severities.map((item) => <Pressable key={item.value || "all"} onPress={() => setSeverity(item.value)} style={[styles.chip, severity === item.value && styles.selectedChip]}><Text style={[styles.chipText, severity === item.value && styles.selectedChipText]}>{item.label}</Text></Pressable>)}
          </View>
          <Text style={styles.label}>DATE RANGE</Text>
          <TextInput autoCapitalize="none" onChangeText={setFrom} placeholder="From YYYY-MM-DD" placeholderTextColor="#94a3b8" style={styles.input} value={from} />
          <TextInput autoCapitalize="none" onChangeText={setTo} placeholder="To YYYY-MM-DD" placeholderTextColor="#94a3b8" style={styles.input} value={to} />
          <View style={styles.buttons}>
            <Pressable disabled={loading} onPress={() => void load()} style={styles.apply}><Text style={styles.buttonText}>{loading ? "Loading..." : "Apply filters"}</Text></Pressable>
            <Pressable onPress={() => void exportCsv()} style={styles.export}><Text style={styles.buttonText}>Export CSV</Text></Pressable>
          </View>
        </View>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {loading && !report ? <ActivityIndicator color="#92400e" /> : report ? (
          <>
            <View style={styles.stats}>
              <Metric label="Cases" value={report.summary.total} />
              <Metric label="Open" value={report.summary.open_cases} />
              <Metric label="Resolved" value={report.summary.resolved} />
              <Metric label="Dismissed" value={report.summary.dismissed} />
              <Metric label="Occurrences" value={report.summary.occurrences} />
            </View>
            <Text style={styles.sectionTitle}>By violation</Text>
            {report.by_violation.length === 0 ? <View style={styles.card}><Text style={styles.muted}>No report rows match these filters.</Text></View> : report.by_violation.map((row) => (
              <View key={row.violation} style={styles.card}>
                <Text style={styles.cardTitle}>{row.violation}</Text>
                <Text style={styles.muted}>{row.cases} case(s) · {row.occurrences} occurrence(s)</Text>
              </View>
            ))}
          </>
        ) : null}
      </ScrollView>
    </View>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value || 0}</Text><Text style={styles.metricLabel}>{label}</Text></View>
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#f8fafc", flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  center: { alignItems: "center", backgroundColor: "#f8fafc", flex: 1, justifyContent: "center" },
  heading: { color: "#0f172a", fontSize: 25, fontWeight: "900" },
  subtitle: { color: "#64748b", fontSize: 13, lineHeight: 19, marginTop: 6 },
  card: { backgroundColor: "#fff", borderColor: "#e2e8f0", borderRadius: 12, borderWidth: 1, marginTop: 11, padding: 14 },
  label: { color: "#475569", fontSize: 10, fontWeight: "900", marginTop: 10 },
  options: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 6, paddingTop: 7 },
  chip: { borderColor: "#cbd5e1", borderRadius: 14, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 6 },
  selectedChip: { backgroundColor: "#0f172a", borderColor: "#0f172a" },
  chipText: { color: "#475569", fontSize: 10 },
  selectedChipText: { color: "#fff", fontWeight: "800" },
  input: { backgroundColor: "#fff", borderColor: "#cbd5e1", borderRadius: 9, borderWidth: 1, color: "#0f172a", marginTop: 8, paddingHorizontal: 10, paddingVertical: 10 },
  buttons: { flexDirection: "row", gap: 8, marginTop: 12 },
  apply: { alignItems: "center", backgroundColor: "#0f172a", borderRadius: 9, flex: 1, justifyContent: "center", minHeight: 41 },
  export: { alignItems: "center", backgroundColor: "#92400e", borderRadius: 9, flex: 1, justifyContent: "center", minHeight: 41 },
  buttonText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 12 },
  metric: { backgroundColor: "#fff", borderColor: "#e2e8f0", borderRadius: 10, borderWidth: 1, flexGrow: 1, minWidth: "30%", padding: 10 },
  metricValue: { color: "#0f172a", fontSize: 18, fontWeight: "900" },
  metricLabel: { color: "#64748b", fontSize: 10, marginTop: 4 },
  sectionTitle: { color: "#0f172a", fontSize: 17, fontWeight: "800", marginTop: 18 },
  cardTitle: { color: "#0f172a", fontSize: 13, fontWeight: "800" },
  muted: { color: "#64748b", fontSize: 11, lineHeight: 17, marginTop: 5 },
  error: { backgroundColor: "#fef2f2", borderRadius: 9, color: "#991b1b", lineHeight: 20, marginTop: 10, overflow: "hidden", padding: 12 },
})
