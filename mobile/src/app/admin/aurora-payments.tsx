import { Redirect } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native"
import AdminNavigation from "@/components/AdminNavigation"
import { useAdmin } from "@/contexts/AdminContext"
import { api, type AdminAuroraPayment, type AdminAuroraReceipt, type AdminAuroraStudent } from "@/services/api"
import { colors } from "@/theme"

const paymentMethods = ["Cash", "GCash", "Bank Transfer", "Other"]

function money(amount: number) {
  return `₱${Number(amount || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function AdminAuroraPaymentsScreen() {
  const { admin, csrfToken, loading: authLoading } = useAdmin()
  const [studentId, setStudentId] = useState("")
  const [student, setStudent] = useState<AdminAuroraStudent | null>(null)
  const [aurora, setAurora] = useState<{ active: boolean; event_name: string; fee_amount: number; is_paid: boolean } | null>(null)
  const [method, setMethod] = useState("Cash")
  const [transactions, setTransactions] = useState<AdminAuroraPayment[]>([])
  const [receipt, setReceipt] = useState<AdminAuroraReceipt | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [listLoading, setListLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  useEffect(() => {
    if (!admin) return
    let active = true
    api.getAdminAuroraTransactions(1)
      .then((result) => {
        if (!active) return
        setTransactions(result.transactions)
        setPage(result.page)
        setTotalPages(result.totalPages)
      })
      .catch((loadError: unknown) => { if (active) setError(loadError instanceof Error ? loadError.message : "Could not load Aurora payments.") })
      .finally(() => { if (active) setListLoading(false) })
    return () => { active = false }
  }, [admin])

  if (authLoading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
  if (!admin) return <Redirect href="/admin/login" />

  const loadTransactions = async (targetPage: number) => {
    setListLoading(true)
    setError("")
    try {
      const result = await api.getAdminAuroraTransactions(targetPage)
      setTransactions(result.transactions)
      setPage(result.page)
      setTotalPages(result.totalPages)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load Aurora payments.")
    } finally {
      setListLoading(false)
    }
  }

  const lookup = async () => {
    const id = studentId.trim()
    if (!id) return
    setLoading(true)
    setError("")
    setNotice("")
    setStudent(null)
    setAurora(null)
    try {
      const result = await api.getAdminAuroraStudentStatus(id)
      setStudent(result.student || null)
      setAurora(result.aurora_night || null)
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : "Could not look up student.")
    } finally {
      setLoading(false)
    }
  }

  const recordPayment = async () => {
    if (!student || !aurora || aurora.is_paid || !aurora.active || loading) return
    setLoading(true)
    setError("")
    setNotice("")
    try {
      const result = await api.processAdminAuroraPayment(student.id, method, csrfToken)
      setNotice(`${result.message || "Payment recorded."}${result.receipt_number ? ` Receipt ${result.receipt_number}.` : ""}`)
      const refreshed = await api.getAdminAuroraStudentStatus(student.id)
      setStudent(refreshed.student || student)
      setAurora(refreshed.aurora_night || aurora)
      await loadTransactions(1)
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Could not record payment.")
    } finally {
      setLoading(false)
    }
  }

  const openReceipt = async (paymentId: number) => {
    setError("")
    try {
      setReceipt(await api.getAdminPaymentReceipt(paymentId))
    } catch (receiptError) {
      setError(receiptError instanceof Error ? receiptError.message : "Could not load payment receipt.")
    }
  }

  const shareReceipt = async () => {
    if (!receipt?.receipt || !receipt.payment || !receipt.student) return
    try {
      await Share.share({
        title: `Payment receipt ${receipt.receipt.receipt_number}`,
        message: `SQUARED PAYMENT RECEIPT\n${receipt.receipt.receipt_number}\n${receipt.payment.event_name}\n\nStudent: ${receipt.student.name} (${receipt.student.id})\nAmount: ${money(receipt.payment.amount)}\nMethod: ${receipt.payment.method}\nStatus: ${receipt.payment.status}\nPeriod: ${receipt.payment.academic_year} · ${receipt.payment.semester} semester\nProcessed by: ${receipt.payment.processed_by || "System"}\nDate: ${receipt.payment.processed_at || "—"}`,
      })
    } catch (shareError) {
      setError(shareError instanceof Error ? shareError.message : "Could not share payment receipt.")
    }
  }

  return (
    <View style={styles.page}>
      <AdminNavigation />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>EVENT PAYMENTS</Text>
        <Text style={styles.heading}>Aurora Night payments</Text>
        <Text style={styles.subtitle}>The existing payment service controls the configured fee, active status, duplicates, and receipt generation.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {notice ? <Text accessibilityRole="status" style={styles.success}>{notice}</Text> : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Student payment</Text>
          <Text style={styles.muted}>Look up the registered student ID to verify payment eligibility.</Text>
          <View style={styles.formRow}>
            <TextInput autoCapitalize="characters" autoCorrect={false} editable={!loading} maxLength={15} onChangeText={setStudentId} onSubmitEditing={() => void lookup()} placeholder="Student ID" placeholderTextColor={colors.placeholder} style={styles.input} value={studentId} />
            <Pressable disabled={loading || !studentId.trim()} onPress={() => void lookup()} style={[styles.secondary, (loading || !studentId.trim()) && styles.disabled]}><Text style={styles.secondaryText}>Lookup</Text></Pressable>
          </View>
          {loading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : null}
          {student && aurora ? (
            <View style={styles.guest}>
              <View style={styles.row}><Text style={styles.studentName}>{student.name}</Text><Text style={[styles.badge, aurora.is_paid ? styles.paid : aurora.active ? styles.unpaid : styles.inactive]}>{aurora.is_paid ? "Paid" : aurora.active ? "Unpaid" : "Inactive"}</Text></View>
              <Text style={styles.muted}>{student.id} · {student.program || "—"} · {student.course || "—"}</Text>
              <Text style={styles.event}>{aurora.event_name}</Text>
              <Text style={styles.amount}>{money(aurora.fee_amount)}</Text>
              <Text style={styles.label}>PAYMENT METHOD</Text>
              <View style={styles.methods}>{paymentMethods.map((item) => <Pressable key={item} onPress={() => setMethod(item)} style={[styles.method, method === item && styles.methodSelected]}><Text style={[styles.methodText, method === item && styles.methodTextSelected]}>{item}</Text></Pressable>)}</View>
              <Pressable accessibilityRole="button" disabled={loading || aurora.is_paid || !aurora.active || !csrfToken} onPress={() => void recordPayment()} style={[styles.button, (loading || aurora.is_paid || !aurora.active || !csrfToken) && styles.disabled]}>
                <Text style={styles.buttonText}>{aurora.is_paid ? "Already paid" : !aurora.active ? "Payments inactive" : "Record payment"}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        {receipt?.receipt && receipt.payment && receipt.student ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Receipt {receipt.receipt.receipt_number}</Text>
            <Text style={styles.muted}>{receipt.payment.event_name} · {receipt.receipt.generated_at}</Text>
            <Text style={styles.detail}>Student: {receipt.student.name} ({receipt.student.id})</Text>
            <Text style={styles.detail}>Payment: {money(receipt.payment.amount)} · {receipt.payment.method} · {receipt.payment.status}</Text>
            <Text style={styles.detail}>Period: {receipt.payment.academic_year} · {receipt.payment.semester} semester</Text>
            <Text style={styles.detail}>Processed by: {receipt.payment.processed_by || "System"} · {receipt.payment.processed_at || "—"}</Text>
            <Text style={styles.muted}>{receipt.receipt.transaction_id}</Text>
            <Pressable onPress={() => void shareReceipt()} style={styles.secondary}><Text style={styles.secondaryText}>Share receipt</Text></Pressable>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recent Aurora payments</Text>
          {listLoading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : transactions.length === 0 ? (
            <Text style={styles.muted}>No Aurora payments found.</Text>
          ) : transactions.map((transaction) => (
            <View key={transaction.payment_id} style={styles.transaction}>
              <Text style={styles.studentName}>{transaction.student_name}</Text>
              <Text style={styles.muted}>{transaction.student_id} · {transaction.receipt_number || "Receipt pending"}</Text>
              <View style={styles.row}>
                <Text style={styles.amount}>{money(transaction.amount)}</Text>
                <Text style={styles.muted}>{transaction.processed_at || "—"} · {transaction.payment_method}</Text>
              </View>
              <Pressable onPress={() => void openReceipt(transaction.payment_id)} style={styles.receiptButton}><Text style={styles.receiptText}>View receipt</Text></Pressable>
            </View>
          ))}
          <View style={styles.pagination}>
            <Pressable disabled={page <= 1 || listLoading} onPress={() => void loadTransactions(page - 1)} style={[styles.pageButton, (page <= 1 || listLoading) && styles.disabled]}><Text style={styles.pageText}>Previous</Text></Pressable>
            <Text style={styles.muted}>Page {page} of {totalPages}</Text>
            <Pressable disabled={page >= totalPages || listLoading} onPress={() => void loadTransactions(page + 1)} style={[styles.pageButton, (page >= totalPages || listLoading) && styles.disabled]}><Text style={styles.pageText}>Next</Text></Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  center: { alignItems: "center", backgroundColor: colors.background, flex: 1, justifyContent: "center" },
  eyebrow: { color: "#92400e", fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  heading: { color: colors.text, fontSize: 25, fontWeight: "900", marginTop: 4 },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 13, borderWidth: 1, marginTop: 13, padding: 14 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: "900" },
  muted: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 5 },
  formRow: { alignItems: "center", flexDirection: "row", gap: 7, marginTop: 10 },
  input: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 9, borderWidth: 1, color: colors.text, flex: 1, minHeight: 42, paddingHorizontal: 10 },
  secondary: { alignItems: "center", backgroundColor: "#0f172a", borderRadius: 9, justifyContent: "center", minHeight: 40, marginTop: 10, paddingHorizontal: 12 },
  secondaryText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  loading: { marginTop: 12 },
  guest: { backgroundColor: "#fffbeb", borderColor: "#fde68a", borderRadius: 11, borderWidth: 1, marginTop: 13, padding: 12 },
  row: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "space-between", marginTop: 7 },
  studentName: { color: colors.text, fontSize: 13, fontWeight: "800" },
  badge: { borderRadius: 10, fontSize: 10, fontWeight: "900", overflow: "hidden", paddingHorizontal: 8, paddingVertical: 5 },
  paid: { backgroundColor: "#dcfce7", color: "#166534" },
  unpaid: { backgroundColor: "#fff", color: "#92400e" },
  inactive: { backgroundColor: "#e2e8f0", color: "#475569" },
  event: { color: colors.muted, fontSize: 10, fontWeight: "800", marginTop: 14, textTransform: "uppercase" },
  amount: { color: "#92400e", fontSize: 19, fontWeight: "900", marginTop: 3 },
  label: { color: colors.muted, fontSize: 10, fontWeight: "900", marginTop: 13 },
  methods: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 7 },
  method: { borderColor: colors.border, borderRadius: 14, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 6 },
  methodSelected: { backgroundColor: "#92400e", borderColor: "#92400e" },
  methodText: { color: colors.muted, fontSize: 10 },
  methodTextSelected: { color: "#fff", fontWeight: "800" },
  button: { alignItems: "center", backgroundColor: "#92400e", borderRadius: 9, justifyContent: "center", minHeight: 42, marginTop: 12 },
  buttonText: { color: "#fff", fontSize: 11, fontWeight: "900" },
  disabled: { opacity: 0.5 },
  detail: { color: colors.text, fontSize: 12, lineHeight: 18, marginTop: 8 },
  transaction: { borderTopColor: colors.border, borderTopWidth: 1, marginTop: 11, paddingTop: 10 },
  receiptButton: { alignSelf: "flex-start", marginTop: 7, paddingVertical: 4 },
  receiptText: { color: colors.primary, fontSize: 11, fontWeight: "800" },
  pagination: { alignItems: "center", borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", marginTop: 12, paddingTop: 12 },
  pageButton: { borderColor: colors.border, borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7 },
  pageText: { color: colors.text, fontSize: 10, fontWeight: "800" },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginTop: 11, overflow: "hidden", padding: 12 },
  success: { backgroundColor: "#e8f5e9", borderRadius: 10, color: colors.primary, lineHeight: 20, marginTop: 11, overflow: "hidden", padding: 12 },
})
