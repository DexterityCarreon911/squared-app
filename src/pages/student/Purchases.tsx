import { useCallback, useEffect, useState } from "react"
import { AlertCircle, PackageCheck, Printer, ReceiptText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PurchaseLine {
  item_name: string
  unit_price: number
  quantity: number
  line_total: number
}

interface Purchase {
  sale_id: number
  receipt_number: string
  total_amount: number
  payment_method: string
  student_id: string | null
  created_at: string
  items: PurchaseLine[]
  amount_tendered?: number
  change_amount?: number
}

const POS_API = "/admin/php/pos_api.php"
const money = (value: number) => `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function Purchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [totalSpent, setTotalSpent] = useState(0)
  const [receipt, setReceipt] = useState<Purchase | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadPurchases = useCallback(async () => {
    const response = await fetch(`${POS_API}?action=history`, { credentials: "include" })
    const data = await response.json() as { status: string; message?: string; sales?: Purchase[]; total_spent?: number }
    if (!response.ok || data.status !== "success") throw new Error(data.message || "Unable to load purchase history.")
    setPurchases(data.sales || [])
    setTotalSpent(data.total_spent || 0)
  }, [])

  useEffect(() => {
    loadPurchases().catch((err: unknown) => setError(err instanceof Error ? err.message : "Unable to load purchases."))
      .finally(() => setLoading(false))
  }, [loadPurchases])

  const openReceipt = async (saleId: number) => {
    setError("")
    try {
      const response = await fetch(`${POS_API}?action=receipt&sale_id=${saleId}`, { credentials: "include" })
      const data = await response.json() as { status: string; message?: string; sale?: Purchase }
      if (!response.ok || data.status !== "success" || !data.sale) throw new Error(data.message || "Receipt not found.")
      setReceipt(data.sale)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to open receipt.")
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#187C19]">Student portal</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">My Purchases</h1>
          <p className="mt-1 text-gray-500">Your campus merchandise purchase history and receipts.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Card><CardContent className="p-4"><p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Purchases</p><p className="mt-1 text-xl font-bold text-[#187C19]">{purchases.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total spent</p><p className="mt-1 text-xl font-bold text-[#187C19]">{money(totalSpent)}</p></CardContent></Card>
        </div>
      </div>

      {error && <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}

      {receipt && (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div><CardTitle className="flex items-center gap-2"><ReceiptText className="h-5 w-5 text-[#187C19]" />Receipt {receipt.receipt_number}</CardTitle><CardDescription>{new Date(receipt.created_at).toLocaleString()}</CardDescription></div>
            <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {receipt.items.map((line, index) => <div key={`${line.item_name}-${index}`} className="flex justify-between text-sm"><span>{line.quantity} × {line.item_name}</span><span>{money(line.line_total)}</span></div>)}
            <div className="flex justify-between border-t pt-3 font-semibold"><span>Total</span><span>{money(receipt.total_amount)}</span></div>
            {typeof receipt.change_amount === "number" && <div className="flex justify-between text-sm text-gray-500"><span>Change</span><span>{money(receipt.change_amount)}</span></div>}
          </CardContent>
        </Card>
      )}

      {loading ? <p className="py-12 text-center text-gray-500">Loading purchases…</p> : purchases.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <PackageCheck className="mx-auto h-10 w-10 text-gray-300" />
          <h2 className="mt-4 font-semibold text-gray-900">No purchases yet</h2>
          <p className="mt-1 text-sm text-gray-500">Your campus merchandise purchases will appear here after checkout.</p>
        </CardContent></Card>
      ) : (
        <section className="space-y-4">
          {purchases.map((purchase) => (
            <Card key={purchase.sale_id}>
              <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 border-b">
                <div><p className="text-xs font-bold uppercase tracking-wider text-gray-400">Receipt</p><CardTitle className="mt-1 text-base">{purchase.receipt_number}</CardTitle><CardDescription>{new Date(purchase.created_at).toLocaleString()}</CardDescription></div>
                <div className="text-right"><p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total</p><p className="text-2xl font-bold text-[#187C19]">{money(purchase.total_amount)}</p></div>
              </CardHeader>
              <CardContent className="space-y-2 pt-4">
                {purchase.items.map((line, index) => <div key={`${purchase.sale_id}-${index}`} className="flex justify-between gap-4 text-sm"><span>{line.quantity} × {line.item_name}</span><span className="font-medium">{money(line.line_total)}</span></div>)}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-dashed pt-3 text-xs text-gray-500"><span>{purchase.payment_method} payment</span><Button size="sm" variant="ghost" onClick={() => openReceipt(purchase.sale_id)}>View receipt</Button></div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  )
}
