import { Redirect, router } from "expo-router"
import { useState } from "react"
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput } from "react-native"
import { useAdmin } from "@/contexts/AdminContext"
import { colors } from "@/theme"

export default function AdminLoginScreen() {
  const { admin, loading, error: setupError, login } = useAdmin()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (admin) return <Redirect href="/admin" />

  const submit = async () => {
    setError("")
    if (!username.trim() || !password) {
      setError("Enter your administrator username and password.")
      return
    }
    setSubmitting(true)
    try {
      await login(username.trim(), password)
      router.replace("/admin")
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Administrator sign-in failed.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>SQUARED ENTERPRISE</Text>
        <Text style={styles.heading}>Administrator sign in</Text>
        <Text style={styles.subtitle}>Access administration tools with your existing account.</Text>
        {error || setupError ? <Text accessibilityRole="alert" style={styles.error}>{error || setupError}</Text> : null}
        <Text style={styles.label}>USERNAME</Text>
        <TextInput autoCapitalize="none" autoCorrect={false} editable={!loading && !submitting} onChangeText={setUsername} placeholder="Administrator username" placeholderTextColor={colors.placeholder} style={styles.input} value={username} />
        <Text style={styles.label}>PASSWORD</Text>
        <TextInput autoCapitalize="none" editable={!loading && !submitting} onChangeText={setPassword} onSubmitEditing={() => void submit()} placeholder="Password" placeholderTextColor={colors.placeholder} returnKeyType="go" secureTextEntry style={styles.input} value={password} />
        <Pressable accessibilityRole="button" disabled={loading || submitting} onPress={() => void submit()} style={[styles.button, (loading || submitting) && styles.disabled]}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  content: { flexGrow: 1, justifyContent: "center", padding: 24 },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: "900", letterSpacing: 1.5, textAlign: "center" },
  heading: { color: colors.text, fontSize: 26, fontWeight: "900", marginTop: 10, textAlign: "center" },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21, marginBottom: 18, marginTop: 8, textAlign: "center" },
  label: { color: colors.text, fontSize: 11, fontWeight: "800", marginBottom: 7, marginTop: 14 },
  input: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 11, borderWidth: 1, color: colors.text, paddingHorizontal: 13, paddingVertical: 13 },
  button: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 11, justifyContent: "center", minHeight: 48, marginTop: 20 },
  buttonText: { color: "#fff", fontWeight: "800" },
  disabled: { opacity: 0.55 },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginBottom: 10, overflow: "hidden", padding: 12 },
})
