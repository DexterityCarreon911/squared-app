import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wallet, CreditCard, Sparkles, Download } from "lucide-react"

interface Payment {
  id: number
  description: string
  amount: number
  status: string
  due_date: string
  paid_at: string
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch("/php/get_payments.php", {
          credentials: "include",
        })
        const data = await res.json()
        if (data.status === "success") {
          setPayments(data.payments || [])
        }
      } catch (err) {
        console.error("Failed to fetch payments", err)
      }
      setLoading(false)
    }
    fetchPayments()
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
            <div className="text-center py-8 text-gray-500">Loading payments...</div>
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
                    <th className="pb-3 font-medium">Due Date</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b last:border-0">
                      <td className="py-3">{payment.description}</td>
                      <td className="py-3 font-medium">₱{parseFloat(String(payment.amount)).toFixed(2)}</td>
                      <td className="py-3">{payment.due_date}</td>
                      <td className="py-3">
                        <Badge variant={payment.status === "paid" ? "success" : "warning"}>
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="py-3">
                        {payment.status === "paid" && (
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
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
