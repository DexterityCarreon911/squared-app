import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import { api, type NstpRecord } from "@/services/api"
import { colors } from "@/theme"

type EvaluationField = readonly [key: string, label: string]
type EvaluationSection = { title: string; description: string; fields: EvaluationField[] }

const sections: EvaluationSection[] = [
  {
    title: "Activity Assessment",
    description: "Rate each aspect from 1 (Poor) to 5 (Excellent).",
    fields: [
      ["clarity_of_objectives", "Clarity of Objectives"],
      ["vmg_alignment", "VMG Alignment"],
      ["time_management", "Time Management"],
      ["preparation_restoration", "Preparation and Restoration"],
      ["program_flow", "Program Flow"],
      ["facilities_equipment", "Facilities and Equipment"],
      ["performance_key_personnel", "Performance of Key Personnel"],
      ["cleanliness_orderliness", "Cleanliness and Orderliness"],
      ["participation", "Participation of Personnel and Students"],
      ["overall_impact", "Overall Impact"],
    ],
  },
  {
    title: "Core Values",
    description: "Rate how well the activity reflected the school’s core values.",
    fields: [
      ["discipline", "Discipline"],
      ["compassion", "Compassion"],
      ["competence", "Competence"],
      ["integrity", "Integrity"],
    ],
  },
]

const textFields: EvaluationField[] = [
  ["like_reason", "I like this activity because…"],
  ["significant_learning", "My most significant learning in this activity is…"],
  ["would_be_successful_if", "It would have been successful if… (optional)"],
  ["other_comments", "Other comments (optional)"],
]

const ratingLabels: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Satisfactory",
  4: "Very satisfactory",
  5: "Excellent",
}

export default function NstpEvaluationScreen() {
  const { att_id: attendanceId } = useLocalSearchParams<{ att_id: string }>()
  const router = useRouter()
  const [record, setRecord] = useState<NstpRecord | null>(null)
  const [csrfToken, setCsrfToken] = useState("")
  const [ratings, setRatings] = useState<Record<string, string>>({})
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  useEffect(() => {
    let active = true
    const id = Number(attendanceId)
    if (!Number.isSafeInteger(id) || id <= 0) {
      Promise.resolve().then(() => {
        if (!active) return
        setError("A valid NSTP attendance record is required.")
        setLoading(false)
      })
      return () => { active = false }
    }
    Promise.all([api.getNstpRecord(id), api.getCsrfToken()])
      .then(([loaded, token]) => {
        if (!active) return
        setRecord(loaded)
        setCsrfToken(token)
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load the evaluation.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [attendanceId])

  const submit = async () => {
    if (!record || submitting) return
    setError("")
    setNotice("")
    const keys = sections.flatMap((section) => section.fields.map(([key]) => key))
    if (keys.some((key) => !ratings[key])) {
      setError("Please provide a rating for every required item.")
      return
    }
    setSubmitting(true)
    try {
      const values: Record<string, string> = { ...ratings, ...answers }
      const result = await api.submitNstpEvaluation(record.id, values, csrfToken)
      setNotice(result.message || "Evaluation submitted.")
      setRecord(await api.getNstpRecord(record.id))
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not submit the evaluation.")
    } finally {
      setSubmitting(false)
    }
  }

  const isSubmitted = record?.evaluation_status !== "pending"
  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" style={styles.page}>
      <Pressable onPress={() => router.back()}><Text style={styles.back}>‹  Back to attendance</Text></Pressable>
      <Text style={styles.heading}>NSTP evaluation</Text>
      <Text style={styles.subtitle}>Your feedback helps improve future NSTP sessions.</Text>
      {loading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : null}
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {notice ? <Text accessibilityRole="status" style={styles.success}>{notice}</Text> : null}
      {record ? (
        <>
          <View style={styles.card}>
            <Text style={styles.label}>NSTP ATTENDANCE</Text>
            <Text style={styles.cardTitle}>{record.subject_name || record.subject_code}</Text>
            <Text style={styles.detail}>{record.session_date} · {record.subject_code}</Text>
          </View>
          {isSubmitted ? (
            <View style={styles.card}>
              <Text style={styles.submitted}>Evaluation submitted</Text>
              {sections.flatMap((section) => section.fields).map(([key, label]) => (
                <Answer key={key} label={label} value={record.evaluation_data?.[key]} />
              ))}
              {textFields.map(([key, label]) => <Answer key={key} label={label} value={record.evaluation_data?.[key]} />)}
            </View>
          ) : record.is_owner ? (
            <>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Rating scale</Text>
                <Text style={styles.detail}>1 Poor · 2 Fair · 3 Satisfactory · 4 Very satisfactory · 5 Excellent</Text>
              </View>
              {sections.map((section) => (
                <View key={section.title} style={styles.card}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <Text style={styles.detail}>{section.description}</Text>
                  {section.fields.map(([key, label]) => (
                    <View key={key} style={styles.field}>
                      <Text style={styles.fieldLabel}>{label} *</Text>
                      <View style={styles.ratingRow}>
                        {[1, 2, 3, 4, 5].map((score) => (
                          <Pressable key={score} accessibilityRole="button" accessibilityState={{ selected: ratings[key] === String(score) }} onPress={() => setRatings((current) => ({ ...current, [key]: String(score) }))} style={[styles.rating, ratings[key] === String(score) && styles.ratingSelected]}>
                            <Text style={[styles.ratingText, ratings[key] === String(score) && styles.ratingTextSelected]}>{score}</Text>
                          </Pressable>
                        ))}
                        {ratings[key] ? <Text style={styles.ratingLabel}>{ratingLabels[Number(ratings[key])]}</Text> : null}
                      </View>
                    </View>
                  ))}
                </View>
              ))}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Open-ended questions</Text>
                {textFields.map(([key, label]) => (
                  <View key={key} style={styles.field}>
                    <Text style={styles.fieldLabel}>{label}</Text>
                    <TextInput maxLength={2000} multiline onChangeText={(value) => setAnswers((current) => ({ ...current, [key]: value }))} placeholder="Share your response" placeholderTextColor={colors.placeholder} style={styles.input} textAlignVertical="top" value={answers[key] || ""} />
                  </View>
                ))}
                <Pressable accessibilityRole="button" disabled={submitting || !csrfToken} onPress={() => void submit()} style={[styles.button, (submitting || !csrfToken) && styles.disabled]}>
                  {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit evaluation</Text>}
                </Pressable>
              </View>
            </>
          ) : <View style={styles.card}><Text style={styles.error}>This evaluation is not available for your account.</Text></View>}
        </>
      ) : null}
    </ScrollView>
  )
}

function Answer({ label, value }: { label: string; value: number | string | undefined }) {
  return <View style={styles.answer}><Text style={styles.fieldLabel}>{label}</Text><Text style={styles.detail}>{value === undefined || value === "" ? "—" : String(value)}</Text></View>
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 20, paddingBottom: 38, paddingTop: 28 },
  back: { color: colors.primary, fontSize: 13, fontWeight: "800", marginBottom: 16 },
  heading: { color: colors.text, fontSize: 26, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 6 },
  loading: { marginTop: 18 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 14, borderWidth: 1, marginTop: 13, padding: 15 },
  label: { color: colors.primary, fontSize: 10, fontWeight: "900", letterSpacing: 0.8 },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: "800", marginTop: 6 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: "900" },
  detail: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  field: { borderBottomColor: colors.border, borderBottomWidth: 1, marginTop: 15, paddingBottom: 12 },
  fieldLabel: { color: colors.text, fontSize: 13, fontWeight: "700", lineHeight: 19 },
  ratingRow: { alignItems: "center", flexDirection: "row", gap: 8, marginTop: 9 },
  rating: { alignItems: "center", borderColor: colors.border, borderRadius: 18, borderWidth: 1, height: 36, justifyContent: "center", width: 36 },
  ratingSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  ratingText: { color: colors.text, fontSize: 13, fontWeight: "800" },
  ratingTextSelected: { color: "#fff" },
  ratingLabel: { color: colors.primary, flex: 1, fontSize: 11, fontWeight: "700" },
  input: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 9, borderWidth: 1, color: colors.text, marginTop: 7, minHeight: 75, padding: 10 },
  button: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 10, justifyContent: "center", marginTop: 15, minHeight: 45 },
  buttonText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  disabled: { opacity: 0.5 },
  answer: { borderBottomColor: colors.border, borderBottomWidth: 1, paddingVertical: 10 },
  submitted: { color: colors.primary, fontSize: 14, fontWeight: "900", marginBottom: 10 },
  error: { backgroundColor: "#fff1f0", borderRadius: 9, color: colors.danger, lineHeight: 19, marginTop: 12, overflow: "hidden", padding: 11 },
  success: { backgroundColor: "#e8f5e9", borderRadius: 9, color: colors.primary, lineHeight: 19, marginTop: 12, overflow: "hidden", padding: 11 },
})
