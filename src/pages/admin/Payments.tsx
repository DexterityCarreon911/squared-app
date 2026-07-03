import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, CreditCard, Download, Filter } from "lucide-react"

interface Payment {
  id: number
  student_id: string
  student_name: string
  description: string
  amount: number
  status: string
  due_date: string
  paid_at: string
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch("/admin/php/get_payments.php", {
          credentials: "include",
        })
        if (res.redirected) {
          window.location.href = "/admin"
          return
        }
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

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase()
    return (
      (p.student_id.toLowerCase().includes(q) || p.student_name.toLowerCase().includes(q)) &&
      (statusFilter === "all" || p.status === statusFilter)
    )
  })

  const totalCollected = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + parseFloat(String(p.amount)), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500">Manage student payments and fees.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-1" /> Create Payment
        </Button>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Collected</p>
              <p className="text-2xl font-bold text-gray-900">₱{totalCollected.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Search by student ID or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="h-9 rounded-lg border border-input bg-transparent px-3 py-1 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading payments...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No payments found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium">Student</th>
                    <th className="pb-3 font-medium">Description</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Due Date</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Paid At</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((payment) => (
                    <tr key={payment.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3">
                        <div>
                          <p className="font-medium">{payment.student_name}</p>
                          <p className="text-xs text-gray-400">{payment.student_id}</p>
                        </div>
                      </td>
                      <td className="py-3">{payment.description}</td>
                      <td className="py-3 font-medium">₱{parseFloat(String(payment.amount)).toFixed(2)}</td>
                      <td className="py-3">{payment.due_date}</td>
                      <td className="py-3">
                        <Badge variant={payment.status === "paid" ? "success" : payment.status === "overdue" ? "destructive" : "warning"}>
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="py-3">{payment.paid_at || "—"}</td>
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
