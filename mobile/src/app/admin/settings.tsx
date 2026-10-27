import { Redirect } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native"
import AdminNavigation from "@/components/AdminNavigation"
import { useAdmin } from "@/contexts/AdminContext"
import { api, type AdminPaymentSettings } from "@/services/api"
import { colors } from "@/theme"

const semesters: AdminPaymentSettings["current_semester"][] = ["1st", "2nd", "Summer"]

export default function AdminSettingsScreen() {
  const { admin, csrfToken, loading: authLoading } = useAdmin()
  const [settings, setSettings] = useState<AdminPaymentSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingSection, setSavingSection] = useState<"membership" | "aurora_night" | null>(null)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  useEffect(() => {
    if (!admin) return
    let active = true
    api.getAdminPaymentSettings()
      .then((result) => { if (active) setSettings(result) })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load payment settings.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [admin])

  if (authLoading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
  if (!admin) return <Redirect href="/admin/login" />

  const update = <K extends keyof AdminPaymentSettings>(key: K, value: AdminPaymentSettings[K]) => {
    setSettings((current) => current ? { ...current, [key]: value } : current)
  }

  const save = async (section: "membership" | "aurora_night") => {
    if (!settings || savingSection) return
    setError("")
    setNotice("")
    setSavingSection(section)
    try {
      const result = section === "membership"
        ? await api.saveAdminPaymentSettings("membership", {
        membership_fee_amount: settings.membership_fee_amount,
        current_academic_year: settings.current_academic_year,
        current_semester: settings.current_semester,
        }, csrfToken)
        : await api.saveAdminPaymentSettings("aurora_night", {
        aurora_night_fee_amount: settings.aurora_night_fee_amount,
        aurora_night_event_name: settings.aurora_night_event_name,
        aurora_night_active: settings.aurora_night_active,
        }, csrfToken)
      setNotice(result.message || "Settings saved.")
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save payment settings.")
    } finally {
      setSavingSection(null)
    }
  }

  return (
    <View style={styles.page}>
      <AdminNavigation />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Payment settings</Text>
        <Text style={styles.subtitle}>Configure membership and Aurora Night charges. Changes apply to new transactions only.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {notice ? <Text accessibilityRole="status" style={styles.success}>{notice}</Text> : null}
        {loading ? <ActivityIndicator color={colors.primary} /> : !settings ? (
          <View style={styles.card}><Text style={styles.muted}>Payment settings could not be loaded.</Text></View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Membership configuration</Text>
              <Text style={styles.label}>MEMBERSHIP FEE (PHP)</Text>
              <TextInput keyboardType="decimal-pad" onChangeText={(value) => update("membership_fee_amount", value)} placeholder="50.00" placeholderTextColor={colors.placeholder} style={styles.input} value={settings.membership_fee_amount} />
              <Text style={styles.label}>ACADEMIC YEAR</Text>
              <TextInput onChangeText={(value) => update("current_academic_year", value)} placeholder="2025-2026" placeholderTextColor={colors.placeholder} style={styles.input} value={settings.current_academic_year} />
              <Text style={styles.label}>CURRENT SEMESTER</Text>
              <View style={styles.options}>
                {semesters.map((semester) => (
                  <Pressable key={semester} accessibilityRole="button" onPress={() => update("current_semester", semester)} style={[styles.option, settings.current_semester === semester && styles.selectedOption]}>
                    <Text style={[styles.optionText, settings.current_semester === semester && styles.selectedOptionText]}>{semester}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable accessibilityRole="button" disabled={savingSection !== null} onPress={() => void save("membership")} style={[styles.button, savingSection !== null && styles.disabled]}>
                {savingSection === "membership" ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save membership settings</Text>}
              </Pressable>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Aurora Night configuration</Text>
              <Text style={styles.label}>REGISTRATION FEE (PHP)</Text>
              <TextInput keyboardType="decimal-pad" onChangeText={(value) => update("aurora_night_fee_amount", value)} placeholder="100.00" placeholderTextColor={colors.placeholder} style={styles.input} value={settings.aurora_night_fee_amount} />
              <Text style={styles.label}>EVENT NAME</Text>
              <TextInput onChangeText={(value) => update("aurora_night_event_name", value)} placeholder="Aurora Night" placeholderTextColor={colors.placeholder} style={styles.input} value={settings.aurora_night_event_name} maxLength={255} />
              <View style={styles.switchRow}>
                <View style={styles.switchCopy}>
                  <Text style={styles.switchTitle}>Accept Aurora Night registrations</Text>
                  <Text style={styles.muted}>Turn off to block new registration payments.</Text>
                </View>
                <Switch
                  onValueChange={(active) => update("aurora_night_active", active ? "1" : "0")}
                  trackColor={{ false: colors.border, true: "#9bd29d" }}
                  thumbColor={settings.aurora_night_active === "1" ? colors.primary : "#f4f3f4"}
                  value={settings.aurora_night_active === "1"}
                />
              </View>
              <Pressable accessibilityRole="button" disabled={savingSection !== null} onPress={() => void save("aurora_night")} style={[styles.button, savingSection !== null && styles.disabled]}>
                {savingSection === "aurora_night" ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Aurora Night settings</Text>}
              </Pressable>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Existing records stay unchanged</Text>
              <Text style={styles.muted}>These settings affect new transactions. Previous payments keep the academic period and amount recorded on their receipts.</Text>
            </View>
          </>
        )}
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
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 13, borderWidth: 1, marginBottom: 12, padding: 15 },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: "900" },
  label: { color: colors.muted, fontSize: 10, fontWeight: "900", marginTop: 14 },
  input: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, marginTop: 7, paddingHorizontal: 12, paddingVertical: 11 },
  options: { flexDirection: "row", gap: 8, marginTop: 8 },
  option: { borderColor: colors.border, borderRadius: 9, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  selectedOption: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { color: colors.muted, fontSize: 11, fontWeight: "700" },
  selectedOptionText: { color: "#fff" },
  button: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 10, justifyContent: "center", minHeight: 44, marginTop: 17 },
  buttonText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  disabled: { opacity: 0.55 },
  switchRow: { alignItems: "center", flexDirection: "row", gap: 9, marginTop: 16 },
  switchCopy: { flex: 1 },
  switchTitle: { color: colors.text, fontSize: 12, fontWeight: "800" },
  muted: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  infoCard: { backgroundColor: "#f1f7f1", borderRadius: 12, marginTop: 2, padding: 14 },
  infoTitle: { color: colors.primary, fontSize: 13, fontWeight: "900" },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginBottom: 12, overflow: "hidden", padding: 12 },
  success: { backgroundColor: "#eaf7eb", borderRadius: 10, color: colors.primary, lineHeight: 20, marginBottom: 12, overflow: "hidden", padding: 12 },
})
