import { Redirect } from "expo-router"
import { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native"
import AdminNavigation from "@/components/AdminNavigation"
import { useAdmin } from "@/contexts/AdminContext"
import { api, type AdminPosItem, type AdminPosSale } from "@/services/api"
import { colors } from "@/theme"

type CartLine = { item: AdminPosItem; quantity: number }

function today() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function money(value: number) {
  return `₱${Number(value || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function AdminPosScreen() {
  const { admin, csrfToken, loading: authLoading } = useAdmin()
  const [items, setItems] = useState<AdminPosItem[]>([])
  const [cart, setCart] = useState<Record<number, CartLine>>({})
  const [sales, setSales] = useState<AdminPosSale[]>([])
  const [search, setSearch] = useState("")
  const [studentId, setStudentId] = useState("")
  const [tendered, setTendered] = useState("")
  const [from, setFrom] = useState(today)
  const [to, setTo] = useState(today)
  const [historySearch, setHistorySearch] = useState("")
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [receipt, setReceipt] = useState<AdminPosSale | null>(null)

  useEffect(() => {
    if (!admin) return
    let active = true
    api.getAdminPosCatalog()
      .then((catalog) => { if (active) setItems(catalog) })
      .catch((loadError: unknown) => { if (active) setError(loadError instanceof Error ? loadError.message : "Could not load POS catalog.") })
      .finally(() => { if (active) setCatalogLoading(false) })
    api.getAdminPosHistory({ from: today(), to: today(), search: "" })
      .then((result) => { if (active) setSales(result) })
      .catch((loadError: unknown) => { if (active) setError(loadError instanceof Error ? loadError.message : "Could not load POS history.") })
      .finally(() => { if (active) setHistoryLoading(false) })
    return () => { active = false }
  }, [admin])

  const cartLines = Object.values(cart)
  const total = useMemo(() => cartLines.reduce((sum, line) => sum + line.item.price * line.quantity, 0), [cartLines])
  const change = Math.max(0, (Number(tendered) || 0) - total)
  const filteredItems = items.filter((item) => item.is_active && item.stock_quantity > 0)
    .filter((item) => `${item.name} ${item.sku || ""} ${item.category_name}`.toLowerCase().includes(search.toLowerCase()))

  if (authLoading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
  if (!admin) return <Redirect href="/admin/login" />

  const updateQuantity = (item: AdminPosItem, delta: number) => {
    setCart((current) => {
      const next = { ...current }
      const quantity = (next[item.item_id]?.quantity || 0) + delta
      if (quantity <= 0) delete next[item.item_id]
      else if (quantity <= item.stock_quantity) next[item.item_id] = { item, quantity }
      return next
    })
  }

  const refreshHistory = async () => {
    setHistoryLoading(true)
    setError("")
    try {
      setSales(await api.getAdminPosHistory({ from, to, search: historySearch.trim() }))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load POS history.")
    } finally {
      setHistoryLoading(false)
    }
  }

  const checkout = async () => {
    const cash = Number(tendered)
    if (!cartLines.length || checkingOut) return
    if (!Number.isFinite(cash) || cash < total) {
      setError("Cash tendered must be at least the sale total.")
      return
    }
    setCheckingOut(true)
    setError("")
    setNotice("")
    try {
      const result = await api.checkoutAdminPos(
        cartLines.map(({ item, quantity }) => ({ item_id: item.item_id, quantity })),
        cash,
        studentId.trim(),
        csrfToken,
      )
      const [sale, refreshedItems] = await Promise.all([
        api.getAdminPosReceipt(result.sale_id),
        api.getAdminPosCatalog(),
      ])
      setReceipt(sale)
      setItems(refreshedItems)
      setCart({})
      setStudentId("")
      setTendered("")
      setNotice(result.message || "Sale completed and inventory updated.")
      await refreshHistory()
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Could not complete the sale.")
    } finally {
      setCheckingOut(false)
    }
  }

  const shareReceipt = async () => {
    if (!receipt) return
    try {
      const lines = receipt.items.map((line) => `${line.quantity} x ${line.item_name}: ${money(line.line_total)}`).join("\n")
      await Share.share({
        title: `Receipt ${receipt.receipt_number}`,
        message: `SQUARED POS RECEIPT\n${receipt.receipt_number}\n${receipt.created_at}\n\n${lines}\n\nTotal: ${money(receipt.total_amount)}\nCash tendered: ${money(receipt.amount_tendered || 0)}\nChange: ${money(receipt.change_amount || 0)}`,
      })
    } catch (shareError) {
      setError(shareError instanceof Error ? shareError.message : "Could not share receipt.")
    }
  }

  return (
    <View style={styles.page}>
      <AdminNavigation />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Enterprise POS</Text>
        <Text style={styles.subtitle}>Sell in-stock catalog items, link a sale to a student, and issue receipts.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {notice ? <Text accessibilityRole="status" style={styles.success}>{notice}</Text> : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Catalog · {items.filter((item) => item.is_active).length} active</Text>
          <TextInput onChangeText={setSearch} placeholder="Search item, SKU, or category" placeholderTextColor={colors.placeholder} style={styles.input} value={search} />
          {catalogLoading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : filteredItems.length === 0 ? (
            <Text style={styles.muted}>No in-stock items match the search.</Text>
          ) : filteredItems.map((item) => (
            <Pressable key={item.item_id} onPress={() => updateQuantity(item, 1)} style={styles.item}>
              <View style={styles.itemMain}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.muted}>{item.category_name}{item.sku ? ` · ${item.sku}` : ""} · {item.stock_quantity} in stock</Text>
                <Text style={styles.price}>{money(item.price)}</Text>
              </View>
              <Text style={styles.add}>Add</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Current sale · {cartLines.length} item type(s)</Text>
          {cartLines.length === 0 ? <Text style={styles.muted}>Add products from the catalog to begin.</Text> : cartLines.map(({ item, quantity }) => (
            <View key={item.item_id} style={styles.cartLine}>
              <View style={styles.itemMain}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.muted}>{money(item.price)} each · {money(item.price * quantity)}</Text>
              </View>
              <Pressable accessibilityLabel={`Remove one ${item.name}`} onPress={() => updateQuantity(item, -1)} style={styles.qty}><Text style={styles.qtyText}>−</Text></Pressable>
              <Text style={styles.quantity}>{quantity}</Text>
              <Pressable accessibilityLabel={`Add one ${item.name}`} disabled={quantity >= item.stock_quantity} onPress={() => updateQuantity(item, 1)} style={[styles.qty, quantity >= item.stock_quantity && styles.disabled]}><Text style={styles.qtyText}>+</Text></Pressable>
              <Pressable accessibilityLabel={`Remove ${item.name}`} onPress={() => setCart((current) => { const next = { ...current }; delete next[item.item_id]; return next })} style={styles.remove}><Text style={styles.removeText}>×</Text></Pressable>
            </View>
          ))}
          <TextInput autoCapitalize="characters" maxLength={15} onChangeText={setStudentId} placeholder="Student ID (optional)" placeholderTextColor={colors.placeholder} style={styles.input} value={studentId} />
          <TextInput keyboardType="decimal-pad" onChangeText={setTendered} placeholder="Cash tendered" placeholderTextColor={colors.placeholder} style={styles.input} value={tendered} />
          <View style={styles.totalRow}><Text style={styles.totalLabel}>Subtotal / Total</Text><Text style={styles.totalValue}>{money(total)}</Text></View>
          <View style={styles.totalRow}><Text style={styles.muted}>Change</Text><Text style={styles.muted}>{money(change)}</Text></View>
          <Pressable accessibilityRole="button" disabled={checkingOut || !csrfToken || !cartLines.length || Number(tendered) < total} onPress={() => void checkout()} style={[styles.button, (checkingOut || !csrfToken || !cartLines.length || Number(tendered) < total) && styles.disabled]}>
            {checkingOut ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Complete cash sale</Text>}
          </Pressable>
        </View>

        {receipt ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Receipt · {receipt.receipt_number}</Text>
            <Text style={styles.muted}>{receipt.created_at}</Text>
            {receipt.items.map((line, index) => <View key={`${line.item_name}-${index}`} style={styles.totalRow}><Text style={styles.muted}>{line.quantity} × {line.item_name}</Text><Text style={styles.muted}>{money(line.line_total)}</Text></View>)}
            <View style={styles.totalRow}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>{money(receipt.total_amount)}</Text></View>
            <View style={styles.totalRow}><Text style={styles.muted}>Cash / change</Text><Text style={styles.muted}>{money(receipt.amount_tendered || 0)} / {money(receipt.change_amount || 0)}</Text></View>
            <Pressable onPress={() => void shareReceipt()} style={styles.secondaryButton}><Text style={styles.secondaryText}>Share receipt</Text></Pressable>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sales history</Text>
          <TextInput autoCapitalize="none" onChangeText={setFrom} placeholder="From YYYY-MM-DD" placeholderTextColor={colors.placeholder} style={styles.input} value={from} />
          <TextInput autoCapitalize="none" onChangeText={setTo} placeholder="To YYYY-MM-DD" placeholderTextColor={colors.placeholder} style={styles.input} value={to} />
          <TextInput onChangeText={setHistorySearch} placeholder="Receipt, student ID, or name" placeholderTextColor={colors.placeholder} style={styles.input} value={historySearch} />
          <Pressable disabled={historyLoading} onPress={() => void refreshHistory()} style={styles.secondaryButton}><Text style={styles.secondaryText}>{historyLoading ? "Loading…" : "Filter sales"}</Text></Pressable>
          {historyLoading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : sales.length === 0 ? <Text style={styles.muted}>No sales in this date range.</Text> : (
            <>
              <Text style={styles.muted}>{sales.length} sale(s) · Total {money(sales.reduce((sum, sale) => sum + sale.total_amount, 0))}</Text>
              {sales.map((sale) => (
                <View key={sale.sale_id} style={styles.sale}>
                  <View style={styles.totalRow}><Text style={styles.cardTitle}>{sale.receipt_number}</Text><Text style={styles.price}>{money(sale.total_amount)}</Text></View>
                  <Text style={styles.muted}>{sale.created_at} · {sale.student_name || sale.student_id || "Walk-in"}</Text>
                  <Text style={styles.muted}>{sale.items.map((line) => `${line.quantity} × ${line.item_name}`).join(" · ")}</Text>
                  <Pressable onPress={async () => {
                    setError("")
                    try { setReceipt(await api.getAdminPosReceipt(sale.sale_id)) }
                    catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Could not load the receipt.") }
                  }} style={styles.receiptButton}><Text style={styles.receiptText}>View receipt</Text></Pressable>
                </View>
              ))}
            </>
          )}
        </View>
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
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 13, borderWidth: 1, marginTop: 13, padding: 14 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "900" },
  item: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", gap: 8, paddingVertical: 11 },
  itemMain: { flex: 1 },
  cardTitle: { color: colors.text, fontSize: 13, fontWeight: "800" },
  muted: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 4 },
  price: { color: colors.primary, fontSize: 13, fontWeight: "900", marginTop: 5 },
  add: { backgroundColor: "#e8f5e9", borderRadius: 8, color: colors.primary, fontSize: 11, fontWeight: "900", overflow: "hidden", paddingHorizontal: 10, paddingVertical: 7 },
  input: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 9, borderWidth: 1, color: colors.text, marginTop: 9, paddingHorizontal: 11, paddingVertical: 10 },
  cartLine: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", gap: 5, paddingVertical: 9 },
  qty: { alignItems: "center", borderColor: colors.border, borderRadius: 8, borderWidth: 1, height: 30, justifyContent: "center", width: 30 },
  qtyText: { color: colors.text, fontSize: 17, fontWeight: "800" },
  quantity: { color: colors.text, fontSize: 12, fontWeight: "800", minWidth: 18, textAlign: "center" },
  remove: { alignItems: "center", height: 30, justifyContent: "center", width: 25 },
  removeText: { color: colors.danger, fontSize: 20, fontWeight: "700" },
  totalRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  totalLabel: { color: colors.text, fontSize: 13, fontWeight: "800" },
  totalValue: { color: colors.text, fontSize: 15, fontWeight: "900" },
  button: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 10, justifyContent: "center", minHeight: 44, marginTop: 12 },
  buttonText: { color: "#fff", fontSize: 12, fontWeight: "900" },
  disabled: { opacity: 0.5 },
  secondaryButton: { alignItems: "center", backgroundColor: "#0f172a", borderRadius: 9, justifyContent: "center", minHeight: 39, marginTop: 11 },
  secondaryText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  sale: { borderTopColor: colors.border, borderTopWidth: 1, marginTop: 10, paddingTop: 10 },
  receiptButton: { alignSelf: "flex-start", marginTop: 7, paddingVertical: 4 },
  receiptText: { color: colors.primary, fontSize: 11, fontWeight: "800" },
  loading: { marginTop: 12 },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginTop: 11, overflow: "hidden", padding: 12 },
  success: { backgroundColor: "#e8f5e9", borderRadius: 10, color: colors.primary, lineHeight: 20, marginTop: 11, overflow: "hidden", padding: 12 },
})
