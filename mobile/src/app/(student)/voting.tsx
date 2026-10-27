import { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { api, type StudentElection } from "@/services/api"
import { colors } from "@/theme"

export default function VotingScreen() {
  const [elections, setElections] = useState<StudentElection[]>([])
  const [selected, setSelected] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  useEffect(() => {
    let active = true
    api.getElections()
      .then((result) => { if (active) setElections(result) })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load elections.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const vote = async (electionId: number) => {
    const candidateId = selected[electionId]
    if (!candidateId || submitting) return
    setSubmitting(true)
    setError("")
    setNotice("")
    try {
      await api.submitVote(electionId, candidateId, await api.getCsrfToken())
      setNotice("Your vote was submitted.")
      setSelected((current) => {
        const next = { ...current }
        delete next[electionId]
        return next
      })
      setElections(await api.getElections())
    } catch (voteError) {
      setError(voteError instanceof Error ? voteError.message : "Could not submit your vote.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.page}>
      <Text style={styles.heading}>Voting</Text>
      <Text style={styles.subtitle}>Cast your vote in active campus elections.</Text>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {notice ? <Text accessibilityRole="status" style={styles.success}>{notice}</Text> : null}
      {loading ? (
        <View style={styles.card}><ActivityIndicator color={colors.primary} /><Text style={styles.muted}>Loading elections...</Text></View>
      ) : elections.length === 0 ? (
        <View style={styles.card}><Text style={styles.cardTitle}>No active elections</Text><Text style={styles.muted}>Check back when an election is open.</Text></View>
      ) : elections.map((election) => (
        <View key={election.id} style={styles.card}>
          <View style={styles.electionHeader}>
            <Text style={styles.cardTitle}>{election.title}</Text>
            <Text style={styles.status}>{election.status}</Text>
          </View>
          <Text style={styles.muted}>{election.description}</Text>
          {election.candidates.map((candidate) => (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: selected[election.id] === candidate.id }}
              key={candidate.id}
              onPress={() => setSelected((current) => ({ ...current, [election.id]: candidate.id }))}
              style={[styles.candidate, selected[election.id] === candidate.id && styles.selectedCandidate]}
            >
              <View style={[styles.radio, selected[election.id] === candidate.id && styles.radioSelected]}>
                {selected[election.id] === candidate.id ? <View style={styles.radioDot} /> : null}
              </View>
              <View style={styles.candidateInfo}>
                <Text style={styles.candidateName}>{candidate.name}</Text>
                <Text style={styles.muted}>{candidate.party || candidate.position}</Text>
              </View>
            </Pressable>
          ))}
          <Pressable
            accessibilityRole="button"
            disabled={!selected[election.id] || submitting || election.status !== "active"}
            onPress={() => void vote(election.id)}
            style={[styles.button, (!selected[election.id] || submitting || election.status !== "active") && styles.disabled]}
          >
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit vote</Text>}
          </Pressable>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { padding: 22, paddingTop: 28, paddingBottom: 36 },
  heading: { color: colors.text, fontSize: 28, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 15, marginBottom: 18, marginTop: 8 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 16, borderWidth: 1, marginBottom: 14, padding: 16 },
  electionHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 8 },
  cardTitle: { color: colors.text, flex: 1, fontSize: 17, fontWeight: "800" },
  status: { backgroundColor: "#eaf5ea", borderRadius: 12, color: colors.primary, fontSize: 11, overflow: "hidden", paddingHorizontal: 9, paddingVertical: 5, textTransform: "capitalize" },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  candidate: { alignItems: "center", borderColor: colors.border, borderRadius: 12, borderWidth: 1, flexDirection: "row", marginTop: 10, padding: 12 },
  selectedCandidate: { backgroundColor: "#f0f8f0", borderColor: colors.primary },
  radio: { alignItems: "center", borderColor: colors.muted, borderRadius: 10, borderWidth: 1, height: 20, justifyContent: "center", width: 20 },
  radioSelected: { borderColor: colors.primary },
  radioDot: { backgroundColor: colors.primary, borderRadius: 5, height: 10, width: 10 },
  candidateInfo: { flex: 1, marginLeft: 11 },
  candidateName: { color: colors.text, fontSize: 14, fontWeight: "700" },
  button: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 11, justifyContent: "center", minHeight: 46, marginTop: 14 },
  buttonText: { color: "#fff", fontWeight: "800" },
  disabled: { opacity: 0.55 },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginBottom: 12, overflow: "hidden", padding: 12 },
  success: { backgroundColor: "#eaf7eb", borderRadius: 10, color: colors.primary, lineHeight: 20, marginBottom: 12, overflow: "hidden", padding: 12 },
})
