import { CameraView, useCameraPermissions } from "expo-camera"
import { Redirect } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native"
import AdminNavigation from "@/components/AdminNavigation"
import { useAdmin } from "@/contexts/AdminContext"
import { api, type AdminQRQuestRegistration, type AdminQRQuestSettings } from "@/services/api"
import { colors } from "@/theme"

export default function AdminQRQuestScreen() {
  const { admin, csrfToken, loading: authLoading } = useAdmin()
  const [permission, requestPermission] = useCameraPermissions()
  const [registrations, setRegistrations] = useState<AdminQRQuestRegistration[]>([])
  const [settings, setSettings] = useState<AdminQRQuestSettings | null>(null)
  const [stats, setStats] = useState({ registered: 0, scans: 0, players: 0 })
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState("")
  const [studentId, setStudentId] = useState("")
  const [eventName, setEventName] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const loadData = useCallback(async (nextPage: number, nextSearch: string, refresh = false) => {
    if (refresh) setRefreshing(true)
    else setLoading(true)
    setError("")
    try {
      const result = await api.getAdminQRQuest(nextPage, nextSearch)
      setRegistrations(result.registrations)
      setPage(result.page)
      setPages(result.pages)
      setStats(result.stats)
      setSettings(result.settings)
      setEventName(result.settings.event_name)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load QR Quest management.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (!admin) return
    let active = true
    api.getAdminQRQuest(1, "")
      .then((result) => {
        if (!active) return
        setRegistrations(result.registrations)
        setPage(result.page)
        setPages(result.pages)
        setStats(result.stats)
        setSettings(result.settings)
        setEventName(result.settings.event_name)
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load QR Quest management.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [admin])

  if (authLoading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
  if (!admin) return <Redirect href="/admin/login" />

  const update = async (action: "register" | "cancel" | "save_settings", fields: Record<string, string | number>) => {
    setSaving(true)
    setError("")
    setNotice("")
    try {
      const result = await api.updateAdminQRQuest(action, fields, csrfToken)
      setNotice(result.message || "QR Quest updated.")
      await loadData(page, search, true)
      return true
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not update QR Quest.")
      return false
    } finally {
      setSaving(false)
    }
  }

  const register = async (value: string) => {
    const id = value.trim()
    if (!id || saving) return
    const saved = await update("register", { student_id: id })
    if (saved) setStudentId("")
  }

  const openScanner = async () => {
    setError("")
    setNotice("")
    if (!permission?.granted) {
      const result = await requestPermission()
      if (!result.granted) {
        setError("Camera permission is required to scan a student QR code.")
        return
      }
    }
    setScanned(false)
    setScanning(true)
  }

  const confirmCancel = (registration: AdminQRQuestRegistration) => {
    Alert.alert("Cancel QR Quest registration?", `Cancel the registration for ${registration.student_name || registration.student_id}?`, [
      { text: "Keep registration", style: "cancel" },
      {
        text: "Cancel registration",
        style: "destructive",
        onPress: () => void update("cancel", { registration_id: registration.id }),
      },
    ])
  }

  const saveSettings = async () => {
    if (!eventName.trim() || !settings) return
    await update("save_settings", { event_name: eventName.trim(), active: settings.active ? 1 : 0 })
  }

  const confirmClearAll = () => {
    if (saving) return
    Alert.alert(
      "Clear all QR Quest data?",
      "This permanently deletes every QR Quest scan and registration. This cannot be undone.",
      [
        { text: "Keep data", style: "cancel" },
        {
          text: "Delete all data",
          style: "destructive",
          onPress: () => {
            setSaving(true)
            setError("")
            setNotice("")
            void api.clearAdminQRQuest(csrfToken)
              .then((result) => {
                setNotice(result.message || "QR Quest data cleared.")
                setPage(1)
                setSearch("")
                setSearchInput("")
                return loadData(1, "")
              })
              .catch((clearError: unknown) => {
                setError(clearError instanceof Error ? clearError.message : "Could not clear QR Quest data.")
              })
              .finally(() => setSaving(false))
          },
        },
      ],
    )
  }

  return (
    <View style={styles.page}>
      <AdminNavigation />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadData(page, search, true)} tintColor={colors.primary} />}
      >
        <Text style={styles.heading}>QR Quest management</Text>
        <Text style={styles.subtitle}>Manage QR Quest access, free registrations, and event availability.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {notice ? <Text accessibilityRole="status" style={styles.success}>{notice}</Text> : null}

        <View style={styles.stats}>
          <View style={styles.stat}><Text style={styles.statValue}>{stats.registered}</Text><Text style={styles.muted}>Registered</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>{stats.scans}</Text><Text style={styles.muted}>Scans</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>{stats.players}</Text><Text style={styles.muted}>Players</Text></View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Event settings</Text>
          <TextInput onChangeText={setEventName} placeholder="QR Quest event name" placeholderTextColor={colors.placeholder} style={styles.input} value={eventName} maxLength={255} />
          <View style={styles.settingRow}>
            <Text style={styles.label}>QR Quest is active</Text>
            <Switch
              accessibilityLabel="QR Quest active"
              disabled={!settings || saving}
              onValueChange={(active) => setSettings((current) => current ? { ...current, active } : current)}
              value={settings?.active || false}
              trackColor={{ true: colors.primary }}
            />
          </View>
          <Pressable accessibilityRole="button" disabled={saving || !eventName.trim()} onPress={() => void saveSettings()} style={[styles.button, (saving || !eventName.trim()) && styles.disabled]}>
            <Text style={styles.buttonText}>{saving ? "Saving…" : "Save settings"}</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Danger zone</Text>
          <Text style={styles.muted}>Permanently delete all QR Quest registrations and scan history.</Text>
          <Pressable
            accessibilityRole="button"
            disabled={saving}
            onPress={confirmClearAll}
            style={[styles.dangerButton, saving && styles.disabled]}
          >
            <Text style={styles.deleteText}>{saving ? "Please wait…" : "Clear all registrations and scans"}</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Register a free participant</Text>
          {scanning ? (
            <>
              <CameraView
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={scanned ? undefined : ({ data }) => {
                  setScanned(true)
                  setScanning(false)
                  setStudentId(data)
                  void register(data)
                }}
                style={styles.camera}
              />
              <Pressable onPress={() => setScanning(false)} style={styles.secondary}><Text style={styles.secondaryText}>Close scanner</Text></Pressable>
            </>
          ) : (
            <Pressable accessibilityRole="button" disabled={saving} onPress={() => void openScanner()} style={styles.secondary}>
              <Text style={styles.secondaryText}>{permission?.granted ? "Scan student QR code" : "Allow camera and scan"}</Text>
            </Pressable>
          )}
          <Text style={styles.label}>OR ENTER STUDENT ID</Text>
          <View style={styles.formRow}>
            <TextInput autoCapitalize="characters" autoCorrect={false} editable={!saving} maxLength={15} onChangeText={setStudentId} onSubmitEditing={() => void register(studentId)} placeholder="Student ID" placeholderTextColor={colors.placeholder} style={[styles.input, styles.flex]} value={studentId} />
            <Pressable accessibilityRole="button" disabled={saving || !studentId.trim()} onPress={() => void register(studentId)} style={[styles.button, styles.registerButton, (saving || !studentId.trim()) && styles.disabled]}>
              <Text style={styles.buttonText}>{saving ? "…" : "Register"}</Text>
            </Pressable>
          </View>
          <Text style={styles.muted}>Registration is free and requires an existing student record.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Registrations ({stats.registered})</Text>
          <View style={styles.formRow}>
            <TextInput autoCapitalize="none" onChangeText={setSearchInput} onSubmitEditing={() => { setSearch(searchInput.trim()); void loadData(1, searchInput.trim()) }} placeholder="Search student ID or name" placeholderTextColor={colors.placeholder} style={[styles.input, styles.flex]} value={searchInput} />
            <Pressable accessibilityRole="button" onPress={() => { setSearch(searchInput.trim()); void loadData(1, searchInput.trim()) }} style={[styles.button, styles.searchButton]}><Text style={styles.buttonText}>Search</Text></Pressable>
          </View>
          {loading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : registrations.length === 0 ? (
            <Text style={styles.muted}>No registrations match this search.</Text>
          ) : registrations.map((registration) => (
            <View key={registration.id} style={styles.registration}>
              <View style={styles.flex}>
                <Text style={styles.name}>{registration.student_name || registration.student_id}</Text>
                <Text style={styles.muted}>{registration.student_id} · {registration.program || "No program"}</Text>
                <Text style={styles.muted}>{registration.payment_status} · {registration.payment_method || "—"}</Text>
              </View>
              {["paid", "free"].includes(registration.payment_status) ? (
                <Pressable accessibilityRole="button" disabled={saving} onPress={() => confirmCancel(registration)} style={styles.deleteAction}><Text style={styles.deleteText}>Cancel</Text></Pressable>
              ) : null}
            </View>
          ))}
          <View style={styles.pagination}>
            <Pressable accessibilityRole="button" disabled={page <= 1 || loading} onPress={() => void loadData(page - 1, search)} style={[styles.secondary, (page <= 1 || loading) && styles.disabled]}><Text style={styles.secondaryText}>Previous</Text></Pressable>
            <Text style={styles.muted}>Page {page} of {pages}</Text>
            <Pressable accessibilityRole="button" disabled={page >= pages || loading} onPress={() => void loadData(page + 1, search)} style={[styles.secondary, (page >= pages || loading) && styles.disabled]}><Text style={styles.secondaryText}>Next</Text></Pressable>
          </View>
        </View>
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
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 13, borderWidth: 1, marginBottom: 12, padding: 14 },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: "800" },
  stats: { flexDirection: "row", gap: 8, marginBottom: 12 },
  stat: { alignItems: "center", backgroundColor: "#e8f5e9", borderRadius: 11, flex: 1, padding: 10 },
  statValue: { color: colors.primary, fontSize: 20, fontWeight: "900" },
  input: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, marginTop: 10, paddingHorizontal: 12, paddingVertical: 11 },
  flex: { flex: 1 },
  settingRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  label: { color: colors.muted, fontSize: 10, fontWeight: "800", marginTop: 12 },
  formRow: { alignItems: "center", flexDirection: "row", gap: 8 },
  button: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 9, justifyContent: "center", minHeight: 43, marginTop: 12, paddingHorizontal: 14 },
  registerButton: { minWidth: 90 },
  searchButton: { minWidth: 70 },
  buttonText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  secondary: { alignItems: "center", alignSelf: "flex-start", backgroundColor: "#f1f7f1", borderRadius: 9, marginTop: 10, paddingHorizontal: 12, paddingVertical: 9 },
  secondaryText: { color: colors.primary, fontSize: 11, fontWeight: "800" },
  disabled: { opacity: 0.5 },
  camera: { height: 280, marginTop: 10, overflow: "hidden", width: "100%" },
  muted: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 5 },
  registration: { alignItems: "center", borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", gap: 8, paddingVertical: 10 },
  name: { color: colors.text, fontSize: 13, fontWeight: "800" },
  deleteAction: { backgroundColor: "#fff1f0", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  dangerButton: { alignItems: "center", alignSelf: "flex-start", backgroundColor: "#fff1f0", borderRadius: 9, marginTop: 10, paddingHorizontal: 12, paddingVertical: 10 },
  deleteText: { color: colors.danger, fontSize: 11, fontWeight: "800" },
  pagination: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  loading: { marginVertical: 18 },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginBottom: 12, overflow: "hidden", padding: 12 },
  success: { backgroundColor: "#eaf7eb", borderRadius: 10, color: colors.primary, lineHeight: 20, marginBottom: 12, overflow: "hidden", padding: 12 },
})
