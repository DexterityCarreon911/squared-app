import { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native"
import { api } from "@/services/api"
import { colors } from "@/theme"

export default function PaymentsScreen() {
  const [payments, setPayments] = useState<Awaited<ReturnType<typeof api.getPayments>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    api.getPayments()
      .then((result) => { if (active) setPayments(result) })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load payment history.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const totalDue = useMemo(
    () => payments.filter((payment) => payment.status === "pending").reduce((sum, payment) => sum + payment.amount, 0),
    [payments],
  )
  const totalPaid = useMemo(
    () => payments.filter((payment) => payment.status === "paid").reduce((sum, payment) => sum + payment.amount, 0),
    [payments],
  )
  const money = (amount: number) => `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.page}>
      <Text style={styles.heading}>Payments</Text>
      <Text style={styles.subtitle}>Review your payment records and receipts.</Text>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <View style={styles.summary}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>TOTAL DUE</Text>
          <Text style={styles.statValue}>{money(totalDue)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>TOTAL PAID</Text>
          <Text style={styles.statValue}>{money(totalPaid)}</Text>
        </View>
      </View>
      <Text style={styles.sectionTitle}>Payment history</Text>
      {loading ? (
        <View style={styles.card}><ActivityIndicator color={colors.primary} /><Text style={styles.muted}>Loading payment history...</Text></View>
      ) : payments.length === 0 ? (
        <View style={styles.card}><Text style={styles.cardTitle}>No payment records</Text><Text style={styles.muted}>Payment history will appear here.</Text></View>
      ) : payments.map((payment) => (
        <View key={payment.payment_id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.cardTitle}>{payment.description}</Text>
            <Text style={[styles.status, payment.status === "paid" ? styles.paid : styles.pending]}>{payment.status}</Text>
          </View>
          <Text style={styles.amount}>{money(payment.amount)}</Text>
          <Text style={styles.muted}>{payment.semester} Semester, {payment.academic_year}</Text>
          {payment.processed_at ? <Text style={styles.muted}>Processed: {payment.processed_at}</Text> : null}
          <Text style={styles.muted}>Receipt: {payment.receiptNumber || "—"}</Text>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { padding: 22, paddingTop: 28, paddingBottom: 36 },
  heading: { color: colors.text, fontSize: 28, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, marginBottom: 20, marginTop: 8 },
  summary: { flexDirection: "row", gap: 10 },
  stat: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 15, borderWidth: 1, flex: 1, padding: 15 },
  statLabel: { color: colors.muted, fontSize: 10, fontWeight: "900", letterSpacing: 0.8 },
  statValue: { color: colors.primary, fontSize: 19, fontWeight: "900", marginTop: 8 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "800", marginBottom: 10, marginTop: 24 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 16, borderWidth: 1, marginBottom: 11, padding: 16 },
  row: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 8 },
  cardTitle: { color: colors.text, flex: 1, fontSize: 15, fontWeight: "800" },
  status: { borderRadius: 12, fontSize: 11, fontWeight: "800", overflow: "hidden", paddingHorizontal: 9, paddingVertical: 5, textTransform: "capitalize" },
  paid: { backgroundColor: "#e8f5e9", color: colors.primary },
  pending: { backgroundColor: "#fff6df", color: "#8a5b00" },
  amount: { color: colors.text, fontSize: 17, fontWeight: "800", marginTop: 10 },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginBottom: 12, overflow: "hidden", padding: 12 },
})
