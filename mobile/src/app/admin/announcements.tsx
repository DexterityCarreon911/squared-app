import { Redirect } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import AdminNavigation from "@/components/AdminNavigation"
import { useAdmin } from "@/contexts/AdminContext"
import { api, type AdminAnnouncement } from "@/services/api"
import { colors } from "@/theme"

const targets = ["all", "ITE", "CELA", "CBA", "HME", "CJE"]

export default function AdminAnnouncementsScreen() {
  const { admin, csrfToken, loading: authLoading } = useAdmin()
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([])
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [target, setTarget] = useState("all")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  useEffect(() => {
    if (!admin) return
    let active = true
    api.getAdminAnnouncements()
      .then((result) => { if (active) setAnnouncements(result) })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load announcements.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [admin])

  if (authLoading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
  if (!admin) return <Redirect href="/admin/login" />

  const refresh = async () => {
    setAnnouncements(await api.getAdminAnnouncements())
  }

  const publish = async () => {
    if (!title.trim() || !content.trim() || submitting) return
    setError("")
    setNotice("")
    setSubmitting(true)
    try {
      const result = await api.createAdminAnnouncement(title.trim(), content.trim(), target, csrfToken)
      setNotice(result.message || "Announcement published.")
      setTitle("")
      setContent("")
      setTarget("all")
      await refresh()
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : "Could not publish announcement.")
    } finally {
      setSubmitting(false)
    }
  }

  const remove = async (id: number) => {
    setError("")
    setNotice("")
    try {
      const result = await api.deleteAdminAnnouncement(id, csrfToken)
      setNotice(result.message || "Announcement deleted.")
      await refresh()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete announcement.")
    }
  }

  return (
    <View style={styles.page}>
      <AdminNavigation />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Announcements</Text>
        <Text style={styles.subtitle}>Publish campus announcements to all students or a program.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {notice ? <Text accessibilityRole="status" style={styles.success}>{notice}</Text> : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>New announcement</Text>
          <TextInput onChangeText={setTitle} placeholder="Title" placeholderTextColor={colors.placeholder} style={styles.input} value={title} />
          <TextInput multiline onChangeText={setContent} placeholder="Announcement details" placeholderTextColor={colors.placeholder} style={[styles.input, styles.textArea]} textAlignVertical="top" value={content} />
          <Text style={styles.label}>AUDIENCE</Text>
          <View style={styles.targets}>
            {targets.map((item) => (
              <Pressable key={item} onPress={() => setTarget(item)} style={[styles.chip, target === item && styles.selectedChip]}>
                <Text style={[styles.chipText, target === item && styles.selectedChipText]}>{item === "all" ? "All" : item}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable accessibilityRole="button" disabled={submitting || !title.trim() || !content.trim()} onPress={() => void publish()} style={[styles.button, (submitting || !title.trim() || !content.trim()) && styles.disabled]}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Publish announcement</Text>}
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Published announcements</Text>
        {loading ? <ActivityIndicator color={colors.primary} /> : announcements.length === 0 ? (
          <View style={styles.card}><Text style={styles.muted}>No announcements yet.</Text></View>
        ) : announcements.map((announcement) => (
          <View key={announcement.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>{announcement.title}</Text>
              <Pressable accessibilityRole="button" onPress={() => Alert.alert(
                "Delete announcement?",
                `Delete “${announcement.title}”?`,
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: () => void remove(announcement.id) },
                ],
              )}><Text style={styles.delete}>Delete</Text></Pressable>
            </View>
            <Text style={styles.body}>{announcement.content}</Text>
            <Text style={styles.muted}>{announcement.target} · {announcement.status} · {announcement.created_at}</Text>
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
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20, marginBottom: 13, marginTop: 6 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 13, borderWidth: 1, marginBottom: 10, padding: 14 },
  cardTitle: { color: colors.text, flex: 1, fontSize: 15, fontWeight: "800" },
  input: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, marginTop: 10, paddingHorizontal: 12, paddingVertical: 11 },
  textArea: { height: 100 },
  label: { color: colors.muted, fontSize: 10, fontWeight: "900", marginTop: 13 },
  targets: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 8 },
  chip: { borderColor: colors.border, borderRadius: 16, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7 },
  selectedChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.muted, fontSize: 11 },
  selectedChipText: { color: "#fff", fontWeight: "800" },
  button: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 10, justifyContent: "center", minHeight: 44, marginTop: 14 },
  buttonText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  disabled: { opacity: 0.55 },
  row: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  body: { color: colors.text, fontSize: 13, lineHeight: 19, marginTop: 9 },
  muted: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 7 },
  delete: { color: colors.danger, fontSize: 11, fontWeight: "800", padding: 6 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: "800", marginBottom: 7, marginTop: 13 },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginBottom: 10, overflow: "hidden", padding: 12 },
  success: { backgroundColor: "#eaf7eb", borderRadius: 10, color: colors.primary, lineHeight: 20, marginBottom: 10, overflow: "hidden", padding: 12 },
})
