import { Link, Redirect } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import PrefectNavigation from "@/components/PrefectNavigation"
import { usePrefect } from "@/contexts/PrefectContext"
import { api, type PrefectIncident } from "@/services/api"

const statuses = ["", "open", "under_review", "resolved", "dismissed"]

export default function PrefectIncidentsScreen() {
  const { user, loading: authLoading } = usePrefect()
  const [rows, setRows] = useState<PrefectIncident[]>([])
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [reload, setReload] = useState(0)

  useEffect(() => {
    if (!user) return
    let active = true
    const params: Record<string, string> = {}
    if (search.trim()) params.search = search.trim()
    if (status) params.status = status
    api.getPrefectIncidents(params)
      .then((result) => { if (active) setRows(result.incidents) })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load incidents.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user, search, status, reload])

  if (authLoading) return <View style={styles.center}><ActivityIndicator color="#92400e" /></View>
  if (!user) return <Redirect href="/prefect/login" />

  const applySearch = () => {
    setError("")
    setLoading(true)
    setReload((value) => value + 1)
  }

  return (
    <View style={styles.page}>
      <PrefectNavigation />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Incidents</Text>
        <Text style={styles.subtitle}>Search and review discipline cases.</Text>
        <Link href="/prefect/incidents/new" asChild>
          <Pressable style={styles.create}><Text style={styles.createText}>＋ File incident</Text></Pressable>
        </Link>
        <View style={styles.filters}>
          <TextInput onChangeText={setSearch} onSubmitEditing={applySearch} placeholder="Case, student ID, or name" placeholderTextColor="#94a3b8" style={styles.input} value={search} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statuses}>
            {statuses.map((item) => (
              <Pressable key={item || "all"} onPress={() => { setLoading(true); setStatus(item) }} style={[styles.statusChip, status === item && styles.selectedChip]}>
                <Text style={[styles.statusText, status === item && styles.selectedStatus]}>{item ? item.replace("_", " ") : "All"}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable onPress={applySearch} style={styles.searchButton}><Text style={styles.searchText}>Search</Text></Pressable>
        </View>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {loading ? <ActivityIndicator color="#92400e" /> : rows.length === 0 ? (
          <View style={styles.card}><Text style={styles.muted}>No incidents found.</Text></View>
        ) : rows.map((incident) => (
          <Link key={incident.id} href={{ pathname: "/prefect/incidents/[id]", params: { id: String(incident.id) } }} asChild>
            <Pressable style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.case}>{incident.case_no}</Text>
                <Text style={styles.caseStatus}>{incident.status.replaceAll("_", " ")}</Text>
              </View>
              <Text style={styles.cardTitle}>{incident.first_name} {incident.last_name}</Text>
              <Text style={styles.muted}>{incident.student_id} · {incident.violation_name || "Uncategorized"}</Text>
              <Text style={styles.muted}>Category {incident.severity.toUpperCase()} · {incident.incident_at || "Date unavailable"}</Text>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#f8fafc", flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  center: { alignItems: "center", backgroundColor: "#f8fafc", flex: 1, justifyContent: "center" },
  heading: { color: "#0f172a", fontSize: 26, fontWeight: "900" },
  subtitle: { color: "#64748b", fontSize: 14, marginTop: 6 },
  create: { alignItems: "center", backgroundColor: "#92400e", borderRadius: 10, minHeight: 43, justifyContent: "center", marginTop: 14 },
  createText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  filters: { backgroundColor: "#fff", borderColor: "#e2e8f0", borderRadius: 12, borderWidth: 1, marginTop: 12, padding: 12 },
  input: { backgroundColor: "#fff", borderColor: "#cbd5e1", borderRadius: 9, borderWidth: 1, color: "#0f172a", paddingHorizontal: 11, paddingVertical: 10 },
  statuses: { gap: 6, paddingVertical: 10 },
  statusChip: { borderColor: "#cbd5e1", borderRadius: 14, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 6 },
  selectedChip: { backgroundColor: "#0f172a", borderColor: "#0f172a" },
  statusText: { color: "#475569", fontSize: 10, textTransform: "capitalize" },
  selectedStatus: { color: "#fff", fontWeight: "800" },
  searchButton: { alignItems: "center", backgroundColor: "#0f172a", borderRadius: 9, justifyContent: "center", minHeight: 38 },
  searchText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  card: { backgroundColor: "#fff", borderColor: "#e2e8f0", borderRadius: 12, borderWidth: 1, marginTop: 10, padding: 14 },
  row: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  case: { color: "#78350f", fontSize: 12, fontWeight: "900" },
  caseStatus: { color: "#475569", fontSize: 10, fontWeight: "800", textTransform: "capitalize" },
  cardTitle: { color: "#0f172a", fontSize: 14, fontWeight: "800", marginTop: 7 },
  muted: { color: "#64748b", fontSize: 12, lineHeight: 18, marginTop: 5 },
  error: { backgroundColor: "#fef2f2", borderRadius: 9, color: "#991b1b", lineHeight: 20, marginTop: 10, overflow: "hidden", padding: 12 },
})
