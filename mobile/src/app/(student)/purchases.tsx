import { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { api, type StudentPurchase } from "@/services/api"
import { colors } from "@/theme"

export default function PurchasesScreen() {
  const [purchases, setPurchases] = useState<StudentPurchase[]>([])
  const [totalSpent, setTotalSpent] = useState(0)
  const [receipt, setReceipt] = useState<StudentPurchase | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    api.getPurchases()
      .then((result) => {
        if (!active) return
        setPurchases(result.sales)
        setTotalSpent(result.totalSpent)
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load purchases.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const openReceipt = async (saleId: number) => {
    setError("")
    try {
      setReceipt(await api.getPurchaseReceipt(saleId))
    } catch (receiptError) {
      setError(receiptError instanceof Error ? receiptError.message : "Could not load receipt.")
    }
  }

  const money = (amount: number) => `₱${Number(amount).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.page}>
      <Text style={styles.heading}>My purchases</Text>
      <Text style={styles.subtitle}>Campus merchandise purchases and receipts.</Text>
      <View style={styles.summary}>
        <View style={styles.stat}><Text style={styles.statLabel}>PURCHASES</Text><Text style={styles.statValue}>{purchases.length}</Text></View>
        <View style={styles.stat}><Text style={styles.statLabel}>TOTAL SPENT</Text><Text style={styles.statValue}>{money(totalSpent)}</Text></View>
      </View>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

      {receipt ? (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.cardTitle}>Receipt {receipt.receipt_number}</Text>
            <Pressable accessibilityRole="button" onPress={() => setReceipt(null)}><Text style={styles.close}>Close</Text></Pressable>
          </View>
          <Text style={styles.muted}>{new Date(receipt.created_at).toLocaleString()}</Text>
          {receipt.items.map((line, index) => (
            <View key={`${line.item_name}-${index}`} style={styles.line}>
              <Text style={styles.item}>{line.quantity} × {line.item_name}</Text>
              <Text style={styles.item}>{money(line.line_total)}</Text>
            </View>
          ))}
          <View style={[styles.line, styles.totalLine]}><Text style={styles.item}>Total</Text><Text style={styles.item}>{money(receipt.total_amount)}</Text></View>
          {typeof receipt.change_amount === "number" ? (
            <View style={styles.line}><Text style={styles.muted}>Change</Text><Text style={styles.muted}>{money(receipt.change_amount)}</Text></View>
          ) : null}
        </View>
      ) : null}

      {loading ? (
        <View style={styles.card}><ActivityIndicator color={colors.primary} /><Text style={styles.muted}>Loading purchases...</Text></View>
      ) : purchases.length === 0 ? (
        <View style={styles.card}><Text style={styles.cardTitle}>No purchases yet</Text><Text style={styles.muted}>Completed purchases will appear here.</Text></View>
      ) : purchases.map((purchase) => (
        <View key={purchase.sale_id} style={styles.card}>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.cardTitle}>{purchase.receipt_number}</Text>
              <Text style={styles.muted}>{new Date(purchase.created_at).toLocaleString()}</Text>
            </View>
            <Text style={styles.amount}>{money(purchase.total_amount)}</Text>
          </View>
          {purchase.items.map((line, index) => (
            <View key={`${purchase.sale_id}-${index}`} style={styles.line}>
              <Text style={styles.item}>{line.quantity} × {line.item_name}</Text>
              <Text style={styles.item}>{money(line.line_total)}</Text>
            </View>
          ))}
          <View style={styles.footer}>
            <Text style={styles.muted}>{purchase.payment_method} payment</Text>
            <Pressable accessibilityRole="button" onPress={() => void openReceipt(purchase.sale_id)}><Text style={styles.link}>View receipt</Text></Pressable>
          </View>
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
  summary: { flexDirection: "row", gap: 10, marginBottom: 14 },
  stat: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 15, borderWidth: 1, flex: 1, padding: 15 },
  statLabel: { color: colors.muted, fontSize: 10, fontWeight: "900", letterSpacing: 0.8 },
  statValue: { color: colors.primary, fontSize: 19, fontWeight: "900", marginTop: 8 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 16, borderWidth: 1, marginBottom: 12, padding: 16 },
  row: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 10 },
  flex: { flex: 1 },
  cardTitle: { color: colors.text, flex: 1, fontSize: 15, fontWeight: "800" },
  amount: { color: colors.primary, fontSize: 17, fontWeight: "900" },
  line: { alignItems: "center", borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", marginTop: 10, paddingTop: 10 },
  totalLine: { marginTop: 14 },
  item: { color: colors.text, fontSize: 13, fontWeight: "600" },
  footer: { alignItems: "center", borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", marginTop: 12, paddingTop: 10 },
  muted: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  close: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  link: { color: colors.primary, fontSize: 12, fontWeight: "800" },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginBottom: 12, overflow: "hidden", padding: 12 },
})
