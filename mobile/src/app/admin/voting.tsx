import * as ImagePicker from "expo-image-picker"
import { Redirect } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, Alert, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import AdminNavigation from "@/components/AdminNavigation"
import { useAdmin } from "@/contexts/AdminContext"
import { api, type AdminVotingAward, type AdminVotingNominee } from "@/services/api"
import { colors } from "@/theme"

export default function AdminVotingScreen() {
  const { admin, csrfToken, loading: authLoading } = useAdmin()
  const [awards, setAwards] = useState<AdminVotingAward[]>([])
  const [nominees, setNominees] = useState<AdminVotingNominee[]>([])
  const [selectedAward, setSelectedAward] = useState<number | null>(null)
  const [slug, setSlug] = useState("")
  const [title, setTitle] = useState("")
  const [nomineeName, setNomineeName] = useState("")
  const [description, setDescription] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [nomineePhoto, setNomineePhoto] = useState<{ uri: string; name: string } | null>(null)
  const [opensAt, setOpensAt] = useState("")
  const [closesAt, setClosesAt] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const loadData = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true)
    else setLoading(true)
    setError("")
    try {
      const result = await api.getAdminVotingData()
      setAwards(result.awards)
      setNominees(result.nominees)
      setSelectedAward((current) => current && result.awards.some((award) => award.id === current)
        ? current
        : result.awards[0]?.id ?? null)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load voting management.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (!admin) return
    let active = true
    api.getAdminVotingData()
      .then((result) => {
        if (!active) return
        setAwards(result.awards)
        setNominees(result.nominees)
        setSelectedAward(result.awards[0]?.id ?? null)
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load voting management.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [admin])

  if (authLoading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
  if (!admin) return <Redirect href="/admin/login" />

  const mutate = async (
    action: "create_award" | "add_nominee" | "toggle_award" | "delete_award" | "delete_nominee",
    fields: Record<string, string | number>,
    photo?: { uri: string; name: string },
  ) => {
    setSaving(true)
    setError("")
    setNotice("")
    try {
      const result = await api.updateAdminVoting(action, fields, csrfToken, photo)
      setNotice(result.message || "Voting management updated.")
      await loadData(true)
      return true
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "Could not update voting management.")
      return false
    } finally {
      setSaving(false)
    }
  }

  const createAward = async () => {
    if (!slug.trim() || !title.trim() || saving) return
    const saved = await mutate("create_award", {
      slug: slug.trim(),
      title: title.trim(),
      opens_at: opensAt.trim(),
      closes_at: closesAt.trim(),
    })
    if (saved) {
      setSlug("")
      setTitle("")
      setOpensAt("")
      setClosesAt("")
    }
  }

  const addNominee = async () => {
    if (!selectedAward || !nomineeName.trim() || saving) return
    const saved = await mutate("add_nominee", {
      award_id: selectedAward,
      name: nomineeName.trim(),
      description: description.trim(),
      photo_url: photoUrl.trim(),
    }, nomineePhoto || undefined)
    if (saved) {
      setNomineeName("")
      setDescription("")
      setPhotoUrl("")
      setNomineePhoto(null)
    }
  }

  const chooseNomineePhoto = async () => {
    setError("")
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, quality: 0.9 })
      if (result.canceled || !result.assets[0]) return
      const asset = result.assets[0]
      setNomineePhoto({
        uri: asset.uri,
        name: asset.fileName || asset.uri.split(/[\\/]/).pop() || `nominee-${Date.now()}.jpg`,
      })
    } catch (pickerError) {
      setError(pickerError instanceof Error ? pickerError.message : "Could not open the image picker.")
    }
  }

  const confirmDeleteAward = (award: AdminVotingAward) => {
    Alert.alert(
      "Delete voting category?",
      award.vote_count > 0
        ? "This category has votes and cannot be deleted."
        : `Delete “${award.title}” and its nominees?`,
      award.vote_count > 0
        ? [{ text: "OK" }]
        : [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => void mutate("delete_award", { award_id: award.id }) },
        ],
    )
  }

  const confirmDeleteNominee = (nominee: AdminVotingNominee) => {
    Alert.alert("Delete nominee?", `Delete “${nominee.name}”?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => void mutate("delete_nominee", { nominee_id: nominee.id }) },
    ])
  }

  const visibleNominees = nominees.filter((nominee) => nominee.award_id === selectedAward)

  return (
    <View style={styles.page}>
      <AdminNavigation />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadData(true)} tintColor={colors.primary} />}>
        <Text style={styles.heading}>Voting management</Text>
        <Text style={styles.subtitle}>Manage PCA award categories and nominees, control voting availability, and review current vote counts.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {notice ? <Text accessibilityRole="status" style={styles.success}>{notice}</Text> : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create category</Text>
          <TextInput autoCapitalize="none" onChangeText={setSlug} placeholder="Unique slug (e.g. best-performer)" placeholderTextColor={colors.placeholder} style={styles.input} value={slug} />
          <TextInput onChangeText={setTitle} placeholder="Category title" placeholderTextColor={colors.placeholder} style={styles.input} value={title} />
          <TextInput onChangeText={setOpensAt} placeholder="Opens at (optional, YYYY-MM-DD HH:MM)" placeholderTextColor={colors.placeholder} style={styles.input} value={opensAt} />
          <TextInput onChangeText={setClosesAt} placeholder="Closes at (optional, YYYY-MM-DD HH:MM)" placeholderTextColor={colors.placeholder} style={styles.input} value={closesAt} />
          <Pressable accessibilityRole="button" disabled={saving || !slug.trim() || !title.trim()} onPress={() => void createAward()} style={[styles.button, (saving || !slug.trim() || !title.trim()) && styles.disabled]}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create category</Text>}
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Categories</Text>
        {loading ? <ActivityIndicator color={colors.primary} /> : awards.length === 0 ? (
          <View style={styles.card}><Text style={styles.muted}>No voting categories are configured.</Text></View>
        ) : awards.map((award) => (
          <Pressable key={award.id} accessibilityRole="button" onPress={() => setSelectedAward(award.id)} style={[styles.card, selectedAward === award.id && styles.selectedCard]}>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>{award.title}</Text>
              <Text style={[styles.status, award.status === "on" ? styles.activeStatus : styles.inactiveStatus]}>{award.status === "on" ? "Open" : "Closed"}</Text>
            </View>
            <Text style={styles.muted}>/{award.slug} · {award.nominee_count} nominees · {award.vote_count} votes</Text>
            {award.opens_at || award.closes_at ? <Text style={styles.muted}>Voting: {award.opens_at || "Any time"} – {award.closes_at || "No close date"}</Text> : null}
            <View style={styles.actions}>
              <Pressable accessibilityRole="button" disabled={saving} onPress={() => void mutate("toggle_award", { award_id: award.id, new_status: award.status === "on" ? "off" : "on" })} style={styles.action}><Text style={styles.actionText}>{award.status === "on" ? "Close voting" : "Open voting"}</Text></Pressable>
              <Pressable accessibilityRole="button" disabled={saving} onPress={() => confirmDeleteAward(award)} style={styles.deleteAction}><Text style={styles.deleteText}>Delete category</Text></Pressable>
            </View>
          </Pressable>
        ))}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add nominee</Text>
          {awards.length === 0 ? <Text style={styles.muted}>Create a category first.</Text> : (
            <>
              <View style={styles.chips}>
                {awards.map((award) => (
                  <Pressable key={award.id} onPress={() => setSelectedAward(award.id)} style={[styles.chip, selectedAward === award.id && styles.selectedChip]}>
                    <Text style={[styles.chipText, selectedAward === award.id && styles.selectedChipText]}>{award.title}</Text>
                  </Pressable>
                ))}
              </View>
              <TextInput onChangeText={setNomineeName} placeholder="Nominee name" placeholderTextColor={colors.placeholder} style={styles.input} value={nomineeName} maxLength={255} />
              <TextInput multiline onChangeText={setDescription} placeholder="Description" placeholderTextColor={colors.placeholder} style={[styles.input, styles.textArea]} textAlignVertical="top" value={description} />
              <TextInput autoCapitalize="none" keyboardType="url" onChangeText={setPhotoUrl} placeholder="Photo URL (optional)" placeholderTextColor={colors.placeholder} style={styles.input} value={photoUrl} />
              <Pressable accessibilityRole="button" disabled={saving} onPress={() => void chooseNomineePhoto()} style={styles.secondary}>
                <Text style={styles.actionText}>{nomineePhoto ? "Choose a different photo" : "Choose photo from device"}</Text>
              </Pressable>
              {nomineePhoto ? (
                <View style={styles.photoPreview}>
                  <Image source={{ uri: nomineePhoto.uri }} style={styles.nomineeImage} />
                  <View style={styles.photoInfo}>
                    <Text numberOfLines={1} style={styles.muted}>{nomineePhoto.name}</Text>
                    <Pressable accessibilityRole="button" onPress={() => setNomineePhoto(null)}><Text style={styles.deleteText}>Remove photo</Text></Pressable>
                  </View>
                </View>
              ) : null}
              <Pressable accessibilityRole="button" disabled={saving || !selectedAward || !nomineeName.trim()} onPress={() => void addNominee()} style={[styles.button, (saving || !selectedAward || !nomineeName.trim()) && styles.disabled]}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Add nominee</Text>}
              </Pressable>
            </>
          )}
        </View>

        <Text style={styles.sectionTitle}>Nominees {selectedAward ? `(${visibleNominees.length})` : ""}</Text>
        {visibleNominees.length === 0 ? (
          <View style={styles.card}><Text style={styles.muted}>Select a category with nominees to see them here.</Text></View>
        ) : visibleNominees.map((nominee) => (
          <View key={nominee.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>{nominee.name}</Text>
              <Text style={styles.voteCount}>{nominee.votes} votes</Text>
            </View>
            {nominee.description ? <Text style={styles.body}>{nominee.description}</Text> : null}
            {nominee.photo_url ? <Text numberOfLines={2} style={styles.link}>{nominee.photo_url}</Text> : null}
            <Pressable accessibilityRole="button" disabled={saving} onPress={() => confirmDeleteNominee(nominee)} style={styles.deleteAction}><Text style={styles.deleteText}>Delete nominee</Text></Pressable>
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
  selectedCard: { borderColor: colors.primary, borderWidth: 2 },
  cardTitle: { color: colors.text, flex: 1, fontSize: 15, fontWeight: "800" },
  input: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, marginTop: 10, paddingHorizontal: 12, paddingVertical: 11 },
  textArea: { height: 82 },
  button: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 10, justifyContent: "center", minHeight: 44, marginTop: 14 },
  buttonText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  disabled: { opacity: 0.55 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: "800", marginBottom: 7, marginTop: 13 },
  row: { alignItems: "center", flexDirection: "row", gap: 8 },
  status: { borderRadius: 10, fontSize: 10, fontWeight: "800", overflow: "hidden", paddingHorizontal: 8, paddingVertical: 5 },
  activeStatus: { backgroundColor: "#e8f5e9", color: colors.primary },
  inactiveStatus: { backgroundColor: "#f1f2f4", color: colors.muted },
  muted: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  actions: { borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", gap: 8, marginTop: 12, paddingTop: 10 },
  action: { backgroundColor: "#f1f7f1", borderRadius: 8, paddingHorizontal: 11, paddingVertical: 8 },
  actionText: { color: colors.primary, fontSize: 11, fontWeight: "800" },
  deleteAction: { alignSelf: "flex-start", backgroundColor: "#fff1f0", borderRadius: 8, marginTop: 10, paddingHorizontal: 11, paddingVertical: 8 },
  deleteText: { color: colors.danger, fontSize: 11, fontWeight: "800" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 10 },
  chip: { borderColor: colors.border, borderRadius: 16, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7 },
  selectedChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.muted, fontSize: 11 },
  selectedChipText: { color: "#fff", fontWeight: "800" },
  secondary: { alignSelf: "flex-start", backgroundColor: "#f1f7f1", borderRadius: 8, marginTop: 9, paddingHorizontal: 11, paddingVertical: 8 },
  photoPreview: { alignItems: "center", flexDirection: "row", gap: 10, marginTop: 10 },
  nomineeImage: { backgroundColor: colors.border, borderRadius: 8, height: 64, width: 64 },
  photoInfo: { flex: 1 },
  voteCount: { color: colors.primary, fontSize: 11, fontWeight: "900" },
  body: { color: colors.text, fontSize: 13, lineHeight: 19, marginTop: 8 },
  link: { color: colors.primary, fontSize: 11, marginTop: 7 },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginBottom: 12, overflow: "hidden", padding: 12 },
  success: { backgroundColor: "#eaf7eb", borderRadius: 10, color: colors.primary, lineHeight: 20, marginBottom: 12, overflow: "hidden", padding: 12 },
})
