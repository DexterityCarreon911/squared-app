import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native"
import * as Print from "expo-print"
import * as Sharing from "expo-sharing"
import { api, type NstpRecord } from "@/services/api"
import { colors } from "@/theme"

export default function NstpCertificateScreen() {
  const { att_id: attendanceId } = useLocalSearchParams<{ att_id: string }>()
  const router = useRouter()
  const [record, setRecord] = useState<NstpRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    const id = Number(attendanceId)
    if (!Number.isSafeInteger(id) || id <= 0) {
      Promise.resolve().then(() => {
        if (!active) return
        setError("A valid NSTP attendance record is required.")
        setLoading(false)
      })
      return () => { active = false }
    }
    api.getNstpRecord(id)
      .then((loaded) => { if (active) setRecord(loaded) })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load the certificate.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [attendanceId])

  const shareCertificate = async () => {
    if (!record) return
    const studentName = fullName(record)
    const certificateNo = `NSTP-${record.session_date.slice(0, 4)}-${String(record.id).padStart(4, "0")}`
    try {
      await Share.share({
        title: "NSTP Certificate of Participation",
        message: `CERTIFICATE OF PARTICIPATION\n\nThis certifies that ${studentName} participated in ${record.subject_name || record.subject_code} (${record.subject_code}) held on ${record.session_date}.\n\nNSTP Subject: ${record.subject_code}\nDate Issued: ${record.certificate_issued_at || "Not issued"}\nCertificate No.: ${certificateNo}`,
      })
    } catch (shareError) {
      setError(shareError instanceof Error ? shareError.message : "Could not share the certificate details.")
    }
  }

  const exportPdf = async () => {
    if (!record || generatingPdf) return
    setError("")
    setGeneratingPdf(true)
    try {
      if (!await Sharing.isAvailableAsync()) {
        throw new Error("PDF sharing is unavailable on this device.")
      }
      const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] || character)
      const safeName = escapeHtml(studentName)
      const safeSubject = escapeHtml(record.subject_name || record.subject_code)
      const safeCode = escapeHtml(record.subject_code)
      const safeDate = escapeHtml(record.session_date)
      const safeIssued = escapeHtml(record.certificate_issued_at || "Pending")
      const safeCertificateNo = escapeHtml(certificateNo)
      const { uri } = await Print.printToFileAsync({
        html: `<!doctype html>
          <html><head><meta charset="utf-8"><style>
            @page { size: A4 landscape; margin: 18mm; }
            body { color: #243027; font-family: Georgia, serif; margin: 0; }
            .certificate { border: 5px double #187c19; min-height: 155mm; padding: 18mm; text-align: center; }
            .brand { font: 900 18px Arial, sans-serif; letter-spacing: 4px; }
            .program { color: #187c19; font: 700 11px Arial, sans-serif; letter-spacing: 2px; margin-top: 8px; }
            .rule { background: #bbf7d0; height: 3px; margin: 22px auto; width: 100px; }
            h1 { color: #187c19; font-size: 31px; margin: 0 0 18px; }
            .caption { color: #647067; font: 14px Arial, sans-serif; }
            .name { font-size: 30px; font-weight: bold; margin: 12px 0; }
            .description { font: 15px/1.7 Arial, sans-serif; margin: 12px auto; max-width: 680px; }
            .details { border-top: 1px solid #d7e5d8; display: flex; justify-content: space-around; margin: 26px auto 0; max-width: 700px; padding-top: 15px; }
            .detail { font: 12px Arial, sans-serif; } .detail strong { display: block; margin-bottom: 5px; }
            .status { color: #187c19; font: bold 12px Arial, sans-serif; margin-top: 20px; }
          </style></head><body><main class="certificate">
            <div class="brand">SQUARED</div>
            <div class="program">NATIONAL SERVICE TRAINING PROGRAM</div>
            <div class="rule"></div>
            <h1>Certificate of Participation</h1>
            <div class="caption">This is to certify that</div>
            <div class="name">${safeName}</div>
            <p class="description">has satisfactorily participated in the NSTP session <strong>${safeSubject}</strong> (${safeCode}) held on <strong>${safeDate}</strong>.</p>
            <div class="details">
              <div class="detail"><strong>NSTP Subject</strong>${safeCode}</div>
              <div class="detail"><strong>Date Issued</strong>${safeIssued}</div>
              <div class="detail"><strong>Certificate No.</strong>${safeCertificateNo}</div>
            </div>
            <div class="status">${record.certificate_issued_at ? "Certificate issued" : "Certificate not yet issued"}</div>
          </main></body></html>`,
      })
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Share NSTP certificate PDF",
        UTI: "com.adobe.pdf",
      })
    } catch (pdfError) {
      setError(pdfError instanceof Error ? pdfError.message : "Could not create the certificate PDF.")
    } finally {
      setGeneratingPdf(false)
    }
  }

  const studentName = record ? fullName(record) : ""
  const certificateNo = record ? `NSTP-${record.session_date.slice(0, 4)}-${String(record.id).padStart(4, "0")}` : ""

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.page}>
      <Pressable onPress={() => router.back()}><Text style={styles.back}>‹  Back to attendance</Text></Pressable>
      <Text style={styles.heading}>NSTP certificate</Text>
      {loading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : null}
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {record ? (
        <View style={styles.certificate}>
          <Text style={styles.brand}>SQUARED</Text>
          <Text style={styles.program}>NATIONAL SERVICE TRAINING PROGRAM</Text>
          <View style={styles.rule} />
          <Text style={styles.title}>Certificate of Participation</Text>
          <Text style={styles.caption}>This is to certify that</Text>
          <Text style={styles.name}>{studentName}</Text>
          <Text style={styles.description}>
            has satisfactorily participated in the NSTP session{" "}
            <Text style={styles.bold}>{record.subject_name || record.subject_code}</Text>{" "}
            ({record.subject_code}) held on <Text style={styles.bold}>{record.session_date}</Text>.
          </Text>
          <View style={styles.details}>
            <CertificateDetail label="NSTP Subject" value={record.subject_code || "—"} />
            <CertificateDetail label="Date issued" value={record.certificate_issued_at || "Pending"} />
            <CertificateDetail label="Certificate No." value={certificateNo} />
          </View>
          <Text style={styles.status}>{record.certificate_issued_at ? "Certificate issued" : "Certificate not yet issued"}</Text>
          <Pressable accessibilityRole="button" onPress={() => void shareCertificate()} style={styles.button}>
            <Text style={styles.buttonText}>Share certificate details</Text>
          </Pressable>
          <Pressable accessibilityRole="button" disabled={generatingPdf} onPress={() => void exportPdf()} style={[styles.button, generatingPdf && styles.disabledButton]}>
            <Text style={styles.buttonText}>{generatingPdf ? "Preparing PDF..." : "Save or share certificate PDF"}</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  )
}

function fullName(record: NstpRecord) {
  const middle = record.middle_name?.trim()
  const name = `${record.first_name.trim()}${middle ? ` ${middle.charAt(0).toUpperCase()}.` : ""} ${record.last_name.trim()}`
  return record.suffix ? `${name}, ${record.suffix.trim()}` : name
}

function CertificateDetail({ label, value }: { label: string; value: string }) {
  return <View style={styles.detailBox}><Text style={styles.detailValue}>{value}</Text><Text style={styles.detailLabel}>{label}</Text></View>
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#f0faf0", flex: 1 },
  content: { padding: 20, paddingBottom: 38, paddingTop: 28 },
  back: { color: colors.primary, fontSize: 13, fontWeight: "800", marginBottom: 16 },
  heading: { color: colors.text, fontSize: 26, fontWeight: "900" },
  loading: { marginTop: 18 },
  certificate: { alignItems: "center", backgroundColor: "#fff", borderColor: colors.primary, borderRadius: 12, borderWidth: 3, marginTop: 18, padding: 24 },
  brand: { color: colors.text, fontSize: 20, fontWeight: "900", letterSpacing: 2 },
  program: { color: colors.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1.1, marginTop: 5, textAlign: "center" },
  rule: { backgroundColor: "#bbf7d0", borderRadius: 4, height: 4, marginVertical: 21, width: 110 },
  title: { color: colors.primary, fontFamily: "serif", fontSize: 24, fontWeight: "900", textAlign: "center" },
  caption: { color: colors.muted, fontSize: 12, marginTop: 21 },
  name: { color: colors.text, fontFamily: "serif", fontSize: 25, fontWeight: "900", marginTop: 12, textAlign: "center" },
  description: { color: colors.muted, fontSize: 13, lineHeight: 22, marginTop: 19, textAlign: "center" },
  bold: { color: colors.text, fontWeight: "800" },
  details: { alignSelf: "stretch", gap: 12, marginTop: 24 },
  detailBox: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, padding: 8 },
  detailValue: { color: colors.text, fontSize: 13, fontWeight: "800", textAlign: "center" },
  detailLabel: { color: colors.muted, fontSize: 10, fontWeight: "700", marginTop: 5, textTransform: "uppercase" },
  status: { color: colors.primary, fontSize: 12, fontWeight: "800", marginTop: 20 },
  button: { alignItems: "center", alignSelf: "stretch", backgroundColor: colors.primary, borderRadius: 10, marginTop: 14, padding: 12 },
  buttonText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  disabledButton: { opacity: 0.55 },
  error: { backgroundColor: "#fff1f0", borderRadius: 9, color: colors.danger, lineHeight: 19, marginTop: 12, overflow: "hidden", padding: 11 },
})
