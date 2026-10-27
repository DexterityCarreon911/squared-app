import { Redirect } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native"
import AdminNavigation from "@/components/AdminNavigation"
import { useAdmin } from "@/contexts/AdminContext"
import { api, type AdminPaymentEvent } from "@/services/api"
import { colors } from "@/theme"

export default function AdminPayableEventsScreen() {
  const { admin, csrfToken, loading: authLoading } = useAdmin()
  const [events, setEvents] = useState<AdminPaymentEvent[]>([])
  const [editing, setEditing] = useState<number | null>(null)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [fee, setFee] = useState("")
  const [prefix, setPrefix] = useState("")
  const [order, setOrder] = useState("50")
  const [active, setActive] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  useEffect(() => {
    if (!admin) return
    let current = true
    api.getAdminPaymentEvents()
      .then((result) => { if (current) setEvents(result) })
      .catch((loadError: unknown) => { if (current) setError(loadError instanceof Error ? loadError.message : "Could not load payable events.") })
      .finally(() => { if (current) setLoading(false) })
    return () => { current = false }
  }, [admin])

  if (authLoading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
  if (!admin) return <Redirect href="/admin/login" />

  const refresh = async () => setEvents(await api.getAdminPaymentEvents())
  const reset = () => { setEditing(null); setName(""); setSlug(""); setFee(""); setPrefix(""); setOrder("50"); setActive(true) }
  const save = async () => {
    const feeValue = Number(fee)
    const orderValue = Number(order)
    if (!name.trim() || !Number.isFinite(feeValue) || feeValue < 0 || !Number.isInteger(orderValue) || orderValue < 0 || (!editing && !slug.trim())) {
      setError("Enter the name, a valid non-negative fee and sort order, and a slug.")
      return
    }
    setSaving(true); setError(""); setNotice("")
    try {
      const result = await api.saveAdminPaymentEvent(editing ? "update" : "add", {
        event_id: editing || 0, slug: slug.trim().toLowerCase(), event_name: name.trim(), fee_amount: feeValue,
        receipt_prefix: prefix.trim().toUpperCase(), sort_order: orderValue, is_active: active ? 1 : 0,
      }, csrfToken)
      setNotice(result.message || "Payable event saved.")
      reset()
      await refresh()
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Could not save payable event.") }
    finally { setSaving(false) }
  }
  const mutate = async (action: "toggle" | "delete", event: AdminPaymentEvent) => {
    setSaving(true); setError(""); setNotice("")
    try {
      const result = await api.saveAdminPaymentEvent(action, {
        event_id: event.event_id, is_active: action === "toggle" ? (event.is_active ? 0 : 1) : event.is_active,
      }, csrfToken)
      setNotice(result.message || "Payable event updated.")
      await refresh()
    } catch (mutationError) { setError(mutationError instanceof Error ? mutationError.message : "Could not update payable event.") }
    finally { setSaving(false) }
  }
  const confirmDelete = (event: AdminPaymentEvent) => {
    if (event.payment_count > 0) {
      Alert.alert("Cannot delete event", "This payable event has payment history. Deactivate it instead.")
      return
    }
    Alert.alert("Delete payable event?", `Delete ${event.event_name}?`, [
      { text: "Keep", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => void mutate("delete", event) },
    ])
  }

  return (
    <View style={styles.page}>
      <AdminNavigation />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Payable events</Text>
        <Text style={styles.subtitle}>Configure fee events that appear in the payment scanner and receipts.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {notice ? <Text accessibilityRole="status" style={styles.success}>{notice}</Text> : null}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{editing ? "Edit payable event" : "Add payable event"}</Text>
          <TextInput
            onChangeText={(value) => {
              setName(value)
              if (!editing) setSlug(value.toLowerCase().trim().replace(/[^a-z0-9\s_-]/g, "").replace(/\s+/g, "_").replace(/-+/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, ""))
            }}
            placeholder="Event name"
            placeholderTextColor={colors.placeholder}
            style={styles.input}
            value={name}
          />
          {!editing ? <TextInput autoCapitalize="none" onChangeText={setSlug} placeholder="Unique slug (e.g. retreat_2026)" placeholderTextColor={colors.placeholder} style={styles.input} value={slug} /> : <Text style={styles.muted}>Locked slug: {slug}</Text>}
          <TextInput keyboardType="decimal-pad" onChangeText={setFee} placeholder="Fee amount" placeholderTextColor={colors.placeholder} style={styles.input} value={fee} />
          <TextInput autoCapitalize="characters" maxLength={20} onChangeText={setPrefix} placeholder="Receipt prefix (optional)" placeholderTextColor={colors.placeholder} style={styles.input} value={prefix} />
          <TextInput keyboardType="number-pad" onChangeText={setOrder} placeholder="Sort order" placeholderTextColor={colors.placeholder} style={styles.input} value={order} />
          <View style={styles.row}><Text style={styles.label}>Accept payments</Text><Switch value={active} onValueChange={setActive} trackColor={{ true: colors.primary }} /></View>
          <View style={styles.actions}><Pressable disabled={saving} onPress={() => void save()} style={[styles.button, saving && styles.disabled]}><Text style={styles.buttonText}>{saving ? "Saving…" : editing ? "Save event" : "Add event"}</Text></Pressable>{editing ? <Pressable onPress={reset} style={styles.secondary}><Text style={styles.secondaryText}>Cancel</Text></Pressable> : null}</View>
        </View>
        {loading ? <ActivityIndicator color={colors.primary} /> : events.map((event) => (
          <View key={event.event_id} style={styles.card}>
            <View style={styles.row}><Text style={styles.cardTitle}>{event.event_name}</Text><Text style={event.is_active ? styles.active : styles.inactive}>{event.is_active ? "Active" : "Inactive"}</Text></View>
            <Text style={styles.muted}>{event.slug} · ₱{event.fee_amount.toFixed(2)} · Receipt {event.receipt_prefix || "SQ-PAY"}</Text>
            <Text style={styles.muted}>{event.payment_count} payment record(s) · Order {event.sort_order}</Text>
            <View style={styles.actions}>
              <Pressable onPress={() => { setEditing(event.event_id); setName(event.event_name); setSlug(event.slug); setFee(String(event.fee_amount)); setPrefix(event.receipt_prefix); setOrder(String(event.sort_order)); setActive(event.is_active === 1) }} style={styles.secondary}><Text style={styles.secondaryText}>Edit</Text></Pressable>
              <Pressable disabled={saving} onPress={() => void mutate("toggle", event)} style={styles.secondary}><Text style={styles.secondaryText}>{event.is_active ? "Deactivate" : "Activate"}</Text></Pressable>
              <Pressable disabled={saving} onPress={() => confirmDelete(event)} style={styles.delete}><Text style={styles.deleteText}>Delete</Text></Pressable>
            </View>
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
  row: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  label: { color: colors.text, fontSize: 12, fontWeight: "700" },
  actions: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  button: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 9, justifyContent: "center", minHeight: 42, paddingHorizontal: 14 },
  buttonText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  secondary: { backgroundColor: "#f1f7f1", borderRadius: 8, paddingHorizontal: 11, paddingVertical: 9 },
  secondaryText: { color: colors.primary, fontSize: 11, fontWeight: "800" },
  delete: { backgroundColor: "#fff1f0", borderRadius: 8, paddingHorizontal: 11, paddingVertical: 9 },
  deleteText: { color: colors.danger, fontSize: 11, fontWeight: "800" },
  disabled: { opacity: 0.5 },
  muted: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 5 },
  active: { color: colors.primary, fontSize: 11, fontWeight: "800" },
  inactive: { color: colors.muted, fontSize: 11, fontWeight: "800" },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginBottom: 12, padding: 12 },
  success: { backgroundColor: "#eaf7eb", borderRadius: 10, color: colors.primary, lineHeight: 20, marginBottom: 12, padding: 12 },
})
