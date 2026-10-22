import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { LogIn, Eye, EyeOff, CheckCircle, AlertCircle, UserCheck } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/services/api"

export default function Login() {
  const navigate = useNavigate()
  const { loginStudent } = useAuth()
  const [searchParams] = useSearchParams()
  const [studentId, setStudentId] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const registered = searchParams.get("registered")
  const existingAccount = searchParams.get("existing_account")
  const existingId = searchParams.get("existing_id")
  const existingEmail = searchParams.get("email")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!studentId || !password) {
      setError("Please fill in all fields.")
      setLoading(false)
      return
    }

    try {
      const csrfToken = await api.getCsrfToken()
      await loginStudent(studentId, password, csrfToken)
      navigate("/home")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Connection error. Please try again.")
    }
    setLoading(false)
  }

  return (
    <div className="bg-[#fafafa] min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-[#187C19] text-white py-3 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <img src="/images/Squared_Logo.png" alt="Logo" className="w-8 h-8 rounded bg-white p-1" />
            Squared
          </Link>
          <div className="flex gap-4 items-center">
            <Link to="/login" className="text-sm font-medium hover:opacity-80 transition-opacity">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-[#FFAB40] text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl border border-neutral-100 p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <img src="/images/Squared_Logo.png" alt="Squared" className="w-16 h-16 object-contain" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Welcome Back</h1>
            <p className="text-neutral-500 text-sm italic">Sign in to your Squared account</p>
          </div>

          {/* Success Message */}
          {registered && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold">Registration Successful!</p>
                <p className="text-xs opacity-90">Please sign in with your new credentials.</p>
              </div>
            </div>
          )}

          {/* Account Already Exists */}
          {existingAccount && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-4 rounded-xl flex items-start gap-3">
              <div className="bg-amber-100 rounded-full p-2 flex-shrink-0">
                <UserCheck className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-900">Account Already Exists!</p>
                <p className="text-xs text-amber-700 mt-1">
                  An account with email{" "}
                  <span className="font-medium">{existingEmail || ""}</span> is already registered.
                </p>
                <div className="mt-3 pt-3 border-t border-amber-200">
                  <p className="text-xs text-amber-600 mb-2">Please sign in to your existing account:</p>
                  <Link to="/forgot-password" className="text-xs text-[#187C19] hover:underline font-medium">
                    Forgot your password? Reset it here
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Student ID Already Registered */}
          {existingId && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold">Student ID Already Registered!</p>
                <p className="text-xs opacity-90">
                  This ID is already in our system. Please login or contact support.
                </p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="studentId" className="text-sm font-medium leading-none">
                Student ID
              </label>
              <input
                id="studentId"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Student ID"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187C19] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium leading-none">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-[#187C19] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187C19] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 font-medium text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-lg bg-[#187C19] px-4 py-2 text-sm font-semibold text-white shadow transition-all hover:bg-[#136a14] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187C19] focus-visible:ring-offset-2 gap-2 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-neutral-500">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#187C19] font-bold hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-xs text-neutral-400">
        &copy; {new Date().getFullYear()} SQUARED. ALL RIGHTS RESERVED.
      </footer>
    </div>
  )
}
