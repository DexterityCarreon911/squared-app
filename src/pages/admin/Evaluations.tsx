import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, ClipboardList, Eye, Plus, Star } from "lucide-react"

interface Evaluation {
  id: number
  event: string
  responses: number
  avgRating: number
  status: "active" | "closed"
  created: string
}

export default function AdminEvaluations() {
  const [evaluations] = useState<Evaluation[]>([
    { id: 1, event: "Sports Fest 2026", responses: 128, avgRating: 4.5, status: "active", created: "2026-06-15" },
    { id: 2, event: "Foundation Day 2026", responses: 95, avgRating: 4.2, status: "active", created: "2026-05-20" },
    { id: 3, event: "CSSG General Assembly", responses: 67, avgRating: 3.8, status: "closed", created: "2026-04-10" },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evaluations</h1>
          <p className="text-gray-500">Manage event evaluation forms and view results.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Create Evaluation
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <ClipboardList className="w-5 h-5 text-[#187C19]" />
            <div>
              <p className="text-xl font-bold">{evaluations.length}</p>
              <p className="text-xs text-gray-500">Total Evaluations</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xl font-bold">{evaluations.reduce((a, e) => a + e.responses, 0)}</p>
              <p className="text-xs text-gray-500">Total Responses</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Star className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-xl font-bold">
                {(evaluations.reduce((a, e) => a + e.avgRating, 0) / evaluations.length).toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">Avg Rating</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evaluation Forms</CardTitle>
          <CardDescription>View and manage evaluation forms for events.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-gray-500">Event</th>
                  <th className="pb-3 font-medium text-gray-500">Status</th>
                  <th className="pb-3 font-medium text-gray-500">Responses</th>
                  <th className="pb-3 font-medium text-gray-500">Avg Rating</th>
                  <th className="pb-3 font-medium text-gray-500">Created</th>
                  <th className="pb-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map((ev) => (
                  <tr key={ev.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{ev.event}</td>
                    <td className="py-3">
                      <Badge variant={ev.status === "active" ? "success" : "secondary"}>
                        {ev.status}
                      </Badge>
                    </td>
                    <td className="py-3">{ev.responses}</td>
                    <td className="py-3">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {ev.avgRating}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{ev.created}</td>
                    <td className="py-3">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
