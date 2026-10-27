import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "expo-router"
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native"
import { api, type StudentAttendanceRecord, type StudentNstpAttendanceRecord } from "@/services/api"
import { colors } from "@/theme"

export default function AttendanceRecordScreen() {
  const [records, setRecords] = useState<StudentAttendanceRecord[]>([])
  const [nstpRecords, setNstpRecords] = useState<StudentNstpAttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  const loadRecords = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true)
    else setLoading(true)
    setError("")
    try {
      const result = await api.getMyAttendance()
      setRecords(result.attendance)
      setNstpRecords(result.nstpAttendance)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load attendance records.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    api.getMyAttendance()
      .then((result) => {
        if (!active) return
        setRecords(result.attendance)
        setNstpRecords(result.nstpAttendance)
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load attendance records.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const presentCount = useMemo(
    () => records.filter((record) => record.status.toLowerCase() === "present").length,
    [records],
  )
  const absentCount = useMemo(
    () => records.filter((record) => record.status.toLowerCase() === "absent").length,
    [records],
  )

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadRecords(true)} tintColor={colors.primary} />}
      style={styles.page}
    >
      <Text style={styles.heading}>Attendance record</Text>
      <Text style={styles.subtitle}>Your event and NSTP attendance history.</Text>

      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {loading ? (
        <Text style={styles.muted}>Loading attendance records...</Text>
      ) : (
        <>
          <View style={styles.summary}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{presentCount}</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{absentCount}</Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{records.length}</Text>
              <Text style={styles.statLabel}>Events</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Events</Text>
          {records.length === 0 ? (
            <View style={styles.card}><Text style={styles.muted}>No event attendance records yet.</Text></View>
          ) : records.map((record, index) => (
            <View key={`${record.event_name}-${record.event_date}-${index}`} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.cardTitle}>{record.event_name}</Text>
                <Text style={[styles.status, record.status.toLowerCase() === "present" ? styles.present : styles.absent]}>
                  {record.status}
                </Text>
              </View>
              <Text style={styles.detail}>{record.event_date || "Date unavailable"}</Text>
              <Text style={styles.detail}>Time in: {record.time_in || "—"}</Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>NSTP sessions</Text>
          {nstpRecords.length === 0 ? (
            <View style={styles.card}><Text style={styles.muted}>No NSTP attendance records yet.</Text></View>
          ) : nstpRecords.map((record) => (
            <View key={record.id} style={styles.card}>
              <Text style={styles.cardTitle}>{record.subject_name || record.subject_code}</Text>
              <Text style={styles.detail}>{record.session_date}</Text>
              <Text style={styles.detail}>
                In: {record.time_in || "—"}   Out: {record.time_out || "—"}
              </Text>
              <Text style={styles.detail}>Evaluation: {record.evaluation_status || "Pending"}</Text>
              {record.certificate_issued_at ? (
                <Text style={styles.detail}>Certificate issued: {record.certificate_issued_at}</Text>
              ) : null}
              {record.evaluation_status === "pending" ? (
                <Link href={{ pathname: "/(student)/nstp-evaluation", params: { att_id: String(record.id) } }} asChild>
                  <Pressable style={styles.action}><Text style={styles.actionText}>Complete evaluation</Text></Pressable>
                </Link>
              ) : record.certificate_issued_at ? (
                <Link href={{ pathname: "/(student)/nstp-certificate", params: { att_id: String(record.id) } }} asChild>
                  <Pressable style={styles.action}><Text style={styles.actionText}>View certificate</Text></Pressable>
                </Link>
              ) : null}
            </View>
          ))}
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { padding: 22, paddingTop: 28, paddingBottom: 36 },
  heading: { color: colors.text, fontSize: 28, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 8, marginBottom: 20 },
  summary: { flexDirection: "row", gap: 10, marginBottom: 22 },
  stat: { alignItems: "center", backgroundColor: "#fff", borderColor: colors.border, borderRadius: 14, borderWidth: 1, flex: 1, padding: 14 },
  statValue: { color: colors.primary, fontSize: 22, fontWeight: "900" },
  statLabel: { color: colors.muted, fontSize: 12, marginTop: 3 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "800", marginBottom: 10, marginTop: 6 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 16, borderWidth: 1, marginBottom: 10, padding: 16 },
  row: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 10 },
  cardTitle: { color: colors.text, flex: 1, fontSize: 15, fontWeight: "800" },
  detail: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 7 },
  action: { alignSelf: "flex-start", backgroundColor: colors.primary, borderRadius: 9, marginTop: 11, paddingHorizontal: 12, paddingVertical: 9 },
  actionText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  status: { borderRadius: 12, fontSize: 11, fontWeight: "800", overflow: "hidden", paddingHorizontal: 9, paddingVertical: 5 },
  present: { backgroundColor: "#e8f5e9", color: colors.primary },
  absent: { backgroundColor: "#fff1f0", color: colors.danger },
  muted: { color: colors.muted, lineHeight: 20 },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginBottom: 14, overflow: "hidden", padding: 12 },
})
