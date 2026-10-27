import { Link, Redirect, router } from "expo-router"
import { useState } from "react"
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { useAuth } from "@/contexts/useAuth"
import { api } from "@/services/api"
import { colors } from "@/theme"
import { avatars, programs } from "@/constants/academic"
const initialValues = {
  avatar: "JOY",
  first_name: "",
  middle_name: "",
  last_name: "",
  suffix: "",
  sex: "",
  student_id: "",
  program: "",
  course: "",
  email: "",
  password: "",
  confirm_password: "",
}

export default function RegisterScreen() {
  const { student } = useAuth()
  const [values, setValues] = useState(initialValues)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (student) return <Redirect href="/(student)" />

  const update = (field: keyof typeof initialValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value, ...(field === "program" ? { course: "" } : {}) }))
  }

  const submit = async () => {
    setError("")
    if (
      !values.first_name.trim() || !values.last_name.trim() || !values.sex ||
      !values.student_id.trim() || !values.program || !values.course ||
      !values.email.trim() || !values.password
    ) {
      setError("Complete all required fields.")
      return
    }
    if (values.password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (values.password !== values.confirm_password) {
      setError("Passwords do not match.")
      return
    }
    setSubmitting(true)
    try {
      await api.registerStudent(values, await api.getCsrfToken())
      router.replace({ pathname: "/login", params: { registered: "1" } })
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "Could not complete registration.")
    } finally {
      setSubmitting(false)
    }
  }

  const selectedProgram = programs.find((program) => program.code === values.program)

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>SQUARED</Text>
        <Text style={styles.heading}>Create your student account</Text>
        <Text style={styles.subtitle}>Register with your verified student information.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <Text style={styles.label}>AVATAR</Text>
          <View style={styles.options}>
            {avatars.map((avatar) => (
              <Pressable key={avatar} onPress={() => update("avatar", avatar)} style={[styles.chip, values.avatar === avatar && styles.selectedChip]}>
                <Text style={[styles.chipText, values.avatar === avatar && styles.selectedChipText]}>{avatar}</Text>
              </Pressable>
            ))}
          </View>
          <Field label="First name *" value={values.first_name} onChangeText={(value) => update("first_name", value)} />
          <Field label="Middle name" value={values.middle_name} onChangeText={(value) => update("middle_name", value)} />
          <Field label="Last name *" value={values.last_name} onChangeText={(value) => update("last_name", value)} />
          <Field label="Suffix" value={values.suffix} onChangeText={(value) => update("suffix", value)} />
          <Text style={styles.label}>SEX *</Text>
          <View style={styles.options}>
            {["Male", "Female"].map((sex) => (
              <Pressable key={sex} onPress={() => update("sex", sex)} style={[styles.chip, values.sex === sex && styles.selectedChip]}>
                <Text style={[styles.chipText, values.sex === sex && styles.selectedChipText]}>{sex}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>School details</Text>
          <Field label="Student ID *" value={values.student_id} onChangeText={(value) => update("student_id", value)} autoCapitalize="none" />
          <Text style={styles.label}>PROGRAM *</Text>
          <View style={styles.choiceList}>
            {programs.map((program) => (
              <Pressable key={program.code} onPress={() => update("program", program.code)} style={[styles.choice, values.program === program.code && styles.selectedChoice]}>
                <Text style={[styles.choiceText, values.program === program.code && styles.selectedChoiceText]}>{program.code} · {program.name}</Text>
              </Pressable>
            ))}
          </View>
          {selectedProgram ? (
            <>
              <Text style={styles.label}>COURSE *</Text>
              <View style={styles.choiceList}>
                {selectedProgram.courses.map((course) => (
                  <Pressable key={course} onPress={() => update("course", course)} style={[styles.choice, values.course === course && styles.selectedChoice]}>
                    <Text style={[styles.choiceText, values.course === course && styles.selectedChoiceText]}>{course}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sign-in details</Text>
          <Field label="Email *" value={values.email} onChangeText={(value) => update("email", value)} keyboardType="email-address" autoCapitalize="none" />
          <Field label="Password * (at least 8 characters)" value={values.password} onChangeText={(value) => update("password", value)} secureTextEntry />
          <Field label="Confirm password *" value={values.confirm_password} onChangeText={(value) => update("confirm_password", value)} secureTextEntry />
        </View>

        <Pressable accessibilityRole="button" disabled={submitting} onPress={() => void submit()} style={[styles.button, submitting && styles.disabled]}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account</Text>}
        </Pressable>
        <Text style={styles.footer}>Already registered? <Link href="/login" style={styles.link}>Sign in</Link></Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function Field({
  label,
  value,
  onChangeText,
  ...props
}: {
  label: string
  value: string
  onChangeText: (value: string) => void
  autoCapitalize?: "none" | "sentences" | "words" | "characters"
  keyboardType?: "default" | "email-address"
  secureTextEntry?: boolean
}) {
  return (
    <>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <TextInput
        autoCapitalize={props.autoCapitalize || "words"}
        autoCorrect={false}
        keyboardType={props.keyboardType || "default"}
        onChangeText={onChangeText}
        placeholder={label.replace(" *", "")}
        placeholderTextColor={colors.placeholder}
        secureTextEntry={props.secureTextEntry}
        style={styles.input}
        value={value}
      />
    </>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: 22, paddingTop: 34, paddingBottom: 40 },
  brand: { color: colors.primary, fontSize: 12, fontWeight: "900", letterSpacing: 2 },
  heading: { color: colors.text, fontSize: 27, fontWeight: "900", marginTop: 8 },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21, marginBottom: 18, marginTop: 7 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 16, borderWidth: 1, marginBottom: 13, padding: 16 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: "800", marginBottom: 5 },
  label: { color: colors.muted, fontSize: 10, fontWeight: "900", letterSpacing: 0.8, marginTop: 14 },
  input: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, marginTop: 7, paddingHorizontal: 12, paddingVertical: 11 },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  chip: { borderColor: colors.border, borderRadius: 18, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  selectedChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.muted, fontSize: 12 },
  selectedChipText: { color: "#fff", fontWeight: "800" },
  choiceList: { gap: 7, marginTop: 8 },
  choice: { borderColor: colors.border, borderRadius: 10, borderWidth: 1, padding: 11 },
  selectedChoice: { backgroundColor: "#f0f8f0", borderColor: colors.primary },
  choiceText: { color: colors.text, fontSize: 12, lineHeight: 17 },
  selectedChoiceText: { color: colors.primary, fontWeight: "700" },
  button: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 12, justifyContent: "center", minHeight: 50, marginTop: 4 },
  buttonText: { color: "#fff", fontWeight: "800" },
  disabled: { opacity: 0.6 },
  footer: { color: colors.muted, fontSize: 13, marginTop: 18, textAlign: "center" },
  link: { color: colors.primary, fontWeight: "800" },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginBottom: 12, overflow: "hidden", padding: 12 },
})
