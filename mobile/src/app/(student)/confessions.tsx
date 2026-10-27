import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native"
import { api, type StudentConfession } from "@/services/api"
import { colors } from "@/theme"

const categories = ["general", "love", "school", "rants", "shoutout", "advice"]

export default function ConfessionsScreen() {
  const [confessions, setConfessions] = useState<StudentConfession[]>([])
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("general")
  const [anonymous, setAnonymous] = useState(true)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const loadConfessions = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true)
    else setLoading(true)
    setError("")
    try {
      setConfessions(await api.getConfessions())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load confessions.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    api.getConfessions()
      .then((result) => { if (active) setConfessions(result) })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load confessions.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const submit = async () => {
    if (!content.trim() || submitting) return
    setSubmitting(true)
    setError("")
    setNotice("")
    try {
      await api.submitConfession(content.trim(), category, anonymous, await api.getCsrfToken())
      setContent("")
      setNotice("Your confession was posted.")
      await loadConfessions(true)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not submit confession.")
    } finally {
      setSubmitting(false)
    }
  }

  const react = async (id: number) => {
    setError("")
    try {
      await api.reactToConfession(id, await api.getCsrfToken())
      await loadConfessions(true)
    } catch (reactionError) {
      setError(reactionError instanceof Error ? reactionError.message : "Could not react to confession.")
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadConfessions(true)} tintColor={colors.primary} />}
      style={styles.page}
    >
      <Text style={styles.heading}>Confessions</Text>
      <Text style={styles.subtitle}>Share your thoughts anonymously or openly.</Text>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {notice ? <Text accessibilityRole="status" style={styles.success}>{notice}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Write a confession</Text>
        <TextInput
          accessibilityLabel="Confession"
          maxLength={500}
          multiline
          onChangeText={setContent}
          placeholder="What's on your mind?"
          placeholderTextColor={colors.placeholder}
          style={styles.textArea}
          textAlignVertical="top"
          value={content}
        />
        <Text style={styles.counter}>{content.length}/500</Text>
        <Text style={styles.label}>CATEGORY</Text>
        <View style={styles.categories}>
          {categories.map((item) => (
            <Pressable key={item} onPress={() => setCategory(item)} style={[styles.chip, category === item && styles.selectedChip]}>
              <Text style={[styles.chipText, category === item && styles.selectedChipText]}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.body}>Post anonymously</Text>
          <Switch onValueChange={setAnonymous} trackColor={{ true: colors.primary }} value={anonymous} />
        </View>
        <Pressable accessibilityRole="button" disabled={!content.trim() || submitting} onPress={() => void submit()} style={[styles.button, (!content.trim() || submitting) && styles.disabled]}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Post confession</Text>}
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Community feed</Text>
      {loading ? (
        <View style={styles.card}><Text style={styles.muted}>Loading confessions...</Text></View>
      ) : confessions.length === 0 ? (
        <View style={styles.card}><Text style={styles.cardTitle}>No confessions yet</Text><Text style={styles.muted}>Be the first to share.</Text></View>
      ) : confessions.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.feedHeader}>
            <Text style={styles.category}>{item.category}</Text>
            <Text style={styles.time}>{item.created_at}</Text>
          </View>
          <Text style={styles.body}>{item.content}</Text>
          <View style={styles.feedFooter}>
            <Pressable accessibilityRole="button" onPress={() => void react(item.id)} style={styles.reaction}>
              <Text style={[styles.reactionText, item.liked && styles.liked]}>♥ {item.likes}</Text>
            </Pressable>
            <Text style={styles.muted}>Comments: {item.comments}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { padding: 22, paddingTop: 28, paddingBottom: 36 },
  heading: { color: colors.text, fontSize: 28, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 8, marginBottom: 18 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 16, borderWidth: 1, marginBottom: 12, padding: 16 },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: "800" },
  textArea: { backgroundColor: colors.background, borderColor: colors.border, borderRadius: 12, borderWidth: 1, color: colors.text, height: 110, marginTop: 12, padding: 12 },
  counter: { color: colors.muted, fontSize: 11, marginTop: 5, textAlign: "right" },
  label: { color: colors.muted, fontSize: 11, fontWeight: "900", letterSpacing: 1, marginTop: 14 },
  categories: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 9 },
  chip: { borderColor: colors.border, borderRadius: 18, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 7 },
  selectedChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.muted, fontSize: 12, textTransform: "capitalize" },
  selectedChipText: { color: "#fff", fontWeight: "700" },
  switchRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  body: { color: colors.text, fontSize: 14, lineHeight: 21 },
  button: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 11, justifyContent: "center", minHeight: 46, marginTop: 14 },
  buttonText: { color: "#fff", fontWeight: "800" },
  disabled: { opacity: 0.55 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "800", marginBottom: 10, marginTop: 10 },
  feedHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  category: { backgroundColor: "#eaf5ea", borderRadius: 14, color: colors.primary, fontSize: 11, overflow: "hidden", paddingHorizontal: 9, paddingVertical: 5, textTransform: "capitalize" },
  time: { color: colors.placeholder, fontSize: 11 },
  feedFooter: { alignItems: "center", borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", gap: 18, marginTop: 12, paddingTop: 10 },
  reaction: { paddingVertical: 3 },
  reactionText: { color: colors.muted, fontWeight: "700" },
  liked: { color: colors.danger },
  muted: { color: colors.muted, lineHeight: 20, marginTop: 6 },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginBottom: 12, overflow: "hidden", padding: 12 },
  success: { backgroundColor: "#eaf7eb", borderRadius: 10, color: colors.primary, lineHeight: 20, marginBottom: 12, overflow: "hidden", padding: 12 },
})
