import { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { ChevronLeft, ChevronRight, UserPlus, AlertTriangle, LogIn, Key } from "lucide-react"

const programsCourses: Record<string, { label: string; courses: string[] }> = {
  ITE: {
    label: "Information Technology Education (ITE)",
    courses: ["Bachelor of Science in Information Technology"],
  },
  CELA: {
    label: "College of Education and Liberal Arts (CELA)",
    courses: [
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
  },
  CBA: {
    label: "College of Business Administration (CBA)",
    courses: [
      "Bachelor of Science in Business Administration Major in Financial Management",
      "Bachelor of Science in Business Administration Major in Human Resource Management",
      "Bachelor of Science in Business Administration Major in Marketing Management",
    ],
  },
  HME: {
    label: "Hospitality Management Education (HME)",
    courses: ["Bachelor of Science in Hospitality Management"],
  },
  CJE: {
    label: "Criminal Justice Education (CJE)",
    courses: ["Bachelor of Science in Criminology"],
  },
}

const AVATARS = ["JOY", "SEVI", "SAMANTHA", "ZEKE"]

export default function Register() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState(1)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)

  const [form, setForm] = useState({
    avatar: "JOY",
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    sex: "",
    student_id: "",
    program: "",
    course: "",
    email: "",
    password: "",
    confirm_password: "",
  })

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  const selectedCourses = form.program
    ? programsCourses[form.program]?.courses || []
    : []

  // Handle account_exists URL param
  useEffect(() => {
    if (searchParams.get("account_exists")) {
      setShowAccountModal(true)
      if (window.history.replaceState) {
        const cleanUrl =
          window.location.protocol +
          "//" +
          window.location.host +
          window.location.pathname
        window.history.replaceState({ path: cleanUrl }, "", cleanUrl)
      }
    }
  }, [searchParams])

  const handleNext = () => {
    const stepEl = document.getElementById(`step${step}`)
    if (stepEl) {
      const requiredFields = stepEl.querySelectorAll("[required]")
      let valid = true
      requiredFields.forEach((el) => {
        const input = el as HTMLInputElement | HTMLSelectElement
        if (input.type === "radio") {
          const name = input.name
          const checked = stepEl.querySelector(
            `input[name="${name}"]:checked`
          )
          if (!checked) valid = false
        } else if (!input.value) {
          input.classList.add("border-red-500")
          valid = false
        } else {
          input.classList.remove("border-red-500")
        }
      })
      if (!valid) {
        setError("Please fill in all required fields.")
        setTimeout(() => setError(""), 3000)
        return
      }
    }
    setError("")
    setStep((s) => Math.min(s + 1, 3))
  }

  const handlePrev = () => setStep((s) => Math.max(s - 1, 1))

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
        body: new URLSearchParams({ ...form, csrf_token: "" }),
      })

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

  const accountExistsType = searchParams.get("type")
  const accountExistsEmail = searchParams.get("email")
  const accountExistsId = searchParams.get("id")

  return (
    <div className="bg-[#fafafa] min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-[#187C19] text-white py-3 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl tracking-tight"
          >
            <img
              src="/images/Squared_Logo.png"
              alt="Logo"
              className="w-8 h-8 rounded bg-white p-1"
            />
            Squared
          </Link>
          <div className="flex gap-4 items-center">
            <Link
              to="/login"
              className="text-sm font-medium hover:opacity-80 transition-opacity"
            >
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
        <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-xl border border-neutral-100 p-8 space-y-6">
          {/* Step Indicator */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <img
                src="/images/Squared_Logo.png"
                alt="Squared"
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Create Account
            </h1>
            <p className="text-neutral-400 text-xs font-medium uppercase tracking-wide">
              Step {step} of 3
            </p>

            {/* Progress Bars */}
            <div className="flex gap-2 justify-center mt-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 w-12 rounded-full transition-colors duration-300 ${
                    s <= step ? "bg-[#187C19]" : "bg-neutral-200"
                  }`}
                />
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Server Error */}
            {error && step === 1 && (
              <div className="mb-6 p-4 rounded-xl text-sm font-medium bg-red-50 text-red-800 border border-red-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              </div>
            )}

            {/* Step 1: Avatar */}
            <div
              id="step1"
              className={step === 1 ? "space-y-6" : "hidden"}
            >
              <h3 className="text-sm font-bold text-neutral-700 text-center uppercase tracking-tight">
                Choose Your Avatar
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {AVATARS.map((av) => (
                  <label key={av} className="cursor-pointer group relative">
                    <input
                      type="radio"
                      name="avatar"
                      value={av}
                      checked={form.avatar === av}
                      onChange={(e) => update("avatar", e.target.value)}
                      required
                      className="hidden peer"
                    />
                    <div className="border-2 border-neutral-100 rounded-xl p-2 transition-all hover:bg-neutral-50 flex flex-col items-center gap-2 peer-checked:border-[#187C19] peer-checked:bg-[#f0fdf4] peer-checked:shadow-[0_0_0_2px_#187C19]">
                      <img
                        src={`/avatars/${av}.png`}
                        alt={av}
                        className="w-full aspect-square object-cover rounded-lg"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                      <span className="text-[10px] font-bold text-neutral-500 uppercase peer-checked:text-[#187C19]">
                        {av}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Step 2: Personal Info */}
            <div
              id="step2"
              className={step === 2 ? "space-y-4" : "hidden"}
            >
              <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-tight mb-2">
                Personal Info
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase px-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    onChange={(e) => update("first_name", e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-neutral-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187C19]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase px-1">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    name="middle_name"
                    value={form.middle_name}
                    onChange={(e) => update("middle_name", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-neutral-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187C19]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase px-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    onChange={(e) => update("last_name", e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-neutral-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187C19]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase px-1">
                    Suffix
                  </label>
                  <input
                    type="text"
                    name="suffix"
                    value={form.suffix}
                    onChange={(e) => update("suffix", e.target.value)}
                    placeholder="Jr., III, etc."
                    className="flex h-10 w-full rounded-md border border-input bg-neutral-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187C19]"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-500 uppercase px-1">
                  Sex
                </label>
                <select
                  name="sex"
                  value={form.sex}
                  onChange={(e) => update("sex", e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-neutral-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187C19]"
                >
                  <option value="">Select sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-500 uppercase px-1">
                  Student ID
                </label>
                <input
                  type="text"
                  name="student_id"
                  value={form.student_id}
                  onChange={(e) => update("student_id", e.target.value)}
                  placeholder="e.g. 123212314123"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-neutral-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187C19]"
                />
              </div>
            </div>

            {/* Step 3: Program & Account */}
            <div
              id="step3"
              className={step === 3 ? "space-y-4" : "hidden"}
            >
              <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-tight mb-2">
                Program &amp; Account
              </h3>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-500 uppercase px-1">
                  Program
                </label>
                <select
                  id="programSelect"
                  name="program"
                  value={form.program}
                  onChange={(e) => {
                    update("program", e.target.value)
                    update("course", "")
                  }}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-neutral-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187C19]"
                >
                  <option value="">Select Program</option>
                  {Object.entries(programsCourses).map(([key, data]) => (
                    <option key={key} value={key}>
                      {data.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-500 uppercase px-1">
                  Course
                </label>
                <select
                  id="courseSelect"
                  name="course"
                  value={form.course}
                  onChange={(e) => update("course", e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-neutral-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187C19]"
                >
                  <option value="">Select Course</option>
                  {selectedCourses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-500 uppercase px-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-neutral-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187C19]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase px-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-neutral-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187C19]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase px-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={form.confirm_password}
                    onChange={(e) => update("confirm_password", e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-neutral-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187C19]"
                  />
                </div>
              </div>

              {/* reCAPTCHA placeholder */}
              <div className="flex justify-center py-2">
                <div className="border border-neutral-200 rounded bg-neutral-50 px-6 py-3 text-xs text-neutral-400 italic">
                  reCAPTCHA verification
                </div>
              </div>

              <div className="flex items-center gap-2 px-1">
                <input
                  type="checkbox"
                  id="termsCheckbox"
                  required
                  className="w-4 h-4 text-[#187C19] border-gray-300 rounded focus:ring-[#187C19]"
                />
                <label
                  htmlFor="termsCheckbox"
                  className="text-[10px] text-neutral-500"
                >
                  I agree to the{" "}
                  <a href="#" className="text-[#187C19] hover:underline">
                    Terms &amp; Conditions
                  </a>
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && step > 1 && (
              <div className="text-xs text-red-500 font-medium text-center mt-4">
                {error}
              </div>
            )}

            {/* Step Buttons */}
            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={handlePrev}
                className={`${
                  step === 1 ? "hidden" : ""
                } flex-grow inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-neutral-50`}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className={`${
                  step === 3 ? "hidden" : ""
                } flex-grow inline-flex items-center justify-center gap-2 rounded-lg bg-[#58AF59] px-4 py-2.5 text-sm font-semibold text-white shadow transition-all hover:bg-[#4a964a] active:scale-[0.98]`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`${
                  step !== 3 ? "hidden" : ""
                } flex-grow inline-flex items-center justify-center gap-2 rounded-lg bg-[#FFAB40] px-4 py-2.5 text-sm font-bold text-white shadow transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50`}
              >
                <UserPlus className="w-4 h-4" />
                {loading ? "Registering..." : "Register"}
              </button>
            </div>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-neutral-400 font-medium tracking-tight">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#187C19] font-bold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-xs text-neutral-400">
        &copy; {new Date().getFullYear()} SQUARED. ALL RIGHTS RESERVED.
      </footer>

      {/* Account Already Exists Modal */}
      {showAccountModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-neutral-900/75 transition-opacity"
              aria-hidden="true"
              onClick={() => setShowAccountModal(false)}
            />
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-bold text-neutral-900">
                      Account Already Registered
                    </h3>
                    <div className="mt-4 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                      <p className="text-sm text-neutral-600">
                        {accountExistsType === "email" && accountExistsEmail
                          ? (
                            <>
                              The email{" "}
                              <span className="font-bold text-neutral-900">
                                {accountExistsEmail}
                              </span>{" "}
                              is already associated with an account.
                            </>
                          )
                          : accountExistsType === "student_id" && accountExistsId
                          ? (
                            <>
                              The Student ID{" "}
                              <span className="font-bold text-neutral-900">
                                {accountExistsId}
                              </span>{" "}
                              is already registered in our system.
                            </>
                          )
                          : "An account with this information already exists in our system."}
                      </p>
                    </div>
                    <p className="mt-4 text-sm text-neutral-500">
                      Would you like to sign in to your existing account or
                      recover your password?
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-neutral-50 px-4 py-6 sm:px-6 flex flex-col gap-3">
                <Link
                  to="/login"
                  className="w-full inline-flex justify-center items-center gap-2 rounded-xl border border-transparent shadow-sm px-4 py-3 bg-[#187C19] text-base font-bold text-white hover:bg-[#136a14] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#187C19] sm:text-sm transition-all active:scale-[0.98]"
                >
                  <LogIn className="w-4 h-4" />
                  Login to Existing Account
                </Link>
                <Link
                  to={
                    accountExistsType === "email" && accountExistsEmail
                      ? `/forgot-password?existing_account=1&email=${encodeURIComponent(accountExistsEmail)}`
                      : "/forgot-password"
                  }
                  className="w-full inline-flex justify-center items-center gap-2 rounded-xl border border-neutral-200 shadow-sm px-4 py-3 bg-white text-base font-bold text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#187C19] sm:text-sm transition-all active:scale-[0.98]"
                >
                  <Key className="w-4 h-4" />
                  Forgot Password? Reset Here
                </Link>
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="mt-2 text-sm text-neutral-400 hover:text-neutral-600 transition-colors font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
