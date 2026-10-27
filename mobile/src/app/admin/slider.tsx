import * as ImagePicker from "expo-image-picker"
import { Redirect } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, Alert, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import AdminNavigation from "@/components/AdminNavigation"
import { useAdmin } from "@/contexts/AdminContext"
import { API_BASE_URL, api, type AdminSliderImage } from "@/services/api"
import { colors } from "@/theme"

export default function AdminSliderScreen() {
  const { admin, csrfToken, loading: authLoading } = useAdmin()
  const [images, setImages] = useState<AdminSliderImage[]>([])
  const [orders, setOrders] = useState<Record<number, string>>({})
  const [displayOrder, setDisplayOrder] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const loadImages = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true)
    else setLoading(true)
    setError("")
    try {
      const result = await api.getAdminSliderImages()
      setImages(result)
      setOrders(Object.fromEntries(result.map((image) => [image.id, String(image.display_order)])))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load slider images.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (!admin) return
    let active = true
    api.getAdminSliderImages()
      .then((result) => {
        if (!active) return
        setImages(result)
        setOrders(Object.fromEntries(result.map((image) => [image.id, String(image.display_order)])))
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load slider images.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [admin])

  if (authLoading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
  if (!admin) return <Redirect href="/admin/login" />

  const chooseImage = async () => {
    setError("")
    setNotice("")
    let result: ImagePicker.ImagePickerResult
    try {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.9,
      })
    } catch (pickerError) {
      setError(pickerError instanceof Error ? pickerError.message : "Could not open the image picker.")
      return
    }
    if (result.canceled || !result.assets[0]) return
    const asset = result.assets[0]
    const filename = asset.fileName || asset.uri.split(/[\\/]/).pop() || `slider-${Date.now()}.jpg`
    const parsedOrder = displayOrder.trim() === "" ? images.length : Number(displayOrder)
    if (!Number.isInteger(parsedOrder) || parsedOrder < 0) {
      setError("Display order must be a non-negative whole number.")
      return
    }
    setSaving(true)
    try {
      const response = await api.uploadAdminSliderImage(asset.uri, filename, parsedOrder, csrfToken)
      setNotice(response.message || "Slider image uploaded.")
      setDisplayOrder("")
      await loadImages(true)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not upload slider image.")
    } finally {
      setSaving(false)
    }
  }

  const saveOrder = async (image: AdminSliderImage) => {
    const order = Number(orders[image.id])
    if (!Number.isInteger(order) || order < 0) {
      setError("Display order must be a non-negative whole number.")
      return
    }
    setSaving(true)
    setError("")
    setNotice("")
    try {
      const response = await api.updateAdminSliderImage("set_order", { image_id: image.id, display_order: order }, csrfToken)
      setNotice(response.message || "Display order updated.")
      await loadImages(true)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not update display order.")
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = (image: AdminSliderImage) => {
    Alert.alert("Delete slider image?", "This removes the slider entry and deletes its managed upload.", [
      { text: "Keep image", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setSaving(true)
          setError("")
          setNotice("")
          void api.updateAdminSliderImage("delete", { image_id: image.id }, csrfToken)
            .then(async (response) => {
              setNotice(response.message || "Slider image deleted.")
              await loadImages(true)
            })
            .catch((deleteError: unknown) => setError(deleteError instanceof Error ? deleteError.message : "Could not delete slider image."))
            .finally(() => setSaving(false))
        },
      },
    ])
  }

  return (
    <View style={styles.page}>
      <AdminNavigation />
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadImages(true)} tintColor={colors.primary} />}>
        <Text style={styles.heading}>Welcome slider</Text>
        <Text style={styles.subtitle}>Upload and order images used in the public welcome carousel. Images are limited to 8 MB.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {notice ? <Text accessibilityRole="status" style={styles.success}>{notice}</Text> : null}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add an image</Text>
          <TextInput keyboardType="number-pad" onChangeText={setDisplayOrder} placeholder={`Display order (default ${images.length})`} placeholderTextColor={colors.placeholder} style={styles.input} value={displayOrder} />
          <Pressable accessibilityRole="button" disabled={saving} onPress={() => void chooseImage()} style={[styles.button, saving && styles.disabled]}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Choose and upload image</Text>}
          </Pressable>
        </View>
        <Text style={styles.sectionTitle}>Current images ({images.length})</Text>
        {loading ? <ActivityIndicator color={colors.primary} /> : images.length === 0 ? (
          <View style={styles.card}><Text style={styles.muted}>No slider images have been added.</Text></View>
        ) : images.map((image) => (
          <View key={image.id} style={styles.card}>
            <Image source={{ uri: `${API_BASE_URL}${image.public_url}` }} style={styles.preview} resizeMode="cover" />
            <Text numberOfLines={2} style={styles.muted}>{image.image_url}</Text>
            <View style={styles.orderRow}>
              <TextInput keyboardType="number-pad" onChangeText={(value) => setOrders((current) => ({ ...current, [image.id]: value }))} style={[styles.input, styles.orderInput]} value={orders[image.id] ?? String(image.display_order)} />
              <Pressable accessibilityRole="button" disabled={saving} onPress={() => void saveOrder(image)} style={[styles.secondary, saving && styles.disabled]}><Text style={styles.secondaryText}>Save order</Text></Pressable>
              <Pressable accessibilityRole="button" disabled={saving} onPress={() => confirmDelete(image)} style={[styles.deleteAction, saving && styles.disabled]}><Text style={styles.deleteText}>Delete</Text></Pressable>
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
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginBottom: 14, marginTop: 6 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 13, borderWidth: 1, marginBottom: 11, padding: 14 },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: "800" },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: "800", marginBottom: 8, marginTop: 8 },
  input: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, marginTop: 10, paddingHorizontal: 12, paddingVertical: 11 },
  button: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 9, justifyContent: "center", minHeight: 44, marginTop: 12 },
  buttonText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  disabled: { opacity: 0.5 },
  preview: { backgroundColor: colors.border, borderRadius: 9, height: 185, width: "100%" },
  muted: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 6 },
  orderRow: { alignItems: "center", flexDirection: "row", gap: 6 },
  orderInput: { flex: 1, minWidth: 55 },
  secondary: { backgroundColor: "#f1f7f1", borderRadius: 8, marginTop: 10, paddingHorizontal: 10, paddingVertical: 9 },
  secondaryText: { color: colors.primary, fontSize: 10, fontWeight: "800" },
  deleteAction: { backgroundColor: "#fff1f0", borderRadius: 8, marginTop: 10, paddingHorizontal: 10, paddingVertical: 9 },
  deleteText: { color: colors.danger, fontSize: 10, fontWeight: "800" },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginBottom: 12, overflow: "hidden", padding: 12 },
  success: { backgroundColor: "#eaf7eb", borderRadius: 10, color: colors.primary, lineHeight: 20, marginBottom: 12, overflow: "hidden", padding: 12 },
})
