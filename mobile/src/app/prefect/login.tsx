import { Redirect, router } from "expo-router"
import { useState } from "react"
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput } from "react-native"
import { usePrefect } from "@/contexts/PrefectContext"

export default function PrefectLoginScreen() {
  const { user, loading, error: setupError, login } = usePrefect()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Redirect href="/prefect/incidents" />

  const submit = async () => {
    if (!username.trim() || !password) {
      setError("Enter your username and password.")
      return
    }
    setError("")
    setSubmitting(true)
    try {
      await login(username.trim(), password)
      router.replace("/prefect/incidents")
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>PREFECT OF DISCIPLINE</Text>
        <Text style={styles.heading}>Sign in</Text>
        <Text style={styles.subtitle}>Use your existing prefect administrator account.</Text>
        {error || setupError ? <Text accessibilityRole="alert" style={styles.error}>{error || setupError}</Text> : null}
        <Text style={styles.label}>USERNAME</Text>
        <TextInput autoCapitalize="none" autoCorrect={false} editable={!loading && !submitting} onChangeText={setUsername} placeholder="Username" placeholderTextColor="#94a3b8" style={styles.input} value={username} />
        <Text style={styles.label}>PASSWORD</Text>
        <TextInput autoCapitalize="none" editable={!loading && !submitting} onChangeText={setPassword} onSubmitEditing={() => void submit()} placeholder="Password" placeholderTextColor="#94a3b8" returnKeyType="go" secureTextEntry style={styles.input} value={password} />
        <Pressable accessibilityRole="button" disabled={loading || submitting} onPress={() => void submit()} style={[styles.button, (loading || submitting) && styles.disabled]}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#f8fafc", flex: 1 },
  content: { flexGrow: 1, justifyContent: "center", padding: 24 },
  eyebrow: { color: "#92400e", fontSize: 11, fontWeight: "900", letterSpacing: 1.6, textAlign: "center" },
  heading: { color: "#0f172a", fontSize: 28, fontWeight: "900", marginTop: 10, textAlign: "center" },
  subtitle: { color: "#64748b", fontSize: 14, lineHeight: 21, marginBottom: 18, marginTop: 8, textAlign: "center" },
  label: { color: "#334155", fontSize: 11, fontWeight: "800", marginBottom: 7, marginTop: 14 },
  input: { backgroundColor: "#fff", borderColor: "#cbd5e1", borderRadius: 10, borderWidth: 1, color: "#0f172a", paddingHorizontal: 13, paddingVertical: 13 },
  button: { alignItems: "center", backgroundColor: "#92400e", borderRadius: 10, justifyContent: "center", minHeight: 48, marginTop: 20 },
  buttonText: { color: "#fff", fontWeight: "800" },
  disabled: { opacity: 0.55 },
  error: { backgroundColor: "#fef2f2", borderRadius: 9, color: "#991b1b", lineHeight: 20, marginBottom: 10, overflow: "hidden", padding: 12 },
})
