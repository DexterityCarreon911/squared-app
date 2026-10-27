import { Link } from "expo-router"
import { useState } from "react"
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native"
import { api } from "@/services/api"
import { colors } from "@/theme"

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const submit = async () => {
    setError("")
    setLoading(true)
    try {
      await api.requestPasswordReset(email.trim(), await api.getCsrfToken())
      setSuccess(true)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not request a password reset.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.page}>
      <Text style={styles.brand}>SQUARED</Text>
      <View style={styles.card}>
        <Text style={styles.heading}>Reset password</Text>
        <Text style={styles.subtitle}>Enter your student account email and we’ll send a reset link if the account exists.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {success ? (
          <Text accessibilityRole="status" style={styles.success}>
            If an account with that email exists, a password reset link has been sent.
          </Text>
        ) : (
          <>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={colors.placeholder}
              style={styles.input}
              value={email}
            />
            <Pressable accessibilityRole="button" disabled={!email.trim() || loading} onPress={() => void submit()} style={[styles.button, (!email.trim() || loading) && styles.disabled]}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send reset link</Text>}
            </Pressable>
          </>
        )}
        <Link href="/login" style={styles.link}>Back to sign in</Link>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  page: { alignItems: "center", backgroundColor: colors.background, flex: 1, justifyContent: "center", padding: 22 },
  brand: { color: colors.primary, fontSize: 13, fontWeight: "900", letterSpacing: 2, marginBottom: 14 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 18, borderWidth: 1, padding: 20, width: "100%" },
  heading: { color: colors.text, fontSize: 23, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8 },
  label: { color: colors.text, fontSize: 11, fontWeight: "800", marginTop: 18 },
  input: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 11, borderWidth: 1, color: colors.text, marginTop: 8, paddingHorizontal: 13, paddingVertical: 13 },
  button: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 11, justifyContent: "center", minHeight: 48, marginTop: 16 },
  buttonText: { color: "#fff", fontWeight: "800" },
  disabled: { opacity: 0.55 },
  link: { alignSelf: "center", color: colors.primary, fontSize: 13, fontWeight: "800", marginTop: 18 },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginTop: 14, overflow: "hidden", padding: 12 },
  success: { backgroundColor: "#eaf7eb", borderRadius: 10, color: colors.primary, lineHeight: 21, marginTop: 14, overflow: "hidden", padding: 12 },
})
