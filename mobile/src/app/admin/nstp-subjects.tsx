import { Redirect } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native"
import AdminNavigation from "@/components/AdminNavigation"
import { useAdmin } from "@/contexts/AdminContext"
import { api, type AdminNstpSubject } from "@/services/api"
import { colors } from "@/theme"

export default function AdminNstpSubjectsScreen() {
  const { admin, csrfToken, loading: authLoading } = useAdmin()
  const [subjects, setSubjects] = useState<AdminNstpSubject[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [section, setSection] = useState("")
  const [active, setActive] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  useEffect(() => {
    if (!admin) return
    let current = true
    api.getAdminNstpSubjects()
      .then((result) => { if (current) setSubjects(result) })
      .catch((loadError: unknown) => { if (current) setError(loadError instanceof Error ? loadError.message : "Could not load NSTP subjects.") })
      .finally(() => { if (current) setLoading(false) })
    return () => { current = false }
  }, [admin])

  if (authLoading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
  if (!admin) return <Redirect href="/admin/login" />

  const refresh = async () => {
    setSubjects(await api.getAdminNstpSubjects())
  }
  const reset = () => { setEditingId(null); setCode(""); setName(""); setSection(""); setActive(true) }
  const save = async () => {
    if (!code.trim() || saving) return
    setSaving(true); setError(""); setNotice("")
    try {
      const result = await api.saveAdminNstpSubject(editingId ? "update" : "create", {
        id: editingId || 0, subject_code: code.trim().toUpperCase(), subject_name: name.trim(),
        section: section.trim(), is_active: active ? 1 : 0,
      }, csrfToken)
      setNotice(result.message || "NSTP subject saved.")
      reset()
      await refresh()
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Could not save NSTP subject.") }
    finally { setSaving(false) }
  }
  const remove = (subject: AdminNstpSubject) => Alert.alert("Delete subject code?", `${subject.subject_code} may be referenced by attendance records.`, [
    { text: "Keep", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: () => {
      setSaving(true)
      void api.saveAdminNstpSubject("delete", { id: subject.id }, csrfToken)
        .then(async (result) => { setNotice(result.message || "Subject deleted."); await refresh() })
        .catch((deleteError: unknown) => setError(deleteError instanceof Error ? deleteError.message : "Could not delete subject."))
        .finally(() => setSaving(false))
    } },
  ])

  return (
    <View style={styles.page}>
      <AdminNavigation />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>NSTP subject codes</Text>
        <Text style={styles.subtitle}>Maintain subject codes instructors and students use for NSTP attendance.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {notice ? <Text accessibilityRole="status" style={styles.success}>{notice}</Text> : null}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{editingId ? "Edit subject" : "Add subject code"}</Text>
          <TextInput autoCapitalize="characters" maxLength={20} onChangeText={setCode} placeholder="Subject code (required)" placeholderTextColor={colors.placeholder} style={styles.input} value={code} />
          <TextInput maxLength={100} onChangeText={setName} placeholder="Subject name" placeholderTextColor={colors.placeholder} style={styles.input} value={name} />
          <TextInput maxLength={50} onChangeText={setSection} placeholder="Section" placeholderTextColor={colors.placeholder} style={styles.input} value={section} />
          <View style={styles.switchRow}><Text style={styles.label}>Active</Text><Switch value={active} onValueChange={setActive} trackColor={{ true: colors.primary }} /></View>
          <View style={styles.actions}><Pressable disabled={saving || !code.trim()} onPress={() => void save()} style={[styles.button, (saving || !code.trim()) && styles.disabled]}><Text style={styles.buttonText}>{saving ? "Saving…" : editingId ? "Save changes" : "Add subject"}</Text></Pressable>{editingId ? <Pressable onPress={reset} style={styles.secondary}><Text style={styles.secondaryText}>Cancel</Text></Pressable> : null}</View>
        </View>
        {loading ? <ActivityIndicator color={colors.primary} /> : subjects.map((subject) => (
          <View key={subject.id} style={styles.card}>
            <View style={styles.row}><Text style={styles.cardTitle}>{subject.subject_code}</Text><Text style={subject.is_active ? styles.active : styles.inactive}>{subject.is_active ? "Active" : "Inactive"}</Text></View>
            <Text style={styles.muted}>{subject.subject_name || "No subject name"} · Section {subject.section || "—"}</Text>
            <View style={styles.actions}><Pressable onPress={() => { setEditingId(subject.id); setCode(subject.subject_code); setName(subject.subject_name); setSection(subject.section); setActive(subject.is_active === 1) }} style={styles.secondary}><Text style={styles.secondaryText}>Edit</Text></Pressable><Pressable disabled={saving} onPress={() => remove(subject)} style={styles.delete}><Text style={styles.deleteText}>Delete</Text></Pressable></View>
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
  switchRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  label: { color: colors.text, fontSize: 12, fontWeight: "700" },
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
  active: { color: colors.primary, fontSize: 11, fontWeight: "800" },
  inactive: { color: colors.muted, fontSize: 11, fontWeight: "800" },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginBottom: 12, padding: 12 },
  success: { backgroundColor: "#eaf7eb", borderRadius: 10, color: colors.primary, lineHeight: 20, marginBottom: 12, padding: 12 },
})
