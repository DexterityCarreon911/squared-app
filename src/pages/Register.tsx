import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"

const programs = [
  { value: "ITE", label: "Information Technology Education (ITE)" },
  { value: "CELA", label: "College of Education, Liberal Arts (CELA)" },
  { value: "CBA", label: "College of Business Administration (CBA)" },
  { value: "HME", label: "Hospitality Management & Entrepreneurship (HME)" },
  { value: "CJE", label: "College of Criminal Justice Education (CJE)" },
]

const courses: Record<string, string[]> = {
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

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    student_id: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    sex: "",
    avatar: "JOY",
    program: "",
    course: "",
    email: "",
    password: "",
    confirm_password: "",
  })

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))
  const selectedCourses = courses[form.program] || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.")
      return
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/php/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
        body: new URLSearchParams({
          ...form,
          csrf_token: "",
        }),
      })

      // Registration redirects, so check if we get a redirect
      if (res.redirected) {
        const url = new URL(res.url)
        if (url.pathname.includes("login.php")) {
          navigate("/login?registered=1")
        } else {
          setError("Registration failed. Please try again.")
        }
      } else {
        const data = await res.json()
        setError(data.message || "Registration failed.")
      }
    } catch {
      setError("Connection error. Please try again.")
    }
    setLoading(false)
  }

  const avatars = ["JOY", "SEVI", "SAMANTHA", "ZEKE"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src="/images/Squared_Logo.png" alt="Squared" className="h-10 w-10" />
            <span className="text-2xl font-bold text-[#187C19]">Squared</span>
          </Link>
          <p className="text-gray-500 mt-2">Create your student account</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`flex items-center ${s < 3 ? "flex-1" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? "bg-[#187C19] text-white" : "bg-gray-200 text-gray-500"}`}>{s}</div>
                  {s < 3 && <div className={`flex-1 h-1 mx-2 rounded ${step > s ? "bg-[#187C19]" : "bg-gray-200"}`} />}
                </div>
              ))}
            </div>
            <CardTitle>Student Registration</CardTitle>
            <CardDescription>
              {step === 1 ? "Personal Information" : step === 2 ? "Account Details" : "Review & Submit"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm mb-4 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">First Name *</label>
                      <Input value={form.first_name} onChange={(e) => update("first_name", e.target.value)} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Last Name *</label>
                      <Input value={form.last_name} onChange={(e) => update("last_name", e.target.value)} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Middle Name</label>
                      <Input value={form.middle_name} onChange={(e) => update("middle_name", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Suffix</label>
                      <select className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm" value={form.suffix} onChange={(e) => update("suffix", e.target.value)}>
                        <option value="">None</option>
                        <option value="Jr.">Jr.</option>
                        <option value="Sr.">Sr.</option>
                        <option value="II">II</option>
                        <option value="III">III</option>
                        <option value="IV">IV</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Sex *</label>
                    <select className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm" value={form.sex} onChange={(e) => update("sex", e.target.value)} required>
                      <option value="">Select Sex</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Program *</label>
                    <select className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm" value={form.program} onChange={(e) => { update("program", e.target.value); update("course", "") }} required>
                      <option value="">Select Program</option>
                      {programs.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                  {form.program && (
                    <div>
                      <label className="text-sm font-medium mb-1 block">Course *</label>
                      <select className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm" value={form.course} onChange={(e) => update("course", e.target.value)} required>
                        <option value="">Select Course</option>
                        {selectedCourses.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  )}
                  <Button type="button" className="w-full" onClick={() => setStep(2)} disabled={!form.first_name || !form.last_name || !form.sex || !form.program || !form.course}>
                    Next Step
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Student ID *</label>
                    <Input value={form.student_id} onChange={(e) => update("student_id", e.target.value)} placeholder="e.g. 2020-00001" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email *</label>
                    <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Choose Avatar</label>
                    <div className="flex gap-3">
                      {avatars.map((a) => (
                        <button key={a} type="button" onClick={() => update("avatar", a)} className={`p-2 rounded-lg border-2 ${form.avatar === a ? "border-[#187C19] bg-green-50" : "border-gray-200"} hover:border-[#187C19] transition-colors`}>
                          <img src={`/avatars/${a}.png`} alt={a} className="w-12 h-12" onError={(e) => { (e.target as HTMLImageElement).src = `data:image/svg+xml,...` }} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Password *</label>
                    <div className="relative">
                      <Input type={showPw ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Min 8 characters" required />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Confirm Password *</label>
                    <Input type="password" value={form.confirm_password} onChange={(e) => update("confirm_password", e.target.value)} required />
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                    <Button type="button" className="flex-1" onClick={() => setStep(3)} disabled={!form.student_id || !form.email || !form.password || !form.confirm_password}>
                      Review
                    </Button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <p><strong>Name:</strong> {form.first_name} {form.middle_name} {form.last_name} {form.suffix}</p>
                    <p><strong>Student ID:</strong> {form.student_id}</p>
                    <p><strong>Sex:</strong> {form.sex}</p>
                    <p><strong>Program:</strong> {programs.find((p) => p.value === form.program)?.label}</p>
                    <p><strong>Course:</strong> {form.course}</p>
                    <p><strong>Email:</strong> {form.email}</p>
                    <p><strong>Avatar:</strong> {form.avatar}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? "Registering..." : "Create Account"}
                    </Button>
                  </div>
                </>
              )}

              <p className="text-center text-sm text-gray-500 mt-4">
                Already have an account?{" "}
                <Link to="/login" className="text-[#187C19] hover:underline font-medium">Sign in</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
