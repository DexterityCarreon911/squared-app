import { useState, useEffect } from "react"
import {
  Users, Calendar, Megaphone, CreditCard, TrendingUp,
  ChevronDown, ChevronRight,
} from "lucide-react"

interface ProgramStats {
  total: number
  male: number
  female: number
}

interface CourseStats {
  total: number
  male: number
  female: number
}

export default function AdminDashboard() {
  const [totalStudents, setTotalStudents] = useState(0)
  const [maleCount, setMaleCount] = useState(0)
  const [femaleCount, setFemaleCount] = useState(0)
  const [programStats, setProgramStats] = useState<Record<string, ProgramStats>>({})
  const [courseStats, setCourseStats] = useState<Record<string, CourseStats>>({})
  const [loading, setLoading] = useState(true)
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null)

  const programCourses: Record<string, string[]> = {
    ITE: ["Bachelor of Science in Information Technology"],
    CELA: [
      "Bachelor of Arts Major in History",
      "Bachelor of Arts Major in Political Science",
      "Bachelor of Elementary Education – Generalist",
      "Bachelor of Special Needs Education",
      "Bachelor of Secondary Education Major in English",
      "Bachelor of Secondary Education Major in Mathematics",
      "Bachelor of Secondary Education Major in Science",
      "Bachelor of Secondary Education Major in Social Studies",
      "Bachelor of Technology and Livelihood Education Major in Home Economics",
    ],
    CBA: [
      "Bachelor of Science in Business Administration Major in Financial Management",
      "Bachelor of Science in Business Administration Major in Human Resource Management",
      "Bachelor of Science in Business Administration Major in Marketing Management",
    ],
    HME: ["Bachelor of Science in Hospitality Management"],
    CJE: ["Bachelor of Science in Criminology"],
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch overall stats
        const res = await fetch("/admin/php/dashboard_stats.php", {
          credentials: "include",
        })
        if (res.redirected) {
          window.location.href = "/admin"
          return
        }
        const data = await res.json()
        if (data.status === "success" && data.stats) {
          setTotalStudents(data.stats.total_students ?? 0)
          setMaleCount(data.stats.male_count ?? 0)
          setFemaleCount(data.stats.female_count ?? 0)
          if (data.stats.programs) setProgramStats(data.stats.programs)
          if (data.stats.courses) setCourseStats(data.stats.courses)
        }

        // Try to fetch program-level stats if available
        try {
          const progRes = await fetch("/admin/php/program_stats.php", {
            credentials: "include",
          })
          if (progRes.ok) {
            const progData = await progRes.json()
            if (progData.status === "success" && progData.programs) {
              setProgramStats(progData.programs)
            }
            if (progData.status === "success" && progData.courses) {
              setCourseStats(progData.courses)
            }
          }
        } catch {}
      } catch (err) {
        console.error("Failed to fetch admin stats", err)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const getProgramData = (program: string) => {
    // Aggregate course data for this program
    const courses = programCourses[program] || []
    let total = 0, male = 0, female = 0
    courses.forEach((course) => {
      const cs = courseStats[course]
      if (cs) {
        total += cs.total
        male += cs.male
        female += cs.female
      }
    })
    // Fall back to program-level stats if available
    if (programStats[program]) {
      total = programStats[program].total
      male = programStats[program].male
      female = programStats[program].female
    }
    return { total, male, female }
  }

  const statsCards = [
    {
      label: "Total Students",
      value: totalStudents,
      icon: Users,
      gradient: "linear-gradient(135deg, #0D5B11, #187019)",
    },
    {
      label: "Male Students",
      value: maleCount,
      icon: TrendingUp,
      gradient: "linear-gradient(135deg, #69B41E, #8DC71E)",
    },
    {
      label: "Female Students",
      value: femaleCount,
      icon: TrendingUp,
      gradient: "linear-gradient(135deg, #187019, #69B41E)",
    },
  ]

  const programs = ["ITE", "CELA", "CBA", "HME", "CJE"]
  const programColors: Record<string, string> = {
    ITE: "#0D5B11",
    CELA: "#187019",
    CBA: "#69B41E",
    HME: "#8DC71E",
    CJE: "#B88D53",
  }

  return (
    <div>
      <h2
        className="tt"
        style={{
          color: "#0D5B11",
          fontWeight: 700,
          marginBottom: 25,
          paddingBottom: 10,
          borderBottom: "3px solid #69B41E",
          fontSize: "1.8rem",
        }}
      >
        Squared Dashboard
      </h2>

      {loading ? (
        <div className="text-center py-5" style={{ color: "#666" }}>Loading dashboard...</div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="row g-3 mt-2 mb-4">
            {statsCards.map((stat, idx) => (
              <div key={stat.label} className="col-12 col-sm-6 col-md-4">
                <div
                  className="stats-card"
                  style={{
                    borderRadius: 12,
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
                    transition: "all 0.3s ease",
                    overflow: "hidden",
                    animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both`,
                  }}
                >
                  <div
                    className="card-body text-center"
                    style={{
                      padding: "1.5rem",
                      background: stat.gradient,
                      color: "white",
                    }}
                  >
                    <div
                      className="stats-icon"
                      style={{
                        width: "clamp(44px, 8vw, 60px)",
                        height: "clamp(44px, 8vw, 60px)",
                        borderRadius: "50%",
                        background: "rgba(255, 255, 255, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1rem",
                      }}
                    >
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div
                      className="stats-number"
                      style={{
                        fontSize: "clamp(1.6rem, 5vw, 2.5rem)",
                        fontWeight: 700,
                        marginBottom: "0.5rem",
                      }}
                    >
                      {stat.value.toLocaleString()}
                    </div>
                    <div className="stats-label" style={{ fontSize: "0.9rem", opacity: 0.9, fontWeight: 500 }}>
                      {stat.label}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Program Chart Area */}
          <div
            className="chart-container"
            style={{
              background: "white",
              borderRadius: 12,
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
              padding: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <h3
              className="tt mb-3"
              style={{
                color: "#0D5B11",
                fontWeight: 700,
                paddingBottom: 10,
                borderBottom: "3px solid #69B41E",
                fontSize: "1.4rem",
              }}
            >
              Students per Program
            </h3>
            <div
              className="chart-wrapper"
              style={{ height: 300, position: "relative", display: "flex", alignItems: "flex-end", gap: 16, padding: "0 20px" }}
            >
              {programs.map((prog) => {
                const data = getProgramData(prog)
                const maxVal = Math.max(...programs.map((p) => getProgramData(p).total), 1)
                const heightPct = (data.total / maxVal) * 100
                return (
                  <div
                    key={prog}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      height: "100%",
                      justifyContent: "flex-end",
                    }}
                  >
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0D5B11", marginBottom: 4 }}>
                      {data.total}
                    </div>
                    <div
                      style={{
                        width: "100%",
                        maxWidth: 80,
                        height: `${Math.max(heightPct, 5)}%`,
                        borderRadius: "8px 8px 0 0",
                        background: programColors[prog],
                        transition: "height 1s ease",
                        minHeight: 8,
                      }}
                    />
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#555",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: "0.65rem", color: programColors[prog], fontWeight: 800 }}>
                        M:{data.male} F:{data.female}
                      </div>
                      {prog}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Course Statistics */}
          <div
            className="course-stats-container"
            style={{
              background: "white",
              borderRadius: 12,
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
              padding: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <h3
              className="tt mb-3"
              style={{
                color: "#0D5B11",
                fontWeight: 700,
                paddingBottom: 10,
                borderBottom: "3px solid #69B41E",
                fontSize: "1.4rem",
              }}
            >
              Students per Course
            </h3>

            {/* Program Accordions */}
            <div style={{ borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
              {programs.map((program) => {
                const data = getProgramData(program)
                const courses = programCourses[program] || []
                const isExpanded = expandedProgram === program

                return (
                  <div
                    key={program}
                    style={{
                      borderBottom: "1px solid #e9ecef",
                    }}
                  >
                    {/* Accordion Header */}
                    <button
                      onClick={() => setExpandedProgram(isExpanded ? null : program)}
                      style={{
                        width: "100%",
                        background: isExpanded
                          ? "linear-gradient(135deg, #0D5B11, #69B41E)"
                          : "linear-gradient(135deg, #f8f9fa, #e9ecef)",
                        border: "none",
                        padding: "1.25rem 1.5rem",
                        fontWeight: 600,
                        color: isExpanded ? "white" : "#0D5B11",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "all 0.3s ease",
                        fontSize: "1rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            background: programColors[program],
                            flexShrink: 0,
                          }}
                        />
                        <strong>{program}</strong>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            padding: "3px 8px",
                            borderRadius: 20,
                            background: isExpanded ? "rgba(255,255,255,0.2)" : "#0D5B11",
                            color: isExpanded ? "white" : "white",
                            fontWeight: 600,
                          }}
                        >
                          <Users className="w-3 h-3" style={{ display: "inline", marginRight: 3, verticalAlign: "middle" }} />
                          {data.total} Students
                        </span>
                        <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>
                          M:{data.male} F:{data.female}
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    </button>

                    {/* Accordion Body */}
                    {isExpanded && (
                      <div style={{ padding: "1.5rem" }}>
                        <div className="row g-3">
                          {courses.map((course) => {
                            const cs = courseStats[course] || { total: 0, male: 0, female: 0 }
                            const malePct = cs.total > 0 ? (cs.male / cs.total) * 100 : 0
                            const femalePct = cs.total > 0 ? (cs.female / cs.total) * 100 : 0
                            return (
                              <div key={course} className="col-12 col-md-6 col-lg-4">
                                <div
                                  style={{
                                    border: "1px solid #e9ecef",
                                    borderRadius: 8,
                                    padding: "1.25rem",
                                    height: "100%",
                                    transition: "all 0.3s ease",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = "#69B41E"
                                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(105, 180, 30, 0.1)"
                                    e.currentTarget.style.transform = "translateY(-3px)"
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = "#e9ecef"
                                    e.currentTarget.style.boxShadow = "none"
                                    e.currentTarget.style.transform = "none"
                                  }}
                                >
                                  <h6
                                    style={{
                                      fontSize: "0.9rem",
                                      fontWeight: 600,
                                      color: "#0D5B11",
                                      marginBottom: 15,
                                      lineHeight: 1.3,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                    title={course}
                                  >
                                    {course}
                                  </h6>

                                  {/* Gender Distribution */}
                                  <div style={{ marginBottom: 15 }}>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: 4,
                                        fontSize: "0.8rem",
                                      }}
                                    >
                                      <span style={{ color: "#666" }}>Male: {cs.male}</span>
                                      <span style={{ color: "#666" }}>Female: {cs.female}</span>
                                    </div>
                                    <div
                                      style={{
                                        height: 8,
                                        backgroundColor: "#f8f9fa",
                                        borderRadius: 10,
                                        overflow: "hidden",
                                        display: "flex",
                                      }}
                                    >
                                      <div
                                        style={{
                                          width: `${malePct}%`,
                                          background: "linear-gradient(135deg, #69B41E, #8DC71E)",
                                          transition: "width 0.5s ease",
                                        }}
                                      />
                                      <div
                                        style={{
                                          width: `${femalePct}%`,
                                          background: "linear-gradient(135deg, #B8D53E, #d4e97c)",
                                          transition: "width 0.5s ease",
                                        }}
                                      />
                                    </div>
                                  </div>

                                  {/* Stats */}
                                  <div className="row text-center">
                                    <div className="col-4">
                                      <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0D5B11" }}>
                                        {cs.total}
                                      </div>
                                      <small style={{ color: "#666" }}>Total</small>
                                    </div>
                                    <div className="col-4">
                                      <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#69B41E" }}>
                                        {cs.male}
                                      </div>
                                      <small style={{ color: "#666" }}>Male</small>
                                    </div>
                                    <div className="col-4">
                                      <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#e83e8c" }}>
                                        {cs.female}
                                      </div>
                                      <small style={{ color: "#666" }}>Female</small>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .row { display: flex; flex-wrap: wrap; }
        .row.g-3 { gap: 1rem; }
        .col-12 { flex: 0 0 100%; max-width: 100%; }
        @media (min-width: 576px) {
          .col-sm-6 { flex: 0 0 calc(50% - 0.5rem); max-width: calc(50% - 0.5rem); }
        }
        @media (min-width: 768px) {
          .col-md-4 { flex: 0 0 calc(33.333% - 0.7rem); max-width: calc(33.333% - 0.7rem); }
          .col-md-6 { flex: 0 0 calc(50% - 0.5rem); max-width: calc(50% - 0.5rem); }
        }
        @media (min-width: 992px) {
          .col-lg-4 { flex: 0 0 calc(33.333% - 0.7rem); max-width: calc(33.333% - 0.7rem); }
        }
        .stats-card:hover {
          transform: translateY(-5px) !important;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </div>
  )
}
