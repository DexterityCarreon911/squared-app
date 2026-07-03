import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, ArrowUpDown } from "lucide-react"

interface Student {
  id: number
  student_id: string
  first_name: string
  middle_name: string
  last_name: string
  suffix: string
  sex: string
  program: string
  course: string
  email: string
  avatar: string
  status: string
  created_at: string
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<string>("student_id")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("/admin/php/get_students.php", {
          credentials: "include",
        })
        if (res.redirected) {
          window.location.href = "/admin"
          return
        }
        const data = await res.json()
        if (data.status === "success") {
          setStudents(data.students || [])
        }
      } catch (err) {
        console.error("Failed to fetch students", err)
      }
      setLoading(false)
    }
    fetchStudents()
  }, [])

  const filtered = students
    .filter((s) => {
      const q = search.toLowerCase()
      return (
        s.student_id.toLowerCase().includes(q) ||
        s.first_name.toLowerCase().includes(q) ||
        s.last_name.toLowerCase().includes(q) ||
        s.course.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      const aVal = (a as any)[sortBy]?.toString().toLowerCase() ?? ""
      const bVal = (b as any)[sortBy]?.toString().toLowerCase() ?? ""
      return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    })

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500">Manage all student records.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-1" /> Add Student
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading students...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No students found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium cursor-pointer select-none" onClick={() => toggleSort("student_id")}>
                      <span className="flex items-center gap-1">
                        Student ID <ArrowUpDown className="w-3 h-3" />
                      </span>
                    </th>
                    <th className="pb-3 font-medium cursor-pointer select-none" onClick={() => toggleSort("last_name")}>
                      <span className="flex items-center gap-1">
                        Name <ArrowUpDown className="w-3 h-3" />
                      </span>
                    </th>
                    <th className="pb-3 font-medium">Course</th>
                    <th className="pb-3 font-medium">Sex</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((student) => (
                    <tr key={student.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-medium">{student.student_id}</td>
                      <td className="py-3">
                        {student.first_name} {student.last_name}
                        {student.suffix && `, ${student.suffix}`}
                      </td>
                      <td className="py-3 text-gray-500">{student.course}</td>
                      <td className="py-3">{student.sex}</td>
                      <td className="py-3">
                        <Badge variant={student.status === "active" ? "success" : "secondary"}>
                          {student.status}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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
