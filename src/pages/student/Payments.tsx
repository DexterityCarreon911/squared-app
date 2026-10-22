import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, CreditCard, Sparkles } from "lucide-react"
import ErrorState from "@/components/ErrorState"
import LoadingState from "@/components/LoadingState"

interface Payment {
  payment_id: number
  description: string
  amount: number
  status: string
  academic_year: string
  semester: string
  paid_at: string
  receipt_number: string | null
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPayments = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/php/get_payment_status.php", { credentials: "include" })
      if (!res.ok) throw new Error("Could not load payment history.")

      const data = await res.json()
      if (data.status !== "success" || !Array.isArray(data.payment_history)) {
        throw new Error(data.message || "Could not load payment history.")
      }

      const eventNames = new Map<string, string>(
        (Array.isArray(data.events) ? data.events : []).map(
          (event: { slug: string; event_name: string }): [string, string] => [
            event.slug,
            event.event_name,
          ]
        )
      )
      if (data.aurora_night?.event_name) {
        eventNames.set("aurora_night_2026", data.aurora_night.event_name)
      }

      setPayments(data.payment_history.map((payment: {
        payment_id: number
        amount: number
        status: string
        fee_type: string
        academic_year: string
        semester: string
        processed_at: string | null
        receipt: { receipt_number: string } | null
      }) => ({
        payment_id: payment.payment_id,
        description: eventNames.get(payment.fee_type) || "CSSG Membership",
        amount: Number(payment.amount),
        status: payment.status,
        academic_year: payment.academic_year,
        semester: payment.semester,
        paid_at: payment.processed_at || "",
        receipt_number: payment.receipt?.receipt_number || null,
      })))
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Could not load payment history.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchPayments()
  }, [])

  const totalDue = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + parseFloat(String(p.amount)), 0)

  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + parseFloat(String(p.amount)), 0)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500">View and manage your payment records.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">₱{totalDue.toFixed(2)}</p>
              <p className="text-sm text-gray-500">Total Due</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">₱{totalPaid.toFixed(2)}</p>
              <p className="text-sm text-gray-500">Total Paid</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Records */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingState message="Loading payments..." />
          ) : error ? (
            <ErrorState message={error} onRetry={() => void fetchPayments()} />
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No payment records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium">Description</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Period</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.payment_id} className="border-b last:border-0">
                      <td className="py-3">{payment.description}</td>
                      <td className="py-3 font-medium">₱{payment.amount.toFixed(2)}</td>
                      <td className="py-3">{payment.semester} Semester, {payment.academic_year}</td>
                      <td className="py-3">
                        <Badge variant={payment.status === "paid" ? "success" : "warning"}>
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="py-3">{payment.receipt_number || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
