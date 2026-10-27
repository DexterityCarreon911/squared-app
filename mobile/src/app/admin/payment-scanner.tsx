import { CameraView, useCameraPermissions } from "expo-camera"
import { Redirect } from "expo-router"
import { useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native"
import AdminNavigation from "@/components/AdminNavigation"
import { useAdmin } from "@/contexts/AdminContext"
import { api } from "@/services/api"
import { colors } from "@/theme"

const methods = ["Cash", "GCash", "Bank Transfer", "Other"]
type Lookup = Awaited<ReturnType<typeof api.getPaymentLookup>>

export default function AdminPaymentScannerScreen() {
  const { admin, csrfToken, loading: authLoading } = useAdmin()
  const [permission, requestPermission] = useCameraPermissions()
  const [studentId, setStudentId] = useState("")
  const [lookup, setLookup] = useState<Lookup | null>(null)
  const [selectedFee, setSelectedFee] = useState("")
  const [method, setMethod] = useState("Cash")
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [receipt, setReceipt] = useState<{ number: string; name: string; amount: string; fee: string } | null>(null)

  if (authLoading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
  if (!admin) return <Redirect href="/admin/login" />

  const lookupStudent = async (value = studentId) => {
    const id = value.trim()
    if (!id || busy) return
    setBusy(true); setError(""); setNotice(""); setReceipt(null); setLookup(null)
    try {
      const result = await api.getPaymentLookup(id)
      setStudentId(id)
      setLookup(result)
      const available = result.events?.find((event) => event.is_active && !event.is_paid)
      setSelectedFee(available?.slug || "")
      if (!available) setNotice("No unpaid active payable event is available for this student.")
    } catch (lookupError) { setError(lookupError instanceof Error ? lookupError.message : "Could not look up student.") }
    finally { setBusy(false) }
  }

  const openScanner = async () => {
    setError(""); setNotice("")
    if (!permission?.granted) {
      const result = await requestPermission()
      if (!result.granted) { setError("Camera permission is required to scan student QR codes."); return }
    }
    setScanned(false); setScanning(true)
  }

  const processPayment = async () => {
    if (!lookup?.student || !selectedFee || busy) return
    setBusy(true); setError(""); setNotice("")
    try {
      const result = await api.processAdminStudentPayment(lookup.student.id, selectedFee, method, csrfToken)
      const fee = result.payment
      setReceipt({
        number: result.receipt_number || "",
        name: lookup.student.name,
        amount: fee?.amount || "0.00",
        fee: fee?.event_name || selectedFee,
      })
      setNotice(result.message || "Payment recorded successfully.")
    } catch (paymentError) { setError(paymentError instanceof Error ? paymentError.message : "Could not process payment.") }
    finally { setBusy(false) }
  }

  const shareReceipt = async () => {
    if (!receipt) return
    try {
      await Share.share({ title: `Payment receipt ${receipt.number}`, message: `SQUARED PAYMENT RECEIPT\n${receipt.number}\n${receipt.fee}\nStudent: ${receipt.name}\nAmount: ₱${receipt.amount}` })
    } catch (shareError) { setError(shareError instanceof Error ? shareError.message : "Could not share receipt.") }
  }
  const availableEvents = (lookup?.events || []).filter((event) => event.is_active && !event.is_paid)

  return (
    <View style={styles.page}>
      <AdminNavigation />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Squared Pay scanner</Text>
        <Text style={styles.subtitle}>Scan a student QR or enter their ID, verify unpaid fees, and record payment.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {notice ? <Text accessibilityRole="status" style={styles.success}>{notice}</Text> : null}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Student lookup</Text>
          {scanning ? (
            <>
              <CameraView barcodeScannerSettings={{ barcodeTypes: ["qr"] }} onBarcodeScanned={scanned ? undefined : ({ data }) => { setScanned(true); setScanning(false); setStudentId(data); void lookupStudent(data) }} style={styles.camera} />
              <Pressable onPress={() => setScanning(false)} style={styles.secondary}><Text style={styles.secondaryText}>Close scanner</Text></Pressable>
            </>
          ) : <Pressable disabled={busy} onPress={() => void openScanner()} style={styles.secondary}><Text style={styles.secondaryText}>{permission?.granted ? "Scan QR code" : "Allow camera and scan"}</Text></Pressable>}
          <View style={styles.row}>
            <TextInput autoCapitalize="characters" onChangeText={setStudentId} onSubmitEditing={() => void lookupStudent()} placeholder="Student ID" placeholderTextColor={colors.placeholder} style={[styles.input, styles.flex]} value={studentId} />
            <Pressable disabled={busy || !studentId.trim()} onPress={() => void lookupStudent()} style={[styles.button, styles.lookupButton, (busy || !studentId.trim()) && styles.disabled]}><Text style={styles.buttonText}>{busy ? "…" : "Find"}</Text></Pressable>
          </View>
        </View>
        {lookup?.student ? (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{lookup.student.name}</Text>
              <Text style={styles.muted}>{lookup.student.id} · {lookup.student.program} · {lookup.student.course}</Text>
              <Text style={styles.sectionTitle}>Payable event</Text>
              {availableEvents.map((event) => (
                <Pressable key={event.slug} onPress={() => setSelectedFee(event.slug)} style={[styles.event, selectedFee === event.slug && styles.selectedEvent]}>
                  <Text style={styles.eventName}>{event.event_name}</Text>
                  <Text style={styles.muted}>₱{event.fee_amount.toFixed(2)} · {event.is_paid ? "Already paid" : selectedFee === event.slug ? "Selected" : "Unpaid"}</Text>
                </Pressable>
              ))}
              {!availableEvents.length ? <Text style={styles.muted}>No active payable events configured.</Text> : null}
              <Text style={styles.sectionTitle}>Payment method</Text>
              <View style={styles.methods}>{methods.map((value) => <Pressable key={value} onPress={() => setMethod(value)} style={[styles.method, method === value && styles.selectedMethod]}><Text style={[styles.methodText, method === value && styles.selectedMethodText]}>{value}</Text></Pressable>)}</View>
              <Pressable disabled={busy || !selectedFee} onPress={() => void processPayment()} style={[styles.button, styles.processButton, (busy || !selectedFee) && styles.disabled]}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Record payment</Text>}</Pressable>
            </View>
            {receipt ? <View style={styles.receipt}><Text style={styles.cardTitle}>Receipt {receipt.number}</Text><Text style={styles.muted}>{receipt.fee} · {receipt.name} · ₱{receipt.amount}</Text><Pressable onPress={() => void shareReceipt()} style={styles.secondary}><Text style={styles.secondaryText}>Share receipt</Text></Pressable></View> : null}
          </>
        ) : null}
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
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 13, borderWidth: 1, marginTop: 12, padding: 14 },
  cardTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  sectionTitle: { color: colors.text, fontSize: 12, fontWeight: "800", marginTop: 13 },
  row: { alignItems: "center", flexDirection: "row", gap: 8 },
  input: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, marginTop: 10, paddingHorizontal: 12, paddingVertical: 11 },
  flex: { flex: 1 },
  button: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 9, justifyContent: "center", minHeight: 43, paddingHorizontal: 14 },
  lookupButton: { marginTop: 10 },
  processButton: { marginTop: 15 },
  buttonText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  secondary: { alignSelf: "flex-start", backgroundColor: "#f1f7f1", borderRadius: 8, marginTop: 10, paddingHorizontal: 11, paddingVertical: 9 },
  secondaryText: { color: colors.primary, fontSize: 11, fontWeight: "800" },
  camera: { height: 280, marginTop: 10, overflow: "hidden", width: "100%" },
  event: { borderColor: colors.border, borderRadius: 9, borderWidth: 1, marginTop: 7, padding: 10 },
  selectedEvent: { backgroundColor: "#f0f8f0", borderColor: colors.primary },
  eventName: { color: colors.text, fontSize: 12, fontWeight: "800" },
  methods: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 8 },
  method: { borderColor: colors.border, borderRadius: 16, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7 },
  selectedMethod: { backgroundColor: colors.primary, borderColor: colors.primary },
  methodText: { color: colors.muted, fontSize: 10 },
  selectedMethodText: { color: "#fff", fontWeight: "800" },
  muted: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 4 },
  receipt: { backgroundColor: "#eaf7eb", borderRadius: 12, marginTop: 12, padding: 14 },
  disabled: { opacity: 0.5 },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginTop: 10, padding: 12 },
  success: { backgroundColor: "#eaf7eb", borderRadius: 10, color: colors.primary, lineHeight: 20, marginTop: 10, padding: 12 },
})
