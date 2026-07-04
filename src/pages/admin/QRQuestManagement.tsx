import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Gamepad2, Plus, Pencil, Trash2, Users, Target, Search } from "lucide-react"

interface Quest {
  id: number
  title: string
  code: string
  points: number
  scans: number
  active: boolean
}

export default function QRQuestManagement() {
  const [quests] = useState<Quest[]>([
    { id: 1, title: "Library Hunt", code: "LIB2026", points: 50, scans: 128, active: true },
    { id: 2, title: "Campus Tour", code: "CAMPUS26", points: 30, scans: 95, active: true },
    { id: 3, title: "Sports Fest Quiz", code: "SPORTS1", points: 100, scans: 212, active: false },
  ])
  const [search, setSearch] = useState("")

  const filtered = quests.filter((q) =>
    q.title.toLowerCase().includes(search.toLowerCase()) ||
    q.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR Quest Management</h1>
          <p className="text-gray-500">Create and manage QR quests for students.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Create Quest
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Gamepad2 className="w-5 h-5 text-[#187C19]" />
            <div>
              <p className="text-xl font-bold">{quests.length}</p>
              <p className="text-xs text-gray-500">Total Quests</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Target className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-xl font-bold">{quests.reduce((a, q) => a + q.scans, 0)}</p>
              <p className="text-xs text-gray-500">Total Scans</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xl font-bold">{quests.filter((q) => q.active).length}</p>
              <p className="text-xs text-gray-500">Active Quests</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>QR Quests</CardTitle>
          <CardDescription>Manage quest codes, points, and activation status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input className="pl-9" placeholder="Search quests..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-gray-500">Title</th>
                  <th className="pb-3 font-medium text-gray-500">Code</th>
                  <th className="pb-3 font-medium text-gray-500">Points</th>
                  <th className="pb-3 font-medium text-gray-500">Scans</th>
                  <th className="pb-3 font-medium text-gray-500">Status</th>
                  <th className="pb-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((quest) => (
                  <tr key={quest.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{quest.title}</td>
                    <td className="py-3 font-mono text-[#187C19] font-bold">{quest.code}</td>
                    <td className="py-3">{quest.points}</td>
                    <td className="py-3">{quest.scans}</td>
                    <td className="py-3">
                      <Badge variant={quest.active ? "success" : "secondary"}>
                        {quest.active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
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
