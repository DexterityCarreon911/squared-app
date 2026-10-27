import { Redirect } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native"
import PrefectNavigation from "@/components/PrefectNavigation"
import { usePrefect } from "@/contexts/PrefectContext"
import { api, type PrefectViolation } from "@/services/api"

const blank = { id: 0, name: "", severity: "a", occurrences: 1, default_sanction: "", is_active: 1, sort_order: 0 }

export default function PrefectViolationsScreen() {
  const { user, csrfToken, loading: authLoading } = usePrefect()
  const [rows, setRows] = useState<PrefectViolation[]>([])
  const [form, setForm] = useState(blank)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const load = async () => {
    setError("")
    try {
      setRows((await api.getPrefectViolations()).violations)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load violations.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    let active = true
    api.getPrefectViolations()
      .then((result) => { if (active) setRows(result.violations) })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load violations.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user])

  if (authLoading) return <View style={styles.center}><ActivityIndicator color="#92400e" /></View>
  if (!user) return <Redirect href="/prefect/login" />

  const save = async () => {
    if (!form.name.trim() || saving) return
    setSaving(true)
    setError("")
    setNotice("")
    try {
      const result = await api.savePrefectViolation({
        ...form,
        name: form.name.trim(),
        action: form.id ? "update" : "add",
      }, csrfToken)
      setNotice(result.message || "Violation saved.")
      setForm(blank)
      await load()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save violation.")
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (violation: PrefectViolation) => {
    setError("")
    setNotice("")
    try {
      const result = await api.savePrefectViolation({
        action: "toggle",
        id: violation.id,
        is_active: Number(violation.is_active) ? 0 : 1,
      }, csrfToken)
      setNotice(result.message || "Violation status updated.")
      await load()
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Could not update violation.")
    }
  }

  return (
    <View style={styles.page}>
      <PrefectNavigation />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Violation catalog</Text>
        <Text style={styles.subtitle}>Manage active violations, categories, occurrence counts, and default sanctions.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {notice ? <Text accessibilityRole="status" style={styles.success}>{notice}</Text> : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{form.id ? "Edit violation" : "Add violation"}</Text>
          <TextInput maxLength={150} onChangeText={(name) => setForm({ ...form, name })} placeholder="Violation name" placeholderTextColor="#94a3b8" style={styles.input} value={form.name} />
          <Text style={styles.label}>CATEGORY</Text>
          <View style={styles.row}>
            {["a", "b", "c"].map((severity) => (
              <Pressable key={severity} onPress={() => setForm({ ...form, severity })} style={[styles.chip, form.severity === severity && styles.selectedChip]}>
                <Text style={[styles.chipText, form.severity === severity && styles.selectedChipText]}>Category {severity.toUpperCase()}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput keyboardType="number-pad" onChangeText={(value) => setForm({ ...form, occurrences: Number(value) || 0 })} placeholder="Occurrences" placeholderTextColor="#94a3b8" style={styles.input} value={String(form.occurrences)} />
          <TextInput maxLength={255} onChangeText={(default_sanction) => setForm({ ...form, default_sanction })} placeholder="Default sanction" placeholderTextColor="#94a3b8" style={styles.input} value={form.default_sanction} />
          <TextInput keyboardType="number-pad" onChangeText={(value) => setForm({ ...form, sort_order: Number(value) || 0 })} placeholder="Sort order" placeholderTextColor="#94a3b8" style={styles.input} value={String(form.sort_order)} />
          <View style={styles.switchRow}><Text style={styles.text}>Active</Text><Switch onValueChange={(value) => setForm({ ...form, is_active: value ? 1 : 0 })} trackColor={{ true: "#92400e" }} value={Boolean(form.is_active)} /></View>
          <View style={styles.row}>
            <Pressable disabled={saving || !csrfToken} onPress={() => void save()} style={[styles.button, (saving || !csrfToken) && styles.disabled]}><Text style={styles.buttonText}>{saving ? "Saving..." : "Save violation"}</Text></Pressable>
            {form.id ? <Pressable onPress={() => setForm(blank)} style={styles.cancel}><Text style={styles.cancelText}>Cancel</Text></Pressable> : null}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Configured violations</Text>
        {loading ? <ActivityIndicator color="#92400e" /> : rows.length === 0 ? <View style={styles.card}><Text style={styles.muted}>No violations configured.</Text></View> : rows.map((violation) => (
          <View key={violation.id} style={styles.card}>
            <Text style={styles.cardTitle}>{violation.name}</Text>
            <Text style={styles.muted}>Category {violation.severity.toUpperCase()} · {violation.occurrences} occurrence(s) · {violation.case_count || 0} cases</Text>
            <Text style={styles.muted}>{violation.default_sanction || "No default sanction"}</Text>
            <View style={styles.row}>
              <Pressable onPress={() => setForm({ ...blank, ...violation, is_active: Number(violation.is_active), sort_order: violation.sort_order || 0 })} style={styles.action}><Text style={styles.actionText}>Edit</Text></Pressable>
              <Pressable onPress={() => void toggleActive(violation)} style={styles.action}><Text style={styles.actionText}>{Number(violation.is_active) ? "Deactivate" : "Activate"}</Text></Pressable>
              <Text style={styles.muted}>{Number(violation.is_active) ? "Active" : "Inactive"}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#f8fafc", flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  center: { alignItems: "center", backgroundColor: "#f8fafc", flex: 1, justifyContent: "center" },
  heading: { color: "#0f172a", fontSize: 25, fontWeight: "900" },
  subtitle: { color: "#64748b", fontSize: 13, lineHeight: 19, marginTop: 6 },
  card: { backgroundColor: "#fff", borderColor: "#e2e8f0", borderRadius: 12, borderWidth: 1, marginTop: 11, padding: 14 },
  sectionTitle: { color: "#0f172a", fontSize: 16, fontWeight: "800" },
  cardTitle: { color: "#0f172a", fontSize: 14, fontWeight: "800" },
  input: { backgroundColor: "#fff", borderColor: "#cbd5e1", borderRadius: 9, borderWidth: 1, color: "#0f172a", marginTop: 9, paddingHorizontal: 11, paddingVertical: 10 },
  label: { color: "#475569", fontSize: 10, fontWeight: "900", marginTop: 14 },
  row: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 8 },
  chip: { borderColor: "#cbd5e1", borderRadius: 14, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 7 },
  selectedChip: { backgroundColor: "#92400e", borderColor: "#92400e" },
  chipText: { color: "#475569", fontSize: 10 },
  selectedChipText: { color: "#fff", fontWeight: "800" },
  switchRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  text: { color: "#334155", fontSize: 13, fontWeight: "700" },
  button: { alignItems: "center", backgroundColor: "#92400e", borderRadius: 9, justifyContent: "center", minHeight: 41, paddingHorizontal: 14 },
  buttonText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  cancel: { borderColor: "#cbd5e1", borderRadius: 9, borderWidth: 1, justifyContent: "center", minHeight: 41, paddingHorizontal: 14 },
  cancelText: { color: "#334155", fontSize: 11, fontWeight: "700" },
  action: { borderColor: "#cbd5e1", borderRadius: 8, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 7 },
  actionText: { color: "#78350f", fontSize: 10, fontWeight: "800" },
  muted: { color: "#64748b", fontSize: 11, lineHeight: 17, marginTop: 5 },
  disabled: { opacity: 0.55 },
  error: { backgroundColor: "#fef2f2", borderRadius: 9, color: "#991b1b", lineHeight: 20, marginTop: 10, overflow: "hidden", padding: 12 },
  success: { backgroundColor: "#f0fdf4", borderRadius: 9, color: "#166534", lineHeight: 20, marginTop: 10, overflow: "hidden", padding: 12 },
})
