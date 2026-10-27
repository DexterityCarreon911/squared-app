import { Redirect } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import AdminNavigation from "@/components/AdminNavigation"
import { useAdmin } from "@/contexts/AdminContext"
import { api, type AdminSupportTicket } from "@/services/api"
import { colors } from "@/theme"

export default function AdminSupportScreen() {
  const { admin, csrfToken, loading: authLoading } = useAdmin()
  const [tickets, setTickets] = useState<AdminSupportTicket[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [appliedSearch, setAppliedSearch] = useState("")
  const [reply, setReply] = useState("")
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState<"all" | AdminSupportTicket["status"]>("all")
  const [statusCounts, setStatusCounts] = useState({ open: 0, in_progress: 0, resolved: 0, closed: 0 })
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!admin) return
    let active = true
    api.getAdminSupportTickets({ search: appliedSearch, page, status: statusFilter })
      .then((result) => {
        if (!active) return
        setTickets((current) => page === 1 ? result.tickets : [...current, ...result.tickets])
        setPages(result.pages)
        setTotal(result.total)
        setStatusCounts(result.statusCounts)
        setSelectedId((current) => page === 1 ? result.tickets[0]?.id ?? null : current ?? result.tickets[0]?.id ?? null)
        setError("")
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load support requests.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [admin, appliedSearch, page, reloadKey, statusFilter])

  const selected = tickets.find((ticket) => ticket.id === selectedId) || null

  if (authLoading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
  if (!admin) return <Redirect href="/admin/login" />

  const sendReply = async () => {
    if (!selected || !reply.trim() || sending) return
    setError("")
    setNotice("")
    setSending(true)
    try {
      const result = await api.replyToAdminSupportTicket(selected.id, reply.trim(), csrfToken)
      setNotice(result.message || "Reply sent.")
      setReply("")
      setLoading(true)
      setPage(1)
      setReloadKey((current) => current + 1)
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Could not send the support reply.")
    } finally {
      setSending(false)
    }
  }

  const updateStatus = async (status: AdminSupportTicket["status"]) => {
    if (!selected || selected.status === status || updatingStatus) return
    setError("")
    setNotice("")
    setUpdatingStatus(true)
    try {
      const result = await api.updateAdminSupportTicketStatus(selected.id, status, csrfToken)
      setNotice(result.message || "Support status updated.")
      setLoading(true)
      setPage(1)
      setReloadKey((current) => current + 1)
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Could not update support status.")
    } finally {
      setUpdatingStatus(false)
    }
  }

  const statusLabels: Record<"all" | AdminSupportTicket["status"], string> = {
    all: "All",
    open: "Open",
    in_progress: "In progress",
    resolved: "Resolved",
    closed: "Closed",
  }

  return (
    <View style={styles.page}>
      <AdminNavigation />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Support requests</Text>
        <Text style={styles.subtitle}>{statusCounts.open} open · {total} requests match these filters.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {notice ? <Text accessibilityRole="status" style={styles.success}>{notice}</Text> : null}
        <View style={styles.searchRow}>
          <TextInput onChangeText={setSearch} onSubmitEditing={() => {
            setLoading(true)
            setPage(1)
            setAppliedSearch(search.trim())
          }} placeholder="Search subject, student, or message" placeholderTextColor={colors.placeholder} style={styles.input} value={search} />
          <Pressable accessibilityRole="button" onPress={() => {
            setLoading(true)
            setPage(1)
            setAppliedSearch(search.trim())
          }} style={styles.searchButton}><Text style={styles.searchButtonText}>Search</Text></Pressable>
        </View>
        <ScrollView horizontal contentContainerStyle={styles.filters} showsHorizontalScrollIndicator={false}>
          {(["all", "open", "in_progress", "resolved", "closed"] as const).map((status) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: statusFilter === status }}
              key={status}
              onPress={() => {
                if (statusFilter === status) return
                setLoading(true)
                setPage(1)
                setStatusFilter(status)
              }}
              style={[styles.filter, statusFilter === status && styles.activeFilter]}
            >
              <Text style={[styles.filterText, statusFilter === status && styles.activeFilterText]}>
                {statusLabels[status]}{status === "all" ? "" : ` (${statusCounts[status]})`}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        {loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : tickets.length === 0 ? (
          <View style={styles.card}><Text style={styles.muted}>No support requests found.</Text></View>
        ) : tickets.map((ticket) => (
          <Pressable key={ticket.id} onPress={() => { setSelectedId(ticket.id); setReply("") }} style={[styles.ticket, selectedId === ticket.id && styles.selectedTicket]}>
            <View style={styles.ticketHeader}>
              <Text style={[styles.ticketTitle, selectedId === ticket.id && styles.selectedTicketText]}>{ticket.subject}</Text>
              <Text style={[styles.status, ticket.status === "open" ? styles.openStatus : styles.otherStatus]}>{ticket.status.replace("_", " ")}</Text>
            </View>
            <Text style={[styles.muted, selectedId === ticket.id && styles.selectedMuted]}>{ticket.student_name || ticket.student_id} · {ticket.student_id}</Text>
            <Text numberOfLines={2} style={[styles.messagePreview, selectedId === ticket.id && styles.selectedTicketText]}>{ticket.message}</Text>
          </Pressable>
        ))}
        {selected ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{selected.subject}</Text>
            <Text style={styles.muted}>From {selected.student_name || selected.student_id} ({selected.student_id}) · {selected.created_at}</Text>
            <Text style={styles.body}>{selected.message}</Text>
            <Text style={styles.sectionLabel}>Update status</Text>
            <View style={styles.statusActions}>
              {(["open", "in_progress", "resolved", "closed"] as const).map((status) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: selected.status === status }}
                  disabled={updatingStatus}
                  key={status}
                  onPress={() => void updateStatus(status)}
                  style={[styles.statusAction, selected.status === status && styles.activeStatusAction, updatingStatus && styles.disabled]}
                >
                  <Text style={[styles.statusActionText, selected.status === status && styles.activeStatusActionText]}>
                    {statusLabels[status]}
                  </Text>
                </Pressable>
              ))}
            </View>
            {selected.admin_reply ? (
              <View style={styles.replyCard}>
                <Text style={styles.replyLabel}>Previous reply · {selected.replied_at || "Sent"}</Text>
                <Text style={styles.body}>{selected.admin_reply}</Text>
              </View>
            ) : null}
            <TextInput
              multiline
              onChangeText={setReply}
              placeholder="Write a reply to the student"
              placeholderTextColor={colors.placeholder}
              style={styles.replyInput}
              textAlignVertical="top"
              value={reply}
            />
            <Pressable accessibilityRole="button" disabled={sending || !reply.trim()} onPress={() => void sendReply()} style={[styles.button, (sending || !reply.trim()) && styles.disabled]}>
              {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send reply</Text>}
            </Pressable>
          </View>
        ) : null}
        {!loading && page < pages ? (
          <Pressable accessibilityRole="button" onPress={() => { setLoading(true); setPage((current) => current + 1) }} style={styles.loadMore}>
            <Text style={styles.loadMoreText}>Load more requests</Text>
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
  input: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, marginTop: 14, paddingHorizontal: 12, paddingVertical: 11 },
  searchRow: { alignItems: "center", flexDirection: "row", gap: 7 },
  searchButton: { backgroundColor: colors.primary, borderRadius: 10, marginTop: 14, paddingHorizontal: 12, paddingVertical: 12 },
  searchButtonText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  filters: { gap: 7, paddingTop: 12 },
  filter: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 18, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 8 },
  activeFilter: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.text, fontSize: 10, fontWeight: "700" },
  activeFilterText: { color: "#fff" },
  loader: { marginTop: 20 },
  ticket: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 12, borderWidth: 1, marginTop: 8, padding: 12 },
  selectedTicket: { backgroundColor: colors.primary, borderColor: colors.primary },
  ticketHeader: { alignItems: "center", flexDirection: "row", gap: 8 },
  ticketTitle: { color: colors.text, flex: 1, fontSize: 13, fontWeight: "800" },
  selectedTicketText: { color: "#fff" },
  status: { borderRadius: 8, fontSize: 9, fontWeight: "800", overflow: "hidden", paddingHorizontal: 7, paddingVertical: 4, textTransform: "capitalize" },
  openStatus: { backgroundColor: "#fff1f0", color: colors.danger },
  otherStatus: { backgroundColor: "#e8f5e9", color: colors.primary },
  muted: { color: colors.muted, fontSize: 10, lineHeight: 16, marginTop: 5 },
  selectedMuted: { color: "#d5f0d6" },
  messagePreview: { color: colors.text, fontSize: 11, lineHeight: 17, marginTop: 7 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 13, borderWidth: 1, marginTop: 14, padding: 14 },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: "800" },
  body: { color: colors.text, fontSize: 13, lineHeight: 20, marginTop: 10 },
  sectionLabel: { color: colors.text, fontSize: 11, fontWeight: "800", marginTop: 14 },
  statusActions: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 8 },
  statusAction: { borderColor: colors.border, borderRadius: 9, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 },
  activeStatusAction: { backgroundColor: colors.primary, borderColor: colors.primary },
  statusActionText: { color: colors.text, fontSize: 10, fontWeight: "700" },
  activeStatusActionText: { color: "#fff" },
  replyCard: { backgroundColor: "#f0f8f0", borderRadius: 10, marginTop: 13, padding: 11 },
  replyLabel: { color: colors.primary, fontSize: 10, fontWeight: "800" },
  replyInput: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, height: 110, marginTop: 14, padding: 11 },
  button: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 10, justifyContent: "center", minHeight: 44, marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  loadMore: { alignItems: "center", borderColor: colors.primary, borderRadius: 10, borderWidth: 1, marginTop: 8, padding: 10 },
  loadMoreText: { color: colors.primary, fontSize: 11, fontWeight: "800" },
  disabled: { opacity: 0.55 },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginTop: 10, padding: 12 },
  success: { backgroundColor: "#eaf7eb", borderRadius: 10, color: colors.primary, lineHeight: 20, marginTop: 10, padding: 12 },
})
