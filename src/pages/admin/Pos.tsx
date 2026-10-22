import { useCallback, useEffect, useMemo, useState } from "react"
import { AlertCircle, Check, Minus, Plus, Printer, Search, ShoppingCart, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface PosItem {
  item_id: number
  category_id: number
  name: string
  sku: string | null
  description: string | null
  price: number
  stock_quantity: number
  is_active: boolean
  category_name: string
}

interface SaleLine {
  item_name: string
  unit_price: number
  quantity: number
  line_total: number
}

interface Sale {
  sale_id: number
  receipt_number: string
  total_amount: number
  payment_method: string
  student_id: string | null
  student_name: string | null
  created_at: string
  items: SaleLine[]
  amount_tendered?: number
  change_amount?: number
}

type ApiResult<T> = {
  status: string
  message: string
} & T

const POS_API = "/admin/php/pos_api.php"
const money = (value: number) => `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

async function request<T extends { status: string; message: string }>(url: string, body?: Record<string, string>) {
  const response = await fetch(url, {
    method: body ? "POST" : "GET",
    credentials: "include",
    headers: body ? { "Content-Type": "application/x-www-form-urlencoded" } : undefined,
    body: body ? new URLSearchParams(body) : undefined,
  })
  const data = await response.json() as T
  if (!response.ok || data.status !== "success") throw new Error(data.message || "Request failed.")
  return data
}

async function fetchCsrfToken() {
  const response = await fetch("/php/api/csrf_token.php", { credentials: "include" })
  const data = await response.json() as { csrf_token?: string; token?: string; data?: { csrf_token?: string; token?: string } }
  const token = data.csrf_token || data.token || data.data?.csrf_token || data.data?.token
  if (!response.ok || !token) throw new Error("Unable to retrieve a security token. Refresh the page and try again.")
  return token
}

export default function Pos() {
  const [items, setItems] = useState<PosItem[]>([])
  const [cart, setCart] = useState<Record<number, { item: PosItem; quantity: number }>>({})
  const [sales, setSales] = useState<Sale[]>([])
  const [search, setSearch] = useState("")
  const [studentId, setStudentId] = useState("")
  const [tendered, setTendered] = useState("")
  const [dateFrom, setDateFrom] = useState(() => new Date().toISOString().slice(0, 10))
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [historySearch, setHistorySearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [receipt, setReceipt] = useState<Sale | null>(null)

  const loadCatalog = useCallback(async () => {
    const data = await request<ApiResult<{ items: PosItem[] }>>(`${POS_API}?action=catalog`)
    setItems(data.items || [])
  }, [])

  const loadHistory = useCallback(async () => {
    const query = new URLSearchParams({
      action: "history",
      from: dateFrom,
      to: dateTo,
      search: historySearch,
    })
    const data = await request<ApiResult<{ sales: Sale[] }>>(`${POS_API}?${query}`)
    setSales(data.sales || [])
  }, [dateFrom, dateTo, historySearch])

  useEffect(() => {
    Promise.all([loadCatalog(), loadHistory()])
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Unable to load the POS."))
      .finally(() => setLoading(false))
  }, [loadCatalog, loadHistory])

  const cartLines = Object.values(cart)
  const total = useMemo(
    () => cartLines.reduce((sum, line) => sum + line.item.price * line.quantity, 0),
    [cartLines],
  )
  const change = Math.max(0, (Number(tendered) || 0) - total)
  const filteredItems = items.filter((item) => item.is_active && item.stock_quantity > 0)
    .filter((item) => `${item.name} ${item.sku || ""} ${item.category_name}`.toLowerCase().includes(search.toLowerCase()))
  const dailyTotal = sales.reduce((sum, sale) => sum + sale.total_amount, 0)

  const adjustItem = (item: PosItem, delta: number) => {
    setCart((current) => {
      const next = { ...current }
      const quantity = (next[item.item_id]?.quantity || 0) + delta
      if (quantity <= 0) delete next[item.item_id]
      else if (quantity <= item.stock_quantity) next[item.item_id] = { item, quantity }
      return next
    })
  }

  const handleCheckout = async (event: React.FormEvent) => {
    event.preventDefault()
    if (cartLines.length === 0) return
    setError("")
    setNotice("")
    setCheckingOut(true)
    try {
      const csrf_token = await fetchCsrfToken()
      const result = await request<ApiResult<{ sale_id: number }>>(POS_API, {
        action: "checkout",
        csrf_token,
        cart_json: JSON.stringify(cartLines.map(({ item, quantity }) => ({ item_id: item.item_id, quantity }))),
        payment_method: "Cash",
        amount_tendered: tendered,
        student_id: studentId.trim(),
      })
      const receiptData = await request<ApiResult<{ sale: Sale }>>(`${POS_API}?action=receipt&sale_id=${result.sale_id}`)
      setReceipt(receiptData.sale)
      setCart({})
      setTendered("")
      setStudentId("")
      setNotice("Sale completed and inventory updated.")
      await Promise.all([loadCatalog(), loadHistory()])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.")
    } finally {
      setCheckingOut(false)
    }
  }

  const refreshHistory = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    try {
      await loadHistory()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load transaction history.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enterprise POS</h1>
          <p className="text-gray-500">Sell catalog items, track stock, and issue receipts.</p>
        </div>
        <Badge variant="outline">{items.filter((item) => item.is_active).length} active items</Badge>
      </div>

      {(error || notice) && (
        <div className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>
          {error ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <Check className="mt-0.5 h-4 w-4 shrink-0" />}
          {error || notice}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-[#187C19]" />Catalog</CardTitle>
            <CardDescription>Tap an in-stock item to add it to the sale.</CardDescription>
            <div className="relative pt-2">
              <Search className="absolute left-3 top-5 h-4 w-4 text-gray-400" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Search item, SKU, or category" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? <p className="py-8 text-center text-sm text-gray-500">Loading catalog…</p> : filteredItems.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">No available catalog items match this search.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => (
                  <button key={item.item_id} type="button" onClick={() => adjustItem(item, 1)} className="rounded-xl border p-4 text-left transition hover:border-[#187C19] hover:bg-green-50">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-gray-900">{item.name}</span>
                      <Badge variant="secondary" className="shrink-0">{item.stock_quantity} left</Badge>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{item.category_name}{item.sku ? ` · ${item.sku}` : ""}</p>
                    <p className="mt-3 text-lg font-bold text-[#187C19]">{money(item.price)}</p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit xl:sticky xl:top-5">
          <CardHeader>
            <CardTitle>Current sale</CardTitle>
            <CardDescription>{cartLines.length} different item{cartLines.length === 1 ? "" : "s"}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCheckout} className="space-y-4">
              {cartLines.length === 0 ? <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">Add items from the catalog to begin.</div> : (
                <div className="max-h-72 space-y-3 overflow-auto">
                  {cartLines.map(({ item, quantity }) => (
                    <div key={item.item_id} className="flex items-center gap-2 border-b pb-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">{money(item.price)} each</p>
                      </div>
                      <button type="button" onClick={() => adjustItem(item, -1)} aria-label={`Remove one ${item.name}`} className="rounded p-1 hover:bg-gray-100"><Minus className="h-4 w-4" /></button>
                      <span className="w-5 text-center text-sm">{quantity}</span>
                      <button type="button" onClick={() => adjustItem(item, 1)} disabled={quantity >= item.stock_quantity} aria-label={`Add one ${item.name}`} className="rounded p-1 hover:bg-gray-100 disabled:opacity-40"><Plus className="h-4 w-4" /></button>
                      <span className="w-20 text-right text-sm font-semibold">{money(item.price * quantity)}</span>
                      <button type="button" onClick={() => setCart((current) => { const next = { ...current }; delete next[item.item_id]; return next })} aria-label={`Remove ${item.name}`} className="rounded p-1 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium">Student ID (optional)</label>
                <Input value={studentId} onChange={(event) => setStudentId(event.target.value)} maxLength={15} placeholder="Attach sale to a student" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Cash tendered</label>
                <Input type="number" min="0" step="0.01" value={tendered} onChange={(event) => setTendered(event.target.value)} required />
              </div>
              <div className="space-y-1 border-t pt-3 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{money(total)}</span></div>
                <div className="flex justify-between"><span>Change</span><span>{money(change)}</span></div>
                <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{money(total)}</span></div>
              </div>
              <Button type="submit" className="w-full" disabled={checkingOut || cartLines.length === 0 || Number(tendered) < total}>
                {checkingOut ? "Completing sale…" : "Complete cash sale"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {receipt && (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div><CardTitle>Receipt {receipt.receipt_number}</CardTitle><CardDescription>{new Date(receipt.created_at).toLocaleString()}</CardDescription></div>
            <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {receipt.items.map((line, index) => <div key={`${line.item_name}-${index}`} className="flex justify-between text-sm"><span>{line.quantity} × {line.item_name}</span><span>{money(line.line_total)}</span></div>)}
            <div className="flex justify-between border-t pt-3 font-semibold"><span>Total</span><span>{money(receipt.total_amount)}</span></div>
            <div className="flex justify-between text-sm text-gray-500"><span>Cash tendered</span><span>{money(receipt.amount_tendered || 0)}</span></div>
            <div className="flex justify-between text-sm text-gray-500"><span>Change</span><span>{money(receipt.change_amount || 0)}</span></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Sales history</CardTitle>
          <CardDescription>{sales.length} sale(s) · Total {money(dailyTotal)}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={refreshHistory} className="mb-4 grid gap-2 sm:grid-cols-[1fr_1fr_2fr_auto]">
            <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} aria-label="From date" />
            <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} aria-label="To date" />
            <Input value={historySearch} onChange={(event) => setHistorySearch(event.target.value)} placeholder="Receipt, student ID, or student name" />
            <Button type="submit" variant="outline">Filter</Button>
          </form>
          {sales.length === 0 ? <p className="py-5 text-center text-sm text-gray-500">No sales for this date range.</p> : (
            <div className="space-y-3">
              {sales.map((sale) => (
                <article key={sale.sale_id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div><p className="font-semibold">{sale.receipt_number}</p><p className="text-xs text-gray-500">{new Date(sale.created_at).toLocaleString()} · {sale.student_name || sale.student_id || "Walk-in"}</p></div>
                    <p className="font-bold">{money(sale.total_amount)}</p>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{sale.items.map((line) => `${line.quantity} × ${line.item_name}`).join(" · ")}</p>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
