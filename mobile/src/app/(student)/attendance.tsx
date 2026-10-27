import { CameraView, useCameraPermissions } from "expo-camera"
import { useState } from "react"
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { api } from "@/services/api"
import { colors } from "@/theme"

export default function AttendanceScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [eventCode, setEventCode] = useState("")
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const recordAttendance = async () => {
    const code = eventCode.trim()
    if (!code || submitting) return
    setSubmitting(true)
    setMessage("")
    try {
      const csrfToken = await api.getCsrfToken()
      const result = await api.recordAttendance(code, csrfToken)
      if (result.status !== "success") throw new Error(result.message || "Could not record attendance.")
      setIsSuccess(true)
      setMessage(result.message || "Attendance recorded successfully.")
      setEventCode("")
      setScanned(false)
    } catch (error) {
      setIsSuccess(false)
      setMessage(error instanceof Error ? error.message : "Could not record attendance.")
    } finally {
      setSubmitting(false)
    }
  }

  const openScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission()
      if (!result.granted) {
        setMessage("Camera permission is required to scan an event QR code.")
        setIsSuccess(false)
        return
      }
    }
    setScanned(false)
    setScanning(true)
  }

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.page} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>Attendance</Text>
      <Text style={styles.subtitle}>Enter an event code or scan the QR code provided at the event.</Text>

      <View style={styles.card}>
        <Text style={styles.label}>EVENT CODE</Text>
        <TextInput
          accessibilityLabel="Event code"
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!submitting}
          onChangeText={setEventCode}
          onSubmitEditing={() => void recordAttendance()}
          placeholder="Enter event code"
          placeholderTextColor={colors.placeholder}
          returnKeyType="done"
          style={styles.input}
          value={eventCode}
        />
        <Pressable
          accessibilityRole="button"
          disabled={!eventCode.trim() || submitting}
          onPress={() => void recordAttendance()}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.pressed,
            (!eventCode.trim() || submitting) && styles.disabled,
          ]}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit attendance</Text>}
        </Pressable>

        {message ? (
          <Text accessibilityRole="alert" style={[styles.message, isSuccess ? styles.success : styles.error]}>
            {message}
          </Text>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Scan an event QR</Text>
        <Text style={styles.helper}>Allow camera access, then point it at the event’s QR code.</Text>
        {scanning ? (
          <>
            <CameraView
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={scanned ? undefined : ({ data }) => {
                setEventCode(data)
                setScanned(true)
                setScanning(false)
              }}
              style={styles.camera}
            />
            <Pressable onPress={() => setScanning(false)} style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>Close scanner</Text>
            </Pressable>
          </>
        ) : (
          <Pressable onPress={() => void openScanner()} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>
              {permission?.granted ? "Open QR scanner" : "Allow camera and scan"}
            </Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { padding: 22, paddingTop: 28, paddingBottom: 36 },
  heading: { color: colors.text, fontSize: 29, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 8, marginBottom: 22 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 18, borderWidth: 1, marginBottom: 16, padding: 18 },
  label: { color: colors.muted, fontSize: 11, fontWeight: "900", letterSpacing: 1.1 },
  input: {
    backgroundColor: "#fff",
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 48,
    marginTop: 14,
  },
  buttonText: { color: "#fff", fontWeight: "800" },
  pressed: { opacity: 0.86 },
  disabled: { opacity: 0.55 },
  message: { borderRadius: 10, lineHeight: 20, marginTop: 14, overflow: "hidden", padding: 12 },
  success: { backgroundColor: "#eaf7eb", color: colors.primary },
  error: { backgroundColor: "#fff1f0", color: colors.danger },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: "800" },
  helper: { color: colors.muted, lineHeight: 20, marginTop: 7 },
  camera: { height: 310, borderRadius: 14, marginTop: 16, overflow: "hidden" },
  secondaryButton: {
    alignItems: "center",
    borderColor: colors.primary,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 46,
    marginTop: 14,
  },
  secondaryText: { color: colors.primary, fontWeight: "800" },
})
