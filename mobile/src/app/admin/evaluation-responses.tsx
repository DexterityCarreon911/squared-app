import { Redirect } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native"
import AdminNavigation from "@/components/AdminNavigation"
import { useAdmin } from "@/contexts/AdminContext"
import { api, type AdminEvaluationEvent, type AdminEvaluationSubmission } from "@/services/api"
import { colors } from "@/theme"

export default function AdminEvaluationResponsesScreen() {
  const { admin, loading: authLoading } = useAdmin()
  const [events, setEvents] = useState<AdminEvaluationEvent[]>([])
  const [eventId, setEventId] = useState<number | null>(null)
  const [eventName, setEventName] = useState("")
  const [submissions, setSubmissions] = useState<AdminEvaluationSubmission[]>([])
  const [labels, setLabels] = useState<Record<string, string>>({})
  const [summary, setSummary] = useState<Record<string, { label: string; average: number; responses: number }>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!admin) return
    let active = true
    api.getAdminEvaluationResponses()
      .then((result) => { if (active) setEvents(result.events || []) })
      .catch((loadError: unknown) => { if (active) setError(loadError instanceof Error ? loadError.message : "Could not load evaluation events.") })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [admin])

  useEffect(() => {
    if (!eventId) return
    let active = true
    api.getAdminEvaluationResponses(eventId)
      .then((result) => {
        if (!active) return
        setSubmissions(result.submissions || [])
        setLabels(result.fields || {})
        setSummary(result.rating_summary || {})
        setEventName(result.event?.event_name || "")
      })
      .catch((loadError: unknown) => { if (active) setError(loadError instanceof Error ? loadError.message : "Could not load evaluation responses.") })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [eventId])

  if (authLoading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
  if (!admin) return <Redirect href="/admin/login" />

  const shareCsv = async () => {
    const keys = Array.from(new Set(submissions.flatMap((submission) => Object.keys(submission.form_data))))
    const headings = ["Student ID", "Student name", "Program", "Course", "Submitted at", ...keys.map((key) => labels[key] || key)]
    const quote = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`
    const rows = submissions.map((submission) => [
      submission.student_id, submission.student_name, submission.program, submission.course, submission.submitted_at,
      ...keys.map((key) => submission.form_data[key]),
    ].map(quote).join(","))
    try {
      await Share.share({ title: `${eventName} evaluation responses`, message: [headings.map(quote).join(","), ...rows].join("\n") })
    } catch (shareError) {
      setError(shareError instanceof Error ? shareError.message : "Could not share evaluation export.")
    }
  }

  return (
    <View style={styles.page}>
      <AdminNavigation />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Event evaluation responses</Text>
        <Text style={styles.subtitle}>Choose an event to review submitted responses, ratings, and exportable response data.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.eventChips}>
          {events.map((event) => (
            <Pressable key={event.event_id} onPress={() => { setLoading(true); setEventId(event.event_id) }} style={[styles.chip, eventId === event.event_id && styles.selectedChip]}>
              <Text style={[styles.chipText, eventId === event.event_id && styles.selectedChipText]}>{event.event_name} · {event.response_count}</Text>
            </Pressable>
          ))}
        </ScrollView>
        {loading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : eventId ? (
          <>
            <View style={styles.summaryRow}>
              <View style={styles.summary}><Text style={styles.summaryValue}>{submissions.length}</Text><Text style={styles.muted}>Responses</Text></View>
              <Pressable accessibilityRole="button" disabled={!submissions.length} onPress={() => void shareCsv()} style={[styles.export, !submissions.length && styles.disabled]}><Text style={styles.exportText}>Share CSV</Text></Pressable>
            </View>
            {Object.entries(summary).map(([key, item]) => (
              <View key={key} style={styles.rating}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.ratingValue}>{item.average} average · {item.responses} responses</Text>
              </View>
            ))}
            {submissions.map((submission) => (
              <View key={submission.id} style={styles.card}>
                <Text style={styles.cardTitle}>{submission.student_name}</Text>
                <Text style={styles.muted}>{submission.student_id} · {submission.program} · {submission.course}</Text>
                <Text style={styles.muted}>Submitted {submission.submitted_at}</Text>
                {Object.entries(submission.form_data).map(([key, value]) => (
                  <View key={key} style={styles.answer}><Text style={styles.answerLabel}>{labels[key] || key}</Text><Text style={styles.answerValue}>{Array.isArray(value) ? value.join(", ") : String(value ?? "—")}</Text></View>
                ))}
              </View>
            ))}
            {!submissions.length ? <View style={styles.card}><Text style={styles.muted}>No evaluation responses for this event.</Text></View> : null}
          </>
        ) : !events.length && !loading ? <View style={styles.card}><Text style={styles.muted}>No events available.</Text></View> : <View style={styles.card}><Text style={styles.muted}>Select an event to view its responses.</Text></View>}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  center: { alignItems: "center", backgroundColor: colors.background, flex: 1, justifyContent: "center" },
  heading: { color: colors.text, fontSize: 25, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  eventChips: { gap: 8, paddingVertical: 12 },
  chip: { borderColor: colors.border, borderRadius: 16, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7 },
  selectedChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.muted, fontSize: 11 },
  selectedChipText: { color: "#fff", fontWeight: "800" },
  summaryRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  summary: { alignItems: "center", backgroundColor: "#e8f5e9", borderRadius: 10, paddingHorizontal: 15, paddingVertical: 8 },
  summaryValue: { color: colors.primary, fontSize: 20, fontWeight: "900" },
  export: { backgroundColor: colors.primary, borderRadius: 9, paddingHorizontal: 13, paddingVertical: 10 },
  exportText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  disabled: { opacity: 0.5 },
  rating: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 9, borderWidth: 1, marginBottom: 7, padding: 10 },
  label: { color: colors.text, fontSize: 12, fontWeight: "800" },
  ratingValue: { color: colors.primary, fontSize: 11, marginTop: 4 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 12, borderWidth: 1, marginBottom: 9, padding: 13 },
  cardTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  muted: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 4 },
  answer: { borderTopColor: colors.border, borderTopWidth: 1, marginTop: 8, paddingTop: 8 },
  answerLabel: { color: colors.muted, fontSize: 10, fontWeight: "800" },
  answerValue: { color: colors.text, fontSize: 12, lineHeight: 18, marginTop: 3 },
  loading: { margin: 18 },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginTop: 10, padding: 12 },
})
