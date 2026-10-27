import { Link, Redirect } from "expo-router"
import { useState } from "react"
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native"
import { useAuth } from "@/contexts/useAuth"
import { colors } from "@/theme"

export default function LoginScreen() {
  const { student, authLoading, authError, loginStudent } = useAuth()
  const [studentId, setStudentId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (student) return <Redirect href="/(student)" />

  const handleSubmit = async () => {
    setError("")
    if (!studentId.trim() || !password) {
      setError("Enter your student ID and password.")
      return
    }

    setSubmitting(true)
    try {
      await loginStudent(studentId.trim(), password)
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Could not sign in. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Image accessibilityLabel="Squared logo" source={require("../../assets/images/squared-logo.png")} style={styles.brandMark} />
        <Text style={styles.brand}>Squared</Text>
        <Text style={styles.heading}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in with your student account.</Text>

        {(error || authError) ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {error || authError}
          </Text>
        ) : null}

        <Text style={styles.label}>Student ID</Text>
        <TextInput
          accessibilityLabel="Student ID"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!submitting && !authLoading}
          onChangeText={setStudentId}
          onSubmitEditing={() => undefined}
          placeholder="Enter your student ID"
          placeholderTextColor={colors.placeholder}
          returnKeyType="next"
          style={styles.input}
          value={studentId}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          accessibilityLabel="Password"
          autoCapitalize="none"
          editable={!submitting && !authLoading}
          onChangeText={setPassword}
          onSubmitEditing={() => void handleSubmit()}
          placeholder="Enter your password"
          placeholderTextColor={colors.placeholder}
          returnKeyType="go"
          secureTextEntry
          style={styles.input}
          value={password}
        />

        <Pressable
          accessibilityRole="button"
          disabled={submitting || authLoading}
          onPress={() => void handleSubmit()}
          style={({ pressed }) => [
            styles.submit,
            pressed && styles.pressed,
            (submitting || authLoading) && styles.disabled,
          ]}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Sign in</Text>}
        </Pressable>

        <Link href="/forgot-password" style={styles.link}>Forgot password?</Link>
        <Text style={styles.registerText}>New to Squared? <Link href="/register" style={styles.link}>Create account</Link></Text>
        <Text style={styles.registerText}>Instructor? <Link href="/instructor/login" style={styles.link}>Instructor portal</Link></Text>
        <Text style={styles.registerText}>Administrator? <Link href="/admin/login" style={styles.link}>Admin portal</Link></Text>
        <Text style={styles.registerText}>Prefect? <Link href="/prefect/login" style={styles.link}>Prefect portal</Link></Text>
        <Text style={styles.footer}>Your account is protected by Squared’s secure sign-in.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, justifyContent: "center", padding: 28 },
  brandMark: {
    alignSelf: "center",
    width: 58,
    height: 58,
    marginBottom: 10,
  },
  brand: { color: colors.primary, fontWeight: "800", fontSize: 17, textAlign: "center" },
  heading: { color: colors.text, fontSize: 30, fontWeight: "800", marginTop: 34, textAlign: "center" },
  subtitle: { color: colors.muted, fontSize: 15, marginTop: 8, marginBottom: 30, textAlign: "center" },
  label: { color: colors.text, fontWeight: "700", marginBottom: 8, marginTop: 17 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  submit: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 50,
    marginTop: 28,
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.6 },
  error: {
    color: colors.danger,
    backgroundColor: "#fff1f0",
    borderRadius: 10,
    padding: 12,
    lineHeight: 20,
  },
  footer: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 24, textAlign: "center" },
  link: { color: colors.primary, fontSize: 13, fontWeight: "800", marginTop: 16, textAlign: "center" },
  registerText: { color: colors.muted, fontSize: 13, marginTop: 16, textAlign: "center" },
})
