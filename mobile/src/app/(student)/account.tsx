import { useState } from "react"
import { router } from "expo-router"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import { useAuth } from "@/contexts/useAuth"
import { api } from "@/services/api"
import { colors } from "@/theme"

export default function AccountScreen() {
  const { student, logoutStudent } = useAuth()
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [supportSubject, setSupportSubject] = useState("")
  const [supportMessage, setSupportMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const signOut = async () => {
    setError("")
    setLoading(true)
    try {
      await logoutStudent()
      router.replace("/login")
    } catch (signOutError) {
      setError(signOutError instanceof Error ? signOutError.message : "Could not sign out.")
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async () => {
    setError("")
    setNotice("")
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Complete all password fields.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.")
      return
    }
    setSubmitting(true)
    try {
      setNotice(await api.changeStudentPassword(currentPassword, newPassword, confirmPassword, await api.getCsrfToken()))
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update password.")
    } finally {
      setSubmitting(false)
    }
  }

  const sendSupport = async () => {
    setError("")
    setNotice("")
    if (!supportSubject.trim() || !supportMessage.trim()) {
      setError("Enter a subject and message for support.")
      return
    }
    setSubmitting(true)
    try {
      setNotice(await api.sendStudentSupportRequest(supportSubject.trim(), supportMessage.trim(), await api.getCsrfToken()))
      setSupportSubject("")
      setSupportMessage("")
    } catch (supportError) {
      setError(supportError instanceof Error ? supportError.message : "Could not send your support request.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>Account</Text>
      <View style={styles.card}>
        <Text style={styles.label}>SIGNED IN AS</Text>
        <Text style={styles.studentId}>{student?.student_id || "Student"}</Text>
      </View>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {notice ? <Text accessibilityRole="status" style={styles.success}>{notice}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Change password</Text>
        <TextInput autoCapitalize="none" onChangeText={setCurrentPassword} placeholder="Current password" secureTextEntry style={styles.input} value={currentPassword} />
        <TextInput autoCapitalize="none" onChangeText={setNewPassword} placeholder="New password" secureTextEntry style={styles.input} value={newPassword} />
        <TextInput autoCapitalize="none" onChangeText={setConfirmPassword} placeholder="Confirm new password" secureTextEntry style={styles.input} value={confirmPassword} />
        <Pressable accessibilityRole="button" disabled={submitting} onPress={() => void updatePassword()} style={[styles.button, submitting && styles.disabled]}>
          <Text style={styles.buttonText}>Update password</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Contact support</Text>
        <TextInput onChangeText={setSupportSubject} placeholder="Subject" style={styles.input} value={supportSubject} />
        <TextInput multiline onChangeText={setSupportMessage} placeholder="Describe how we can help" style={[styles.input, styles.textArea]} textAlignVertical="top" value={supportMessage} />
        <Pressable accessibilityRole="button" disabled={submitting} onPress={() => void sendSupport()} style={[styles.button, submitting && styles.disabled]}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send support request</Text>}
        </Pressable>
      </View>

      <Pressable disabled={loading} onPress={() => void signOut()} style={styles.button}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign out</Text>}
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, backgroundColor: colors.background, padding: 22, paddingTop: 28, paddingBottom: 36 },
  heading: { color: colors.text, fontSize: 29, fontWeight: "900", marginBottom: 22 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 16, borderWidth: 1, marginBottom: 14, padding: 18 },
  label: { color: colors.muted, fontSize: 11, fontWeight: "900", letterSpacing: 1.1 },
  studentId: { color: colors.text, fontSize: 18, fontWeight: "700", marginTop: 8 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "800", marginBottom: 8 },
  input: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 11, borderWidth: 1, color: colors.text, marginTop: 10, paddingHorizontal: 13, paddingVertical: 12 },
  textArea: { height: 100 },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginBottom: 12, overflow: "hidden", padding: 12 },
  success: { backgroundColor: "#eaf7eb", borderRadius: 10, color: colors.primary, lineHeight: 20, marginBottom: 12, overflow: "hidden", padding: 12 },
  button: { alignItems: "center", backgroundColor: colors.danger, borderRadius: 12, justifyContent: "center", minHeight: 48, marginTop: 12 },
  buttonText: { color: "#fff", fontWeight: "800" },
  disabled: { opacity: 0.6 },
})
