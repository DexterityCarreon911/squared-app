import { useState, useEffect } from "react"
import LoadingState from "@/components/LoadingState"
import ErrorState from "@/components/ErrorState"
import AnimatedNumber from "@/components/AnimatedNumber"

interface ProgramCount {
  program: string
  count: number
  color: string
  label: string
  link: string
}

const PROGRAMS: ProgramCount[] = [
  { program: "CBA", count: 0, color: "bg-[#0D5B11]", label: "CBA", link: "https://www.facebook.com/profile.php?id=100085423594230" },
  { program: "CELA", count: 0, color: "bg-[#187C19]", label: "CELA", link: "https://www.facebook.com/profile.php?id=61564257299768" },
  { program: "CJE", count: 0, color: "bg-[#69B41E]", label: "CJE", link: "https://www.facebook.com/dcccje2009" },
  { program: "HME", count: 0, color: "bg-[#8DC71E]", label: "HME", link: "https://www.facebook.com/profile.php?id=100082753567230" },
  { program: "ITE", count: 0, color: "bg-[#B8D53D]", label: "ITE", link: "https://www.facebook.com/Ite.Sincotecs" },
]

export default function StudentCountsSection() {
  const [totalStudents, setTotalStudents] = useState<number | null>(null)
  const [programCounts, setProgramCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchCounts = async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch("/student_counts_json.php", { credentials: "include" })
      if (!res.ok) throw new Error("Failed to fetch")
      const data: { total?: number } & Record<string, number | undefined> = await res.json()
      if (data.total !== undefined) setTotalStudents(data.total)
      setProgramCounts(Object.fromEntries(
        PROGRAMS.map((program) => [program.program, Number(data[program.program] || 0)])
      ))
    } catch {
      setError(true)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCounts()
  }, [])

  if (loading) return <LoadingState message="Loading student counts..." />
  if (error) return <ErrorState message="Could not load student data." onRetry={fetchCounts} />

  return (
    <section className="py-8 md:py-10 bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
          {/* Total Students */}
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-[#2f4f1f]">
              {totalStudents !== null ? <AnimatedNumber value={totalStudents} /> : "—"}
            </div>
            <div className="text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wide mt-1">
              Registered Students
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-16 bg-gray-300" />

          {/* Program Counts */}
          {PROGRAMS.map((prog) => {
            const count = programCounts[prog.program] ?? 0
            return (
              <div key={prog.program} className="text-center">
                <div className="text-lg md:text-xl font-bold text-gray-900">
                  <AnimatedNumber value={count} />
                </div>
                <a
                  href={prog.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-block ${prog.color} text-white text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wide mt-1 hover:opacity-90 transition-opacity`}
                >
                  {prog.label}
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
