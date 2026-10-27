import { Redirect } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import AdminNavigation from "@/components/AdminNavigation"
import { useAdmin } from "@/contexts/AdminContext"
import { api, type AdminEvent } from "@/services/api"
import { colors } from "@/theme"

const emptyForm = {
  event_name: "",
  event_date: "",
  start_time: "",
  end_time: "",
  evaluation_link: "",
}

type EventForm = typeof emptyForm

export default function AdminEventsScreen() {
  const { admin, csrfToken, loading: authLoading } = useAdmin()
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [form, setForm] = useState<EventForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const loadEvents = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true)
    else setLoading(true)
    setError("")
    try {
      setEvents(await api.getAdminEvents())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load events.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (!admin) return
    let active = true
    api.getAdminEvents()
      .then((result) => { if (active) setEvents(result) })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load events.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [admin])

  if (authLoading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
  if (!admin) return <Redirect href="/admin/login" />

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const submit = async () => {
    if (saving) return
    setError("")
    setNotice("")
    setSaving(true)
    try {
      const result = await api.saveAdminEvent(editingId ? "update" : "create", {
        ...form,
        event_id: editingId || undefined,
      }, csrfToken)
      setNotice(result.message || (editingId ? "Event updated." : "Event created."))
      resetForm()
      await loadEvents(true)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save event.")
    } finally {
      setSaving(false)
    }
  }

  const editEvent = (event: AdminEvent) => {
    setEditingId(event.event_id)
    setForm({
      event_name: event.event_name,
      event_date: event.event_date,
      start_time: event.start_time.slice(0, 5),
      end_time: event.end_time.slice(0, 5),
      evaluation_link: event.evaluation_link || "",
    })
    setNotice("")
    setError("")
  }

  const changeStatus = async (event: AdminEvent) => {
    setError("")
    setNotice("")
    try {
      const status = event.status === "Active" ? "Inactive" : "Active"
      const result = await api.updateAdminEventStatus(event.event_id, status, csrfToken)
      setNotice(result.message || "Event status updated.")
      await loadEvents(true)
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Could not update event status.")
    }
  }

  const removeEvent = (event: AdminEvent) => {
    Alert.alert(
      "Delete event?",
      `Delete “${event.event_name}”? Events with linked attendance may not be deletable.`,
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
                const result = await api.deleteAdminEvent(event.event_id, csrfToken)
                setNotice(result.message || "Event deleted.")
                if (editingId === event.event_id) resetForm()
                await loadEvents(true)
              } catch (deleteError) {
                setError(deleteError instanceof Error ? deleteError.message : "Could not delete event.")
              }
            })()
          },
        },
      ],
    )
  }

  const updateForm = (key: keyof EventForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  return (
    <View style={styles.page}>
      <AdminNavigation />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadEvents(true)} tintColor={colors.primary} />}
      >
        <Text style={styles.heading}>Events</Text>
        <Text style={styles.subtitle}>Create activities and manage event details, attendance status, and evaluation links.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {notice ? <Text accessibilityRole="status" style={styles.success}>{notice}</Text> : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{editingId ? "Edit event" : "Create event"}</Text>
          <TextInput onChangeText={(value) => updateForm("event_name", value)} placeholder="Event name" placeholderTextColor={colors.placeholder} style={styles.input} value={form.event_name} maxLength={100} />
          <TextInput onChangeText={(value) => updateForm("event_date", value)} placeholder="Date (YYYY-MM-DD)" placeholderTextColor={colors.placeholder} style={styles.input} value={form.event_date} />
          <View style={styles.timeRow}>
            <TextInput onChangeText={(value) => updateForm("start_time", value)} placeholder="Start (HH:MM)" placeholderTextColor={colors.placeholder} style={[styles.input, styles.timeInput]} value={form.start_time} />
            <TextInput onChangeText={(value) => updateForm("end_time", value)} placeholder="End (HH:MM)" placeholderTextColor={colors.placeholder} style={[styles.input, styles.timeInput]} value={form.end_time} />
          </View>
          <TextInput autoCapitalize="none" keyboardType="url" onChangeText={(value) => updateForm("evaluation_link", value)} placeholder="Evaluation link (optional)" placeholderTextColor={colors.placeholder} style={styles.input} value={form.evaluation_link} />
          <Pressable accessibilityRole="button" disabled={saving || !form.event_name.trim() || !form.event_date.trim() || !form.start_time.trim() || !form.end_time.trim()} onPress={() => void submit()} style={[styles.button, (saving || !form.event_name.trim() || !form.event_date.trim() || !form.start_time.trim() || !form.end_time.trim()) && styles.disabled]}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{editingId ? "Save changes" : "Create event"}</Text>}
          </Pressable>
          {editingId ? (
            <Pressable accessibilityRole="button" onPress={resetForm} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel editing</Text></Pressable>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>All events</Text>
        {loading ? <ActivityIndicator color={colors.primary} /> : events.length === 0 ? (
          <View style={styles.card}><Text style={styles.muted}>No events are available. Create one above.</Text></View>
        ) : events.map((event) => (
          <View key={event.event_id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>{event.event_name}</Text>
              <Text style={[styles.status, event.status === "Active" ? styles.activeStatus : styles.inactiveStatus]}>{event.status}</Text>
            </View>
            <Text style={styles.detail}>{event.event_date} · {event.start_time.slice(0, 5)}–{event.end_time.slice(0, 5)}</Text>
            <Text style={styles.muted}>{event.attendance_count} attendance records</Text>
            {event.evaluation_link ? <Text numberOfLines={2} style={styles.link}>{event.evaluation_link}</Text> : null}
            <View style={styles.actions}>
              <Pressable accessibilityRole="button" onPress={() => editEvent(event)} style={styles.action}><Text style={styles.actionText}>Edit</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={() => void changeStatus(event)} style={styles.action}><Text style={styles.actionText}>{event.status === "Active" ? "Deactivate" : "Activate"}</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={() => removeEvent(event)} style={styles.deleteAction}><Text style={styles.deleteText}>Delete</Text></Pressable>
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
  timeRow: { flexDirection: "row", gap: 8 },
  timeInput: { flex: 1 },
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
  detail: { color: colors.text, fontSize: 13, marginTop: 9 },
  muted: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  link: { color: colors.primary, fontSize: 11, marginTop: 7 },
  actions: { borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", gap: 8, marginTop: 12, paddingTop: 10 },
  action: { backgroundColor: "#f1f7f1", borderRadius: 8, paddingHorizontal: 11, paddingVertical: 8 },
  actionText: { color: colors.primary, fontSize: 11, fontWeight: "800" },
  deleteAction: { backgroundColor: "#fff1f0", borderRadius: 8, paddingHorizontal: 11, paddingVertical: 8 },
  deleteText: { color: colors.danger, fontSize: 11, fontWeight: "800" },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginBottom: 12, overflow: "hidden", padding: 12 },
  success: { backgroundColor: "#eaf7eb", borderRadius: 10, color: colors.primary, lineHeight: 20, marginBottom: 12, overflow: "hidden", padding: 12 },
})
