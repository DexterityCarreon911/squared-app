import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Vote, Plus, Pencil, Trash2, BarChart3, Calendar, Users } from "lucide-react"

interface Election {
  id: number
  title: string
  status: "active" | "upcoming" | "ended"
  candidates: number
  voters: number
  endDate: string
}

export default function VotingManagement() {
  const [elections] = useState<Election[]>([
    { id: 1, title: "CSSG Elections 2026", status: "active", candidates: 8, voters: 245, endDate: "2026-08-15" },
    { id: 2, title: "Best Program Award", status: "upcoming", candidates: 5, voters: 0, endDate: "2026-09-01" },
    { id: 3, title: "Mr. & Ms. DCC 2025", status: "ended", candidates: 12, voters: 512, endDate: "2025-12-20" },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voting Management</h1>
          <p className="text-gray-500">Manage elections, candidates, and view results.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Create Election
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-[#187C19]" />
            <div>
              <p className="text-xl font-bold">{elections.length}</p>
              <p className="text-xs text-gray-500">Total Elections</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xl font-bold">{elections.reduce((a, e) => a + e.candidates, 0)}</p>
              <p className="text-xs text-gray-500">Total Candidates</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Vote className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-xl font-bold">{elections.reduce((a, e) => a + e.voters, 0)}</p>
              <p className="text-xs text-gray-500">Total Votes Cast</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Elections</CardTitle>
          <CardDescription>Create and manage voting events.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-gray-500">Title</th>
                  <th className="pb-3 font-medium text-gray-500">Status</th>
                  <th className="pb-3 font-medium text-gray-500">Candidates</th>
                  <th className="pb-3 font-medium text-gray-500">Votes</th>
                  <th className="pb-3 font-medium text-gray-500">End Date</th>
                  <th className="pb-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {elections.map((election) => (
                  <tr key={election.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{election.title}</td>
                    <td className="py-3">
                      <Badge variant={
                        election.status === "active" ? "success" :
                        election.status === "upcoming" ? "warning" : "secondary"
                      }>
                        {election.status}
                      </Badge>
                    </td>
                    <td className="py-3">{election.candidates}</td>
                    <td className="py-3">{election.voters}</td>
                    <td className="py-3 text-gray-500">{election.endDate}</td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm"><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                      </div>
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
