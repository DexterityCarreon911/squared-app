import { Redirect, router } from "expo-router"
import { useState } from "react"
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput } from "react-native"
import { useInstructor } from "@/contexts/InstructorContext"
import { colors } from "@/theme"

export default function InstructorLoginScreen() {
  const { instructor, loading, error: setupError, login } = useInstructor()
  const [instructorId, setInstructorId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (instructor) return <Redirect href="/instructor" />

  const submit = async () => {
    setError("")
    if (!instructorId.trim() || !password) {
      setError("Enter your instructor ID and password.")
      return
    }
    setSubmitting(true)
    try {
      await login(instructorId.trim(), password)
      router.replace("/instructor")
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>SQUARED NSTP</Text>
        <Text style={styles.heading}>Instructor sign in</Text>
        <Text style={styles.subtitle}>Attendance, subjects, evaluations, and reporting.</Text>
        {setupError || error ? <Text accessibilityRole="alert" style={styles.error}>{error || setupError}</Text> : null}
        <Text style={styles.label}>INSTRUCTOR ID</Text>
        <TextInput autoCapitalize="none" autoCorrect={false} editable={!loading && !submitting} onChangeText={setInstructorId} placeholder="e.g. INST-001" placeholderTextColor={colors.placeholder} style={styles.input} value={instructorId} />
        <Text style={styles.label}>PASSWORD</Text>
        <TextInput autoCapitalize="none" editable={!loading && !submitting} onChangeText={setPassword} onSubmitEditing={() => void submit()} placeholder="Enter your password" placeholderTextColor={colors.placeholder} returnKeyType="go" secureTextEntry style={styles.input} value={password} />
        <Pressable accessibilityRole="button" disabled={loading || submitting} onPress={() => void submit()} style={[styles.button, (loading || submitting) && styles.disabled]}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
        </Pressable>
        <Text style={styles.note}>Instructor accounts are provisioned by the NSTP administrator.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  content: { flexGrow: 1, justifyContent: "center", padding: 24 },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: "900", letterSpacing: 1.5, textAlign: "center" },
  heading: { color: colors.text, fontSize: 27, fontWeight: "900", marginTop: 10, textAlign: "center" },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21, marginBottom: 20, marginTop: 8, textAlign: "center" },
  label: { color: colors.text, fontSize: 11, fontWeight: "800", marginBottom: 7, marginTop: 14 },
  input: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 11, borderWidth: 1, color: colors.text, paddingHorizontal: 13, paddingVertical: 13 },
  button: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 11, justifyContent: "center", minHeight: 48, marginTop: 20 },
  buttonText: { color: "#fff", fontWeight: "800" },
  disabled: { opacity: 0.55 },
  note: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 16, textAlign: "center" },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginBottom: 10, overflow: "hidden", padding: 12 },
})
