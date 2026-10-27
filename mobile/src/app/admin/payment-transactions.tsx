import { Redirect } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import * as FileSystem from "expo-file-system/legacy"
import * as Sharing from "expo-sharing"
import AdminNavigation from "@/components/AdminNavigation"
import { useAdmin } from "@/contexts/AdminContext"
import { api, type AdminPaymentEvent, type AdminPaymentTransaction } from "@/services/api"
import { colors } from "@/theme"

const statusOptions = ["", "paid", "pending", "cancelled", "refunded"]

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

export default function AdminPaymentTransactionsScreen() {
  const { admin, loading: authLoading } = useAdmin()
  const [transactions, setTransactions] = useState<AdminPaymentTransaction[]>([])
  const [paymentEvents, setPaymentEvents] = useState<AdminPaymentEvent[]>([])
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [department, setDepartment] = useState("")
  const [feeType, setFeeType] = useState("")
  const [status, setStatus] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [academicYear, setAcademicYear] = useState("")
  const [semester, setSemester] = useState("")
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [collected, setCollected] = useState(0)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!admin) return
    let active = true
    Promise.all([
      api.getAdminPaymentEvents(),
      api.getAdminPaymentTransactions({ search: "", department: "", feeType: "", status: "", dateFrom: "", dateTo: "", academicYear: "", semester: "", page: 1 }),
    ]).then(([events, result]) => {
      if (!active) return
      setPaymentEvents(events)
      setTransactions(result.transactions)
      setPage(result.pagination.current_page)
      setPages(result.pagination.total_pages)
      setTotal(result.pagination.total_records)
      setCollected(result.analytics.total_collected)
    }).catch((loadError: unknown) => {
      if (active) setError(loadError instanceof Error ? loadError.message : "Could not load transaction report.")
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [admin])

  if (authLoading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
  if (!admin) return <Redirect href="/admin/login" />

  const load = async (targetPage = 1, options = {
    search, department, feeType, status, dateFrom, dateTo, academicYear, semester,
  }) => {
    if ((options.dateFrom && !isValidDate(options.dateFrom)) || (options.dateTo && !isValidDate(options.dateTo)) ||
      (options.dateFrom && options.dateTo && options.dateFrom > options.dateTo)) {
      setError("Enter valid dates in YYYY-MM-DD format, with From on or before To.")
      return
    }
    setLoading(true); setError("")
    try {
      const result = await api.getAdminPaymentTransactions({ ...options, page: targetPage })
      setTransactions(result.transactions)
      setPage(result.pagination.current_page)
      setPages(result.pagination.total_pages)
      setTotal(result.pagination.total_records)
      setCollected(result.analytics.total_collected)
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Could not load transaction report.") }
    finally { setLoading(false) }
  }
  const applySearch = () => { setSearch(searchInput.trim()); void load(1, { search: searchInput.trim(), department, feeType, status, dateFrom, dateTo, academicYear, semester }) }
  const exportCsv = async () => {
    if (exporting) return
    if ((dateFrom && !isValidDate(dateFrom)) || (dateTo && !isValidDate(dateTo)) || (dateFrom && dateTo && dateFrom > dateTo)) {
      setError("Enter valid dates in YYYY-MM-DD format, with From on or before To.")
      return
    }
    setExporting(true); setError("")
    try {
      const csv = await api.exportAdminPaymentTransactions({ search, department, feeType, status, dateFrom, dateTo, academicYear, semester })
      if (!FileSystem.cacheDirectory) throw new Error("Temporary file storage is unavailable on this device.")
      const uri = `${FileSystem.cacheDirectory}squared-payment-transactions-${new Date().toISOString().slice(0, 10)}.csv`
      await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 })
      if (!await Sharing.isAvailableAsync()) throw new Error("File sharing is not available on this device.")
      await Sharing.shareAsync(uri, { mimeType: "text/csv", dialogTitle: "Share payment transaction report" })
    } catch (exportError) { setError(exportError instanceof Error ? exportError.message : "Could not export transaction report.") }
    finally { setExporting(false) }
  }
  const chips = (items: readonly string[], selected: string, select: (value: string) => void) => (
    <View style={styles.chips}>{items.map((value) => <Pressable key={value || "all"} onPress={() => select(value)} style={[styles.chip, value === selected && styles.selectedChip]}><Text style={[styles.chipText, value === selected && styles.selectedChipText]}>{value || "All"}</Text></Pressable>)}</View>
  )
  return (
    <View style={styles.page}>
      <AdminNavigation />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Payment transactions</Text>
        <Text style={styles.subtitle}>Filter payment history by student, program, event, status, date, and academic period.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <View style={styles.stats}><Metric label="Matching records" value={String(total)} /><Metric label="Collected" value={`₱${collected.toFixed(2)}`} /></View>
        <View style={styles.card}>
          <View style={styles.row}><TextInput onChangeText={setSearchInput} onSubmitEditing={applySearch} placeholder="Student ID or name" placeholderTextColor={colors.placeholder} style={[styles.input, styles.flex]} value={searchInput} /><Pressable onPress={applySearch} style={styles.button}><Text style={styles.buttonText}>Search</Text></Pressable></View>
          <Text style={styles.label}>Status</Text>{chips(statusOptions, status, (value) => { setStatus(value); void load(1, { search, department, feeType, status: value, dateFrom, dateTo, academicYear, semester }) })}
          <Text style={styles.label}>Payable event</Text>{chips(["", ...paymentEvents.map((event) => event.slug)], feeType, (value) => { setFeeType(value); void load(1, { search, department, feeType: value, status, dateFrom, dateTo, academicYear, semester }) })}
          <TextInput onChangeText={setDepartment} placeholder="Program (exact name)" placeholderTextColor={colors.placeholder} style={styles.input} value={department} />
          <View style={styles.row}><TextInput autoCapitalize="none" onChangeText={setDateFrom} placeholder="From YYYY-MM-DD" placeholderTextColor={colors.placeholder} style={[styles.input, styles.flex]} value={dateFrom} /><TextInput autoCapitalize="none" onChangeText={setDateTo} placeholder="To YYYY-MM-DD" placeholderTextColor={colors.placeholder} style={[styles.input, styles.flex]} value={dateTo} /></View>
          <TextInput onChangeText={setAcademicYear} placeholder="Academic year" placeholderTextColor={colors.placeholder} style={styles.input} value={academicYear} />
          <Text style={styles.label}>Semester</Text>{chips(["", "1st", "2nd", "Summer"], semester, (value) => { setSemester(value); void load(1, { search, department, feeType, status, dateFrom, dateTo, academicYear, semester: value }) })}
          <View style={styles.row}><Pressable onPress={() => void load()} style={styles.secondary}><Text style={styles.secondaryText}>Apply all filters</Text></Pressable><Pressable disabled={exporting} onPress={() => void exportCsv()} style={[styles.secondary, exporting && styles.disabled]}><Text style={styles.secondaryText}>{exporting ? "Preparing CSV…" : "Export all filtered CSV"}</Text></Pressable></View>
        </View>
        {loading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : transactions.map((item) => (
          <View key={item.payment_id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.student_name} · {item.student_id}</Text>
            <Text style={styles.muted}>{item.event_name} · ₱{item.amount.toFixed(2)} · {item.payment_status}</Text>
            <Text style={styles.muted}>{item.program || "—"} · {item.academic_year} · {item.semester} semester · {item.payment_method || "—"}</Text>
            <Text style={styles.muted}>{item.processed_at || "—"} · Receipt {item.receipt_number || "—"}</Text>
          </View>
        ))}
        {!loading ? <View style={styles.pagination}><Pressable disabled={page <= 1} onPress={() => void load(page - 1)} style={[styles.secondary, page <= 1 && styles.disabled]}><Text style={styles.secondaryText}>Previous</Text></Pressable><Text style={styles.muted}>Page {page} of {pages}</Text><Pressable disabled={page >= pages} onPress={() => void load(page + 1)} style={[styles.secondary, page >= pages && styles.disabled]}><Text style={styles.secondaryText}>Next</Text></Pressable></View> : null}
      </ScrollView>
    </View>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.muted}>{label}</Text></View>
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  center: { alignItems: "center", backgroundColor: colors.background, flex: 1, justifyContent: "center" },
  heading: { color: colors.text, fontSize: 25, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  stats: { flexDirection: "row", gap: 8, marginTop: 12 },
  metric: { backgroundColor: "#e8f5e9", borderRadius: 10, flex: 1, padding: 10 },
  metricValue: { color: colors.primary, fontSize: 16, fontWeight: "900" },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 12, borderWidth: 1, marginTop: 9, padding: 12 },
  row: { alignItems: "center", flexDirection: "row", gap: 7 },
  flex: { flex: 1 },
  input: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 9, borderWidth: 1, color: colors.text, marginTop: 8, paddingHorizontal: 10, paddingVertical: 10 },
  button: { backgroundColor: colors.primary, borderRadius: 8, marginTop: 8, paddingHorizontal: 11, paddingVertical: 10 },
  buttonText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  label: { color: colors.text, fontSize: 10, fontWeight: "800", marginTop: 10 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  chip: { borderColor: colors.border, borderRadius: 15, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 6 },
  selectedChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.muted, fontSize: 9 },
  selectedChipText: { color: "#fff", fontWeight: "800" },
  secondary: { backgroundColor: "#f1f7f1", borderRadius: 8, marginTop: 8, paddingHorizontal: 10, paddingVertical: 9 },
  secondaryText: { color: colors.primary, fontSize: 10, fontWeight: "800" },
  disabled: { opacity: 0.5 },
  cardTitle: { color: colors.text, fontSize: 12, fontWeight: "800" },
  muted: { color: colors.muted, fontSize: 10, lineHeight: 16, marginTop: 4 },
  loading: { margin: 18 },
  pagination: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginTop: 10, padding: 12 },
})
