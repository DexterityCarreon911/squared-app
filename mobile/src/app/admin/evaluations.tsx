import { Redirect } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native"
import AdminNavigation from "@/components/AdminNavigation"
import { useAdmin } from "@/contexts/AdminContext"
import { api, type AdminEvaluationField } from "@/services/api"
import { colors } from "@/theme"

const fieldTypes: AdminEvaluationField["field_type"][] = ["text", "textarea", "radio", "select", "checkbox", "rating"]

interface EvaluationForm {
  field_key: string
  field_label: string
  field_type: AdminEvaluationField["field_type"]
  field_options: string
  field_placeholder: string
  field_help_text: string
  is_required: boolean
  active: boolean
  sort_order: string
}

const emptyForm: EvaluationForm = {
  field_key: "",
  field_label: "",
  field_type: "text",
  field_options: "",
  field_placeholder: "",
  field_help_text: "",
  is_required: true,
  active: true,
  sort_order: "100",
}

function formFromField(field: AdminEvaluationField): EvaluationForm {
  return {
    field_key: field.field_key,
    field_label: field.field_label,
    field_type: field.field_type,
    field_options: field.field_options || "",
    field_placeholder: field.field_placeholder || "",
    field_help_text: field.field_help_text || "",
    is_required: field.is_required === 1,
    active: field.active === 1,
    sort_order: String(field.sort_order),
  }
}

export default function AdminEvaluationsScreen() {
  const { admin, csrfToken, loading: authLoading } = useAdmin()
  const [fields, setFields] = useState<AdminEvaluationField[]>([])
  const [form, setForm] = useState<EvaluationForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  useEffect(() => {
    if (!admin) return
    let active = true
    api.getAdminEvaluationFields()
      .then((result) => { if (active) setFields(result) })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load evaluation fields.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [admin])

  if (authLoading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
  if (!admin) return <Redirect href="/admin/login" />

  const refresh = async () => {
    setFields(await api.getAdminEvaluationFields())
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const updateForm = <K extends keyof EvaluationForm>(key: K, value: EvaluationForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const save = async () => {
    if (saving || !form.field_key.trim() || !form.field_label.trim()) return
    const sortOrder = Number(form.sort_order)
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      setError("Display order must be a non-negative whole number.")
      return
    }
    setSaving(true)
    setError("")
    setNotice("")
    try {
      const result = await api.saveAdminEvaluationField(editingId ? "update" : "create", {
        ...(editingId ? { field_id: editingId } : {}),
        field_key: form.field_key.trim().toLowerCase(),
        field_label: form.field_label.trim(),
        field_type: form.field_type,
        field_options: form.field_options.trim(),
        field_placeholder: form.field_placeholder.trim(),
        field_help_text: form.field_help_text.trim(),
        is_required: form.is_required ? "1" : "0",
        active: form.active ? "1" : "0",
        sort_order: sortOrder,
      }, csrfToken)
      setNotice(result.message || "Evaluation field saved.")
      resetForm()
      await refresh()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save evaluation field.")
    } finally {
      setSaving(false)
    }
  }

  const remove = (field: AdminEvaluationField) => {
    Alert.alert(
      "Delete evaluation field?",
      `Delete “${field.field_label}”? This may be blocked if submitted responses already use it.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              setError("")
              setNotice("")
              try {
                const result = await api.saveAdminEvaluationField("delete", { field_id: field.field_id }, csrfToken)
                setNotice(result.message || "Evaluation field deleted.")
                if (editingId === field.field_id) resetForm()
                await refresh()
              } catch (deleteError) {
                setError(deleteError instanceof Error ? deleteError.message : "Could not delete evaluation field.")
              }
            })()
          },
        },
      ],
    )
  }

  const needsOptions = ["radio", "select", "checkbox"].includes(form.field_type)

  return (
    <View style={styles.page}>
      <AdminNavigation />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Evaluation form builder</Text>
        <Text style={styles.subtitle}>Configure the fields students use to evaluate events.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {notice ? <Text accessibilityRole="status" style={styles.success}>{notice}</Text> : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{editingId ? "Edit field" : "Add field"}</Text>
          <TextInput autoCapitalize="none" onChangeText={(value) => updateForm("field_key", value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())} placeholder="Field key (example: event_rating)" placeholderTextColor={colors.placeholder} style={styles.input} value={form.field_key} maxLength={100} />
          <TextInput onChangeText={(value) => updateForm("field_label", value)} placeholder="Field label" placeholderTextColor={colors.placeholder} style={styles.input} value={form.field_label} maxLength={255} />
          <Text style={styles.label}>FIELD TYPE</Text>
          <View style={styles.options}>
            {fieldTypes.map((type) => (
              <Pressable key={type} accessibilityRole="button" onPress={() => updateForm("field_type", type)} style={[styles.option, form.field_type === type && styles.selectedOption]}>
                <Text style={[styles.optionText, form.field_type === type && styles.selectedOptionText]}>{type}</Text>
              </Pressable>
            ))}
          </View>
          {needsOptions ? <TextInput onChangeText={(value) => updateForm("field_options", value)} placeholder="Options separated by commas" placeholderTextColor={colors.placeholder} style={styles.input} value={form.field_options} /> : null}
          <TextInput onChangeText={(value) => updateForm("field_placeholder", value)} placeholder="Placeholder (optional)" placeholderTextColor={colors.placeholder} style={styles.input} value={form.field_placeholder} />
          <TextInput onChangeText={(value) => updateForm("field_help_text", value)} placeholder="Help text (optional)" placeholderTextColor={colors.placeholder} style={styles.input} value={form.field_help_text} />
          <TextInput keyboardType="number-pad" onChangeText={(value) => updateForm("sort_order", value)} placeholder="Display order" placeholderTextColor={colors.placeholder} style={styles.input} value={form.sort_order} />
          <View style={styles.switchRow}>
            <Text style={styles.switchTitle}>Required</Text>
            <Switch onValueChange={(value) => updateForm("is_required", value)} value={form.is_required} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchTitle}>Active on student forms</Text>
            <Switch onValueChange={(value) => updateForm("active", value)} value={form.active} />
          </View>
          <Pressable accessibilityRole="button" disabled={saving || !form.field_key.trim() || !form.field_label.trim()} onPress={() => void save()} style={[styles.button, (saving || !form.field_key.trim() || !form.field_label.trim()) && styles.disabled]}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{editingId ? "Save field" : "Add field"}</Text>}
          </Pressable>
          {editingId ? <Pressable accessibilityRole="button" onPress={resetForm} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel editing</Text></Pressable> : null}
        </View>

        <Text style={styles.sectionTitle}>Configured fields</Text>
        {loading ? <ActivityIndicator color={colors.primary} /> : fields.length === 0 ? (
          <View style={styles.card}><Text style={styles.muted}>No evaluation fields have been configured.</Text></View>
        ) : fields.map((field) => (
          <View key={field.field_id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>{field.field_label}</Text>
              <Text style={[styles.status, field.active === 1 ? styles.activeStatus : styles.inactiveStatus]}>{field.active === 1 ? "Active" : "Inactive"}</Text>
            </View>
            <Text style={styles.muted}>{field.field_key} · {field.field_type} · {field.is_required === 1 ? "Required" : "Optional"} · Order {field.sort_order}</Text>
            {field.field_options ? <Text style={styles.body}>Options: {field.field_options}</Text> : null}
            {field.field_help_text ? <Text style={styles.body}>{field.field_help_text}</Text> : null}
            <View style={styles.actions}>
              <Pressable accessibilityRole="button" onPress={() => { setEditingId(field.field_id); setForm(formFromField(field)); setError(""); setNotice("") }} style={styles.action}><Text style={styles.actionText}>Edit</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={() => remove(field)} style={styles.deleteAction}><Text style={styles.deleteText}>Delete</Text></Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 20, paddingBottom: 36 },
  center: { alignItems: "center", backgroundColor: colors.background, flex: 1, justifyContent: "center" },
  heading: { color: colors.text, fontSize: 26, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20, marginBottom: 15, marginTop: 6 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 13, borderWidth: 1, marginBottom: 10, padding: 14 },
  cardTitle: { color: colors.text, flex: 1, fontSize: 15, fontWeight: "800" },
  input: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, marginTop: 10, paddingHorizontal: 12, paddingVertical: 11 },
  label: { color: colors.muted, fontSize: 10, fontWeight: "900", marginTop: 13 },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 8 },
  option: { borderColor: colors.border, borderRadius: 16, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7 },
  selectedOption: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { color: colors.muted, fontSize: 11 },
  selectedOptionText: { color: "#fff", fontWeight: "800" },
  switchRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 9 },
  switchTitle: { color: colors.text, fontSize: 12, fontWeight: "700" },
  button: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 10, justifyContent: "center", minHeight: 44, marginTop: 14 },
  buttonText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  disabled: { opacity: 0.55 },
  cancelButton: { alignItems: "center", paddingVertical: 11 },
  cancelText: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: "800", marginBottom: 7, marginTop: 13 },
  row: { alignItems: "center", flexDirection: "row", gap: 8 },
  status: { borderRadius: 10, fontSize: 10, fontWeight: "800", overflow: "hidden", paddingHorizontal: 8, paddingVertical: 5 },
  activeStatus: { backgroundColor: "#e8f5e9", color: colors.primary },
  inactiveStatus: { backgroundColor: "#f1f2f4", color: colors.muted },
  muted: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  body: { color: colors.text, fontSize: 12, lineHeight: 19, marginTop: 8 },
  actions: { borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", gap: 8, marginTop: 12, paddingTop: 10 },
  action: { backgroundColor: "#f1f7f1", borderRadius: 8, paddingHorizontal: 11, paddingVertical: 8 },
  actionText: { color: colors.primary, fontSize: 11, fontWeight: "800" },
  deleteAction: { backgroundColor: "#fff1f0", borderRadius: 8, paddingHorizontal: 11, paddingVertical: 8 },
  deleteText: { color: colors.danger, fontSize: 11, fontWeight: "800" },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginBottom: 12, overflow: "hidden", padding: 12 },
  success: { backgroundColor: "#eaf7eb", borderRadius: 10, color: colors.primary, lineHeight: 20, marginBottom: 12, overflow: "hidden", padding: 12 },
})
