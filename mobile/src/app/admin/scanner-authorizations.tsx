import { Redirect } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native"
import AdminNavigation from "@/components/AdminNavigation"
import { useAdmin } from "@/contexts/AdminContext"
import { api, type AdminEventScanner } from "@/services/api"
import { colors } from "@/theme"

const permissionFields = [
  ["can_scan_events", "Event attendance"],
  ["can_process_payments", "Squared Pay"],
  ["can_scan_qr_quest", "QR Quest"],
  ["can_scan_nstp", "NSTP attendance"],
  ["can_process_aurora", "Aurora Night"],
] as const
type PermissionKey = typeof permissionFields[number][0]
type ScannerForm = Record<PermissionKey, boolean> & { student_id: string; status: "Allow" | "Deny" }

const emptyForm: ScannerForm = {
  student_id: "",
  status: "Allow",
  can_scan_events: false,
  can_process_payments: false,
  can_scan_qr_quest: false,
  can_scan_nstp: false,
  can_process_aurora: false,
}

function formFrom(scanner: AdminEventScanner): ScannerForm {
  return {
    student_id: scanner.student_id,
    status: scanner.status,
    can_scan_events: scanner.can_scan_events === 1,
    can_process_payments: scanner.can_process_payments === 1,
    can_scan_qr_quest: scanner.can_scan_qr_quest === 1,
    can_scan_nstp: scanner.can_scan_nstp === 1,
    can_process_aurora: scanner.can_process_aurora === 1,
  }
}

export default function AdminScannerAuthorizationsScreen() {
  const { admin, csrfToken, loading: authLoading } = useAdmin()
  const [scanners, setScanners] = useState<AdminEventScanner[]>([])
  const [form, setForm] = useState<ScannerForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const load = useCallback(async () => {
    setError("")
    try { setScanners(await api.getAdminEventScanners()) }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Could not load scanner authorizations.") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (!admin) return
    let active = true
    api.getAdminEventScanners()
      .then((result) => { if (active) setScanners(result) })
      .catch((loadError: unknown) => { if (active) setError(loadError instanceof Error ? loadError.message : "Could not load scanner authorizations.") })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [admin])

  if (authLoading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
  if (!admin) return <Redirect href="/admin/login" />

  const save = async () => {
    if (saving || !form.student_id.trim()) return
    setSaving(true)
    setError("")
    setNotice("")
    const fields: Record<string, string | number> = {
      student_id: form.student_id.trim(),
      status: form.status,
      ...Object.fromEntries(permissionFields.map(([key]) => [key, form[key] ? 1 : 0])),
    }
    try {
      const result = await api.saveAdminEventScanner(editingId ? "update" : "add", editingId ? { ...fields, scanner_id: editingId } : fields, csrfToken)
      setNotice(result.message || "Scanner authorization saved.")
      setForm(emptyForm)
      setEditingId(null)
      await load()
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Could not save scanner authorization.") }
    finally { setSaving(false) }
  }

  const remove = (scanner: AdminEventScanner) => Alert.alert("Remove scanner access?", `Remove all scanner permissions for ${scanner.first_name} ${scanner.last_name}?`, [
    { text: "Keep", style: "cancel" },
    { text: "Remove", style: "destructive", onPress: () => {
      setSaving(true)
      void api.saveAdminEventScanner("delete", { scanner_id: scanner.id }, csrfToken)
        .then(async (result) => { setNotice(result.message || "Scanner removed."); await load() })
        .catch((removeError: unknown) => setError(removeError instanceof Error ? removeError.message : "Could not remove scanner."))
        .finally(() => setSaving(false))
    } },
  ])

  return (
    <View style={styles.page}>
      <AdminNavigation />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Event scanner authorizations</Text>
        <Text style={styles.subtitle}>Grant student scanners specific permissions across event attendance, payments, QR Quest, NSTP, and Aurora.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {notice ? <Text accessibilityRole="status" style={styles.success}>{notice}</Text> : null}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{editingId ? "Edit authorization" : "Authorize a student"}</Text>
          <TextInput autoCapitalize="characters" editable={!editingId} onChangeText={(student_id) => setForm((current) => ({ ...current, student_id }))} placeholder="Student ID" placeholderTextColor={colors.placeholder} style={styles.input} value={form.student_id} />
          <View style={styles.switchRow}><Text style={styles.label}>Access status</Text><Pressable onPress={() => setForm((current) => ({ ...current, status: current.status === "Allow" ? "Deny" : "Allow" }))}><Text style={styles.permissionValue}>{form.status}</Text></Pressable></View>
          {permissionFields.map(([key, label]) => (
            <View key={key} style={styles.switchRow}><Text style={styles.label}>{label}</Text><Switch value={form[key]} onValueChange={(value) => setForm((current) => ({ ...current, [key]: value }))} trackColor={{ true: colors.primary }} /></View>
          ))}
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" disabled={saving || !form.student_id.trim()} onPress={() => void save()} style={[styles.button, (saving || !form.student_id.trim()) && styles.disabled]}><Text style={styles.buttonText}>{saving ? "Saving…" : editingId ? "Save permissions" : "Authorize student"}</Text></Pressable>
            {editingId ? <Pressable onPress={() => { setForm(emptyForm); setEditingId(null) }} style={styles.secondary}><Text style={styles.secondaryText}>Cancel</Text></Pressable> : null}
          </View>
        </View>
        <Text style={styles.sectionTitle}>Authorized students · {scanners.length}</Text>
        {loading ? <ActivityIndicator color={colors.primary} /> : scanners.map((scanner) => (
          <View key={scanner.id} style={styles.card}>
            <View style={styles.row}><Text style={styles.cardTitle}>{scanner.first_name} {scanner.last_name}</Text><Text style={styles.permissionValue}>{scanner.status}</Text></View>
            <Text style={styles.muted}>{scanner.student_id} · {scanner.program || "No program"}</Text>
            <Text style={styles.muted}>{permissionFields.filter(([key]) => scanner[key] === 1).map(([, label]) => label).join(" · ") || "No scanner permissions"}</Text>
            <View style={styles.actions}><Pressable onPress={() => { setForm(formFrom(scanner)); setEditingId(scanner.id) }} style={styles.secondary}><Text style={styles.secondaryText}>Edit permissions</Text></Pressable><Pressable disabled={saving} onPress={() => remove(scanner)} style={styles.delete}><Text style={styles.deleteText}>Remove</Text></Pressable></View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  center: { alignItems: "center", backgroundColor: colors.background, flex: 1, justifyContent: "center" },
  heading: { color: colors.text, fontSize: 25, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginBottom: 12, marginTop: 6 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 13, borderWidth: 1, marginBottom: 10, padding: 14 },
  cardTitle: { color: colors.text, flex: 1, fontSize: 14, fontWeight: "800" },
  input: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, marginTop: 10, paddingHorizontal: 12, paddingVertical: 11 },
  switchRow: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 44 },
  label: { color: colors.text, fontSize: 12, fontWeight: "700" },
  permissionValue: { color: colors.primary, fontSize: 11, fontWeight: "800" },
  actions: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  button: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 9, justifyContent: "center", minHeight: 42, paddingHorizontal: 14 },
  buttonText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  secondary: { backgroundColor: "#f1f7f1", borderRadius: 8, paddingHorizontal: 11, paddingVertical: 9 },
  secondaryText: { color: colors.primary, fontSize: 11, fontWeight: "800" },
  delete: { backgroundColor: "#fff1f0", borderRadius: 8, paddingHorizontal: 11, paddingVertical: 9 },
  deleteText: { color: colors.danger, fontSize: 11, fontWeight: "800" },
  disabled: { opacity: 0.5 },
  row: { alignItems: "center", flexDirection: "row" },
  muted: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 5 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: "800", marginBottom: 8, marginTop: 7 },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginBottom: 12, padding: 12 },
  success: { backgroundColor: "#eaf7eb", borderRadius: 10, color: colors.primary, lineHeight: 20, marginBottom: 12, padding: 12 },
})
