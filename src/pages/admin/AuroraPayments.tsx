import { useCallback, useEffect, useState } from "react"
import { AlertCircle, CheckCircle, CreditCard, Printer, Search, UserRound } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Student {
  id: string
  name: string
  program?: string
  course?: string
}

interface AuroraInfo {
  active: boolean
  event_name: string
  fee_amount: number
  is_paid: boolean
}

interface PaymentStatus {
  status: string
  message?: string
  student?: Student
  aurora_night?: AuroraInfo
}

interface Transaction {
  payment_id: number
  student_id: string
  student_name: string
  amount: number
  payment_method: string
  processed_at: string
  receipt_number?: string | null
}

interface PaymentReceipt {
  receipt?: { receipt_number: string; transaction_id: string; generated_at: string }
  student?: { id: string; name: string; program?: string; course?: string }
  payment?: {
    amount: number
    method: string
    event_name: string
    status: string
    academic_year: string
    semester: string
    processed_by: string
    processed_at: string
  }
}

async function csrfToken() {
  const response = await fetch("/php/api/csrf_token.php", { credentials: "include" })
  const data = await response.json() as { csrf_token?: string; token?: string; data?: { csrf_token?: string; token?: string } }
  const token = data.csrf_token || data.token || data.data?.csrf_token || data.data?.token
  if (!response.ok || !token) throw new Error("Unable to retrieve a security token. Refresh and try again.")
  return token
}

async function paymentStatus(studentId: string) {
  const response = await fetch(`/php/get_payment_status.php?student_id=${encodeURIComponent(studentId)}`, { credentials: "include" })
  const data = await response.json() as PaymentStatus
  if (!response.ok || data.status !== "success") throw new Error(data.message || "Student was not found.")
  return data
}

export default function AuroraPayments() {
  const [studentId, setStudentId] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("Cash")
  const [student, setStudent] = useState<Student | null>(null)
  const [aurora, setAurora] = useState<AuroraInfo | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null)
  const [transactionPage, setTransactionPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [listLoading, setListLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const loadTransactions = useCallback(async () => {
    const response = await fetch(`/php/get_transactions.php?limit=10&page=${transactionPage}&fee_type=aurora_night_2026`, { credentials: "include" })
    const data = await response.json() as { status: string; message?: string; transactions?: Transaction[]; pagination?: { current_page: number; total_pages: number } }
    if (!response.ok || data.status !== "success") throw new Error(data.message || "Unable to load recent Aurora payments.")
    setTransactions(data.transactions || [])
    setTransactionPage(data.pagination?.current_page || 1)
    setTotalPages(data.pagination?.total_pages || 1)
  }, [transactionPage])

  useEffect(() => {
    loadTransactions().catch((err: unknown) => setError(err instanceof Error ? err.message : "Unable to load payments."))
      .finally(() => setListLoading(false))
  }, [loadTransactions])

  const viewReceipt = async (paymentId: number) => {
    setError("")
    try {
      const response = await fetch(`/php/generate_receipt.php?payment_id=${paymentId}`, { credentials: "include" })
      const data = await response.json() as { status: string; message?: string } & PaymentReceipt
      if (!response.ok || data.status !== "success") throw new Error(data.message || "Unable to load payment receipt.")
      setReceipt(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load payment receipt.")
    }
  }

  const lookupStudent = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!studentId.trim()) return
    setError("")
    setNotice("")
    setStudent(null)
    setAurora(null)
    setLoading(true)
    try {
      const data = await paymentStatus(studentId.trim())
      setStudent(data.student || null)
      setAurora(data.aurora_night || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to look up student.")
    } finally {
      setLoading(false)
    }
  }

  const recordPayment = async () => {
    if (!student || !aurora || aurora.is_paid || !aurora.active) return
    setError("")
    setNotice("")
    setLoading(true)
    try {
      const csrf_token = await csrfToken()
      const response = await fetch("/php/process_payment.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          student_id: student.id,
          payment_method: paymentMethod,
          amount: "0",
          fee_type: "aurora_night_2026",
          csrf_token,
        }),
      })
      const data = await response.json() as { status: string; message?: string; receipt_number?: string }
      if (!response.ok || data.status !== "success") throw new Error(data.message || "Payment was not recorded.")
      setNotice(`${data.message || "Payment recorded."}${data.receipt_number ? ` Receipt ${data.receipt_number}.` : ""}`)
      const refreshed = await paymentStatus(student.id)
      setStudent(refreshed.student || student)
      setAurora(refreshed.aurora_night || aurora)
      await loadTransactions()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to record payment.")
    } finally {
      setLoading(false)
    }
  }

  const feeLabel = aurora ? `₱${aurora.fee_amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Event payments</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">Aurora Night Payments</h1>
        <p className="text-gray-500">Verify a student and record the configured Aurora Night cash payment.</p>
      </div>

      {(error || notice) && <div className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>
        {error ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />}{error || notice}
      </div>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
        {receipt?.receipt && receipt.payment && receipt.student && <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div><CardTitle>Receipt {receipt.receipt.receipt_number}</CardTitle><CardDescription>{receipt.payment.event_name} · {receipt.receipt.generated_at}</CardDescription></div>
            <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print</Button>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-medium">Student:</span> {receipt.student.name} ({receipt.student.id})</p>
            <p><span className="font-medium">Payment:</span> ₱{Number(receipt.payment.amount).toFixed(2)} · {receipt.payment.method} · {receipt.payment.status}</p>
            <p><span className="font-medium">Period:</span> {receipt.payment.academic_year} · {receipt.payment.semester} semester</p>
            <p><span className="font-medium">Processed by:</span> {receipt.payment.processed_by || "System"} · {receipt.payment.processed_at || "—"}</p>
            <p className="text-xs text-gray-500">{receipt.receipt.transaction_id}</p>
          </CardContent>
        </Card>}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-amber-600" />Student payment</CardTitle>
            <CardDescription>Use the registered student ID. Fee and eligibility are confirmed by the server.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={lookupStudent} className="flex gap-2">
              <Input value={studentId} onChange={(event) => setStudentId(event.target.value)} maxLength={15} placeholder="Student ID" required />
              <Button type="submit" variant="outline" disabled={loading}><Search className="mr-2 h-4 w-4" />Lookup</Button>
            </form>
            {student && aurora ? (
              <div className="rounded-xl border bg-amber-50/60 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <UserRound className="mt-1 h-5 w-5 text-amber-700" />
                    <div><p className="font-semibold text-gray-900">{student.name}</p><p className="text-sm text-gray-600">{student.id}</p><p className="text-xs text-gray-500">{[student.program, student.course].filter(Boolean).join(" · ")}</p></div>
                  </div>
                  <Badge variant={aurora.is_paid ? "success" : aurora.active ? "outline" : "secondary"}>{aurora.is_paid ? "Paid" : aurora.active ? "Unpaid" : "Inactive"}</Badge>
                </div>
                <div className="mt-5 flex items-end justify-between border-t border-amber-200 pt-4">
                  <div className="space-y-2">
                    <div><p className="text-xs uppercase tracking-wider text-gray-500">{aurora.event_name}</p><p className="mt-1 text-xl font-bold text-amber-800">{feeLabel}</p></div>
                    <label className="block text-xs font-medium text-gray-600">Payment method
                      <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="mt-1 block h-9 rounded-md border bg-white px-2 text-sm text-gray-900">
                        <option>Cash</option><option>GCash</option><option>Bank Transfer</option><option>Other</option>
                      </select>
                    </label>
                  </div>
                  <Button onClick={recordPayment} disabled={loading || aurora.is_paid || !aurora.active}>
                    {loading ? "Recording…" : aurora.is_paid ? "Already paid" : aurora.active ? "Record cash payment" : "Payments inactive"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-gray-500">Look up a student to review their Aurora payment status.</div>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader><CardTitle>Aurora Night</CardTitle><CardDescription>Payment event configured in Squared Pay.</CardDescription></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>Payments are posted through the existing payment processor. Its configured event amount, active status, duplicate guard, and receipt behavior remain authoritative.</p>
            <div className="rounded-lg border bg-gray-50 p-3 text-gray-600">Cash only · the actual amount is read and validated by the server.</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Aurora payments</CardTitle><CardDescription>Latest transactions returned by the existing payment history API.</CardDescription></CardHeader>
        <CardContent>
          {listLoading ? <p className="py-5 text-center text-sm text-gray-500">Loading transactions…</p> : transactions.length === 0 ? (
            <p className="py-5 text-center text-sm text-gray-500">No Aurora payments found.</p>
          ) : (
            <div className="space-y-3">{transactions.map((transaction) => (
              <div key={transaction.payment_id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                <div><p className="font-medium">{transaction.student_name}</p><p className="text-xs text-gray-500">{transaction.student_id} · {transaction.receipt_number || "Receipt pending"}</p></div>
                <div className="flex items-center gap-3">
                  <div className="text-right"><p className="font-semibold">₱{transaction.amount.toFixed(2)}</p><p className="text-xs text-gray-500">{transaction.processed_at ? new Date(transaction.processed_at).toLocaleString() : "—"} · {transaction.payment_method}</p></div>
                  <Button size="sm" variant="outline" onClick={() => viewReceipt(transaction.payment_id)}>Receipt</Button>
                </div>
              </div>
            ))}</div>
          )}
          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <Button variant="outline" size="sm" disabled={transactionPage <= 1 || listLoading} onClick={() => setTransactionPage((page) => page - 1)}>Previous</Button>
            <span className="text-xs text-gray-500">Page {transactionPage} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={transactionPage >= totalPages || listLoading} onClick={() => setTransactionPage((page) => page + 1)}>Next</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
