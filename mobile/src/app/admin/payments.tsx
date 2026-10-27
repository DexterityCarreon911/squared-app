import { Redirect } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import AdminNavigation from "@/components/AdminNavigation"
import { useAdmin } from "@/contexts/AdminContext"
import { api, type AdminMembershipPayment } from "@/services/api"
import { colors } from "@/theme"

type PaymentStatus = "" | "paid" | "pending" | "cancelled"

function money(value: number) {
  return `₱${Number(value || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function AdminPaymentsScreen() {
  const { admin, loading: authLoading } = useAdmin()
  const [payments, setPayments] = useState<AdminMembershipPayment[]>([])
  const [search, setSearch] = useState("")
  const [appliedSearch, setAppliedSearch] = useState("")
  const [status, setStatus] = useState<PaymentStatus>("")
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalCollected, setTotalCollected] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!admin) return
    let active = true
    api.getAdminMembershipPayments({ status, search: appliedSearch, page })
      .then((result) => {
        if (!active) return
        setPayments((current) => page === 1 ? result.payments : [...current, ...result.payments])
        setPages(result.pages)
        setTotal(result.total)
        setTotalCollected(result.summary.total_collected)
        setError("")
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load student payments.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [admin, status, appliedSearch, page])

  if (authLoading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
  if (!admin) return <Redirect href="/admin/login" />

  const applySearch = () => {
    setLoading(true)
    setPage(1)
    setAppliedSearch(search.trim())
    setError("")
  }

  const selectStatus = (next: PaymentStatus) => {
    setLoading(true)
    setPage(1)
    setStatus(next)
    setError("")
  }

  return (
    <View style={styles.page}>
      <AdminNavigation />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Student payments</Text>
        <Text style={styles.subtitle}>Review membership and event-fee payments recorded in Squared.</Text>
        <View style={styles.summary}>
          <View style={styles.summaryCard}><Text style={styles.summaryValue}>{total}</Text><Text style={styles.summaryLabel}>Payment records</Text></View>
          <View style={styles.summaryCard}><Text style={styles.summaryValue}>{money(totalCollected)}</Text><Text style={styles.summaryLabel}>Collected</Text></View>
        </View>
        <View style={styles.searchRow}>
          <TextInput
            onChangeText={setSearch}
            onSubmitEditing={applySearch}
            placeholder="Search student name or ID"
            placeholderTextColor={colors.placeholder}
            returnKeyType="search"
            style={styles.input}
            value={search}
          />
          <Pressable accessibilityRole="button" onPress={applySearch} style={styles.searchButton}><Text style={styles.searchButtonText}>Search</Text></Pressable>
        </View>
        <View style={styles.filters}>
          {([
            ["", "All"],
            ["paid", "Paid"],
            ["pending", "Pending"],
            ["cancelled", "Cancelled"],
          ] as const).map(([value, label]) => (
            <Pressable key={value || "all"} onPress={() => selectStatus(value)} style={[styles.filterButton, status === value && styles.selectedFilter]}>
              <Text style={[styles.filterText, status === value && styles.selectedFilterText]}>{label}</Text>
            </Pressable>
          ))}
        </View>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : payments.length === 0 ? (
          <View style={styles.card}><Text style={styles.muted}>No payment records match these filters.</Text></View>
        ) : payments.map((payment) => (
          <View key={payment.payment_id} style={styles.card}>
            <View style={styles.paymentHeader}>
              <Text style={styles.cardTitle}>{payment.student_name}</Text>
              <Text style={[styles.status, payment.payment_status === "paid" ? styles.paid : payment.payment_status === "pending" ? styles.pending : styles.cancelled]}>
                {payment.payment_status}
              </Text>
            </View>
            <Text style={styles.id}>{payment.student_id}</Text>
            <Text style={styles.detail}>{payment.description} · {payment.fee_type}</Text>
            <Text style={styles.amount}>{money(payment.amount)}</Text>
            <Text style={styles.muted}>{payment.academic_year} · {payment.semester} semester · {payment.payment_method || "Method not recorded"}</Text>
            <Text style={styles.muted}>Recorded {payment.processed_at || payment.created_at}{payment.receipt_number ? ` · Receipt ${payment.receipt_number}` : ""}</Text>
          </View>
        ))}
        {!loading && page < pages ? (
          <Pressable accessibilityRole="button" onPress={() => { setLoading(true); setPage((current) => current + 1) }} style={styles.loadMore}>
            <Text style={styles.loadMoreText}>Load more payments</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  center: { alignItems: "center", backgroundColor: colors.background, flex: 1, justifyContent: "center" },
  heading: { color: colors.text, fontSize: 26, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  summary: { flexDirection: "row", gap: 8, marginTop: 14 },
  summaryCard: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 12, borderWidth: 1, flex: 1, padding: 12 },
  summaryValue: { color: colors.primary, fontSize: 17, fontWeight: "900" },
  summaryLabel: { color: colors.muted, fontSize: 10, marginTop: 5 },
  searchRow: { alignItems: "center", flexDirection: "row", gap: 7, marginTop: 13 },
  input: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, flex: 1, paddingHorizontal: 11, paddingVertical: 11 },
  searchButton: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 13, paddingVertical: 12 },
  searchButtonText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 10 },
  filterButton: { borderColor: colors.border, borderRadius: 9, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7 },
  selectedFilter: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.text, fontSize: 10, fontWeight: "800" },
  selectedFilterText: { color: "#fff" },
  loader: { marginTop: 20 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 13, borderWidth: 1, marginTop: 9, padding: 13 },
  paymentHeader: { alignItems: "center", flexDirection: "row", gap: 8 },
  cardTitle: { color: colors.text, flex: 1, fontSize: 14, fontWeight: "800" },
  status: { borderRadius: 8, fontSize: 9, fontWeight: "800", overflow: "hidden", paddingHorizontal: 8, paddingVertical: 5, textTransform: "capitalize" },
  paid: { backgroundColor: "#e8f5e9", color: colors.primary },
  pending: { backgroundColor: "#fff4df", color: "#8a5700" },
  cancelled: { backgroundColor: "#edf0ed", color: colors.muted },
  id: { color: colors.primary, fontSize: 11, fontWeight: "800", marginTop: 6 },
  detail: { color: colors.text, fontSize: 12, marginTop: 8 },
  amount: { color: colors.text, fontSize: 17, fontWeight: "900", marginTop: 8 },
  muted: { color: colors.muted, fontSize: 10, lineHeight: 16, marginTop: 5 },
  loadMore: { alignItems: "center", borderColor: colors.primary, borderRadius: 10, borderWidth: 1, marginTop: 8, padding: 11 },
  loadMoreText: { color: colors.primary, fontSize: 11, fontWeight: "800" },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginTop: 10, padding: 12 },
})
