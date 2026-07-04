import { useState } from "react"
import { Link } from "react-router-dom"
import { X, Eye, EyeOff, AlertTriangle, CheckCircle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

/* ────────────────────────────────────────────
   Login Modal
   ──────────────────────────────────────────── */
interface LoginModalProps {
  open: boolean
  onClose: () => void
  onSwitchToRegister: () => void
}

function LoginModal({ open, onClose, onSwitchToRegister }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [studentId, setStudentId] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setLoading(true)
    try {
      const res = await fetch("/php/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
        body: new URLSearchParams({
          student_id: studentId,
          password,
          csrf_token: "",
        }),
      })
      const data = await res.json()
      if (data.status === "success") {
        window.location.href = "/home"
      } else {
        setMessage(data.message || "Login failed.")
      }
    } catch {
      setMessage("Connection error. Please try again.")
    }
    setLoading(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl overflow-hidden max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#0D5B11] text-white px-6 py-4 flex items-center justify-between">
          <h5 className="font-bold text-lg">Student Login</h5>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Student ID</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#187C19] focus:border-transparent"
                placeholder="Enter your Student ID"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#187C19] focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {message && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">{message}</p>
            )}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-[#187C19] focus:ring-[#187C19]" />
                <span className="text-gray-600">Remember Me</span>
              </label>
              <Link to="/forgot-password" className="text-[#187C19] hover:underline font-semibold" onClick={onClose}>
                Forgot Password?
              </Link>
            </div>
            <Button type="submit" disabled={loading} className="w-full py-2.5 text-base">
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Don&apos;t have an account?{" "}
            <button onClick={onSwitchToRegister} className="text-[#187C19] font-semibold hover:underline">
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   Register Modal
   ──────────────────────────────────────────── */
interface RegisterModalProps {
  open: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

const avatarOptions = [
  { value: "JOY", label: "JOY", image: "/avatars/JOY.png" },
  { value: "SEVI", label: "SEVI", image: "/avatars/SEVI.png" },
  { value: "SAMANTHA", label: "SAMANTHA", image: "/avatars/SAMANTHA.png" },
  { value: "ZEKE", label: "ZEKE", image: "/avatars/ZEKE.png" },
]

function RegisterModal({ open, onClose, onSwitchToLogin }: RegisterModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="bg-[#0D5B11] text-white px-6 py-4 flex items-center justify-between shrink-0">
            <h5 className="font-bold text-lg">Create Account</h5>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto space-y-4">
            {/* Avatar Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Choose an Avatar <span className="text-red-500">*</span></label>
              <div className="flex gap-3 justify-center flex-wrap">
                {avatarOptions.map((av) => (
                  <label key={av.value} className="cursor-pointer text-center">
                    <input
                      type="radio"
                      name="register-avatar"
                      value={av.value}
                      checked={selectedAvatar === av.value}
                      onChange={() => { setSelectedAvatar(av.value); setAvatarError(false) }}
                      className="hidden"
                    />
                    <img
                      src={av.image}
                      alt={av.label}
                      className={`w-20 h-20 rounded-full border-3 object-cover transition-all duration-200 ${
                        selectedAvatar === av.value ? "border-[#187C19] scale-110 shadow-md" : "border-transparent hover:border-gray-300"
                      }`}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                    />
                    <div className={`text-xs font-bold mt-1 ${selectedAvatar === av.value ? "text-[#187C19]" : "text-gray-500"}`}>{av.label}</div>
                  </label>
                ))}
              </div>
              {avatarError && <p className="text-red-600 text-xs mt-1">Please select an avatar.</p>}
            </div>

            {/* Personal Info Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">First Name</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#187C19] focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Middle Name</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#187C19] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Last Name</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#187C19] focus:border-transparent" required />
              </div>
            </div>

            {/* Student ID + Sex Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Student ID</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#187C19] focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Suffix</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#187C19] focus:border-transparent">
                  <option value="">None</option>
                  <option value="Jr.">Jr.</option>
                  <option value="Sr.">Sr.</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                  <option value="IV">IV</option>
                </select>
              </div>
            </div>

            {/* Sex + Program Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Sex</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#187C19] focus:border-transparent" required>
                  <option value="">Select Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Program</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#187C19] focus:border-transparent" required>
                  <option value="">Select Program</option>
                  <option value="CBA">CBA - Business Administration</option>
                  <option value="CELA">CELA - Education & Liberal Arts</option>
                  <option value="CJE">CJE - Criminal Justice Education</option>
                  <option value="HME">HME - Hospitality Management</option>
                  <option value="ITE">ITE - Information Technology Education</option>
                </select>
              </div>
            </div>

            {/* Course + Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Course</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#187C19] focus:border-transparent" required>
                  <option value="">Select Course</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Gmail</label>
                <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#187C19] focus:border-transparent" required />
              </div>
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#187C19] focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#187C19] focus:border-transparent"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="register-terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 rounded border-gray-300 text-[#187C19] focus:ring-[#187C19]"
              />
              <label htmlFor="register-terms" className="text-xs text-gray-600">
                I agree to the{" "}
                <button type="button" onClick={() => setShowTerms(true)} className="text-[#187C19] hover:underline font-semibold">
                  Terms and Conditions
                </button>{" "}
                and{" "}
                <button type="button" onClick={() => setShowPrivacy(true)} className="text-[#187C19] hover:underline font-semibold">
                  Privacy Policy
                </button>.
              </label>
            </div>

            <Button disabled={!agreedToTerms || !selectedAvatar} className="w-full py-2.5 text-base">
              {!selectedAvatar ? "Select an Avatar First" : !agreedToTerms ? "Agree to Terms to Continue" : "Register"}
            </Button>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <button onClick={onSwitchToLogin} className="text-[#187C19] font-semibold hover:underline">
                Login here
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowTerms(false)}>
          <div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#187C19] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <h5 className="font-bold text-lg text-center flex-1">Terms and Conditions</h5>
              <button onClick={() => setShowTerms(false)} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-sm text-gray-600">
              <p>Welcome to <strong>Squared</strong>, a student-led initiative of Davao Central College. By registering and using our services, you agree to the following terms:</p>
              <p><strong>1. Membership</strong><br />All enrolled students of DCC are eligible to register. Registration grants you access to a QR Code (SQCC) and Control Number (SCN) to engage in DCC events and services.</p>
              <p><strong>2. Use of QR Codes</strong><br />Your personal QR Code may be scanned for attendance, evaluations, transactions, and other campus-related services. Misuse, forgery, or tampering with your code may result in disciplinary action.</p>
              <p><strong>3. Responsibilities</strong><br />As a registered member, you agree to use Squared services responsibly, follow DCC&apos;s conduct guidelines, and avoid interfering with the operation of any Squared systems.</p>
              <p><strong>4. Updates & Availability</strong><br />Services may evolve over time. Squared reserves the right to update features or policies to improve performance and user experience.</p>
              <p><strong>5. Student Conduct</strong><br />Participation in Squared events requires students to behave with integrity, respect, and cooperation with fellow students, faculty, and system administrators.</p>
              <p>If you do not agree with any part of these terms, please refrain from registering or using Squared services.</p>
            </div>
            <div className="p-4 border-t border-gray-100 text-center">
              <Button onClick={() => setShowTerms(false)}>OK</Button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowPrivacy(false)}>
          <div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#187C19] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <h5 className="font-bold text-lg text-center flex-1">Privacy Policy</h5>
              <button onClick={() => setShowPrivacy(false)} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-sm text-gray-600">
              <p><strong>Privacy Policy</strong> explains how Squared collects, uses, and protects the information you provide through the registration and QR Code system.</p>
              <p><strong>1. Information Collected</strong><br />We collect personal information such as your name, student ID, program, email, and event attendance. This data is used solely to facilitate Squared services and improve event operations.</p>
              <p><strong>2. QR Code Usage</strong><br />Your QR Code is uniquely tied to your student record and is only used for official DCC purposes like attendance and event tracking.</p>
              <p><strong>3. Data Security</strong><br />Squared employs secure systems to store and manage your information. Only authorized personnel have access to sensitive data.</p>
              <p><strong>4. Consent</strong><br />By registering for Squared, you give your consent for your data to be collected and processed according to this policy.</p>
              <p><strong>5. Third-Party Sharing</strong><br />Squared does not sell or share your information with third parties unless legally required or with explicit student consent.</p>
            </div>
            <div className="p-4 border-t border-gray-100 text-center">
              <Button onClick={() => setShowPrivacy(false)}>OK</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ────────────────────────────────────────────
   Message/Notification Modal
   ──────────────────────────────────────────── */
interface MessageModalProps {
  open: boolean
  onClose: () => void
  type: "success" | "error" | "warning"
  message: string
}

function MessageModal({ open, onClose, type, message }: MessageModalProps) {
  if (!open) return null

  const icons = {
    success: <CheckCircle className="w-12 h-12 text-green-500" />,
    error: <AlertTriangle className="w-12 h-12 text-red-500" />,
    warning: <AlertTriangle className="w-12 h-12 text-amber-500" />,
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl overflow-hidden max-w-sm w-full shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 flex flex-col items-center gap-3">
          {icons[type]}
          <p className="text-gray-600">{message}</p>
        </div>
        <div className="pb-6 px-6">
          <Button onClick={onClose} className="w-full">OK</Button>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   Account Already Exists Modal
   ──────────────────────────────────────────── */
interface AccountExistsModalProps {
  open: boolean
  onClose: () => void
  email?: string
  studentId?: string
}

function AccountExistsModal({ open, onClose, email }: AccountExistsModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" data-backdrop="static" onClick={onClose}>
      <div className="bg-white rounded-2xl overflow-hidden max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-amber-500 text-white px-6 py-4 text-center">
          <h5 className="font-bold text-lg"><AlertTriangle className="w-5 h-5 inline mr-2" />Account Already Exists</h5>
        </div>
        <div className="p-6 text-center">
          <div className="mb-3">
            <CheckCircle className="w-12 h-12 text-amber-400 mx-auto" />
          </div>
          <h5 className="font-bold text-gray-800 mb-2">This account is already registered!</h5>
          <p className="text-gray-500 text-sm mb-4">
            {email
              ? `An account with email ${email} already exists in our system.`
              : "An account with this student ID already exists in our system."}
          </p>
          <div className="space-y-2">
            <Link to="/login" onClick={onClose} className="block w-full bg-[#187C19] text-white text-center font-bold py-3 rounded-lg hover:bg-[#136a14] transition-colors">
              Login to Existing Account
            </Link>
            <Link to="/forgot-password" onClick={onClose} className="block w-full bg-amber-50 text-amber-700 text-center font-semibold py-3 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors">
              Forgot Password? Reset Here
            </Link>
            <button onClick={onClose} className="w-full text-gray-500 text-sm py-2 hover:text-gray-700 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   PWA Install Modal
   ──────────────────────────────────────────── */
interface InstallModalProps {
  open: boolean
  onClose: () => void
}

function InstallModal({ open, onClose }: InstallModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl overflow-hidden max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#0D5B11] text-white px-6 py-4 flex items-center justify-between">
          <h5 className="font-bold text-lg"><Download className="w-5 h-5 inline mr-2" />Install App</h5>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 text-center">
          <Download className="w-16 h-16 text-[#69B41E] mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Install Squared QR on your device for quick access and a better experience.</p>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Not Now</Button>
          <Button className="flex-1">Install App</Button>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   Main Export — All Modals
   ──────────────────────────────────────────── */
interface LandingModalsProps {
  showLogin: boolean
  showRegister: boolean
  showMessage: boolean
  showAccountExists: boolean
  showInstall: boolean
  messageType: "success" | "error" | "warning"
  messageText: string
  accountEmail?: string
  onCloseLogin: () => void
  onCloseRegister: () => void
  onCloseMessage: () => void
  onCloseAccountExists: () => void
  onCloseInstall: () => void
  onSwitchToRegister: () => void
  onSwitchToLogin: () => void
}

export default function LandingModals({
  showLogin, showRegister, showMessage, showAccountExists, showInstall,
  messageType, messageText, accountEmail,
  onCloseLogin, onCloseRegister, onCloseMessage, onCloseAccountExists, onCloseInstall,
  onSwitchToRegister, onSwitchToLogin,
}: LandingModalsProps) {
  return (
    <>
      <LoginModal open={showLogin} onClose={onCloseLogin} onSwitchToRegister={onSwitchToRegister} />
      <RegisterModal open={showRegister} onClose={onCloseRegister} onSwitchToLogin={onSwitchToLogin} />
      <MessageModal open={showMessage} onClose={onCloseMessage} type={messageType} message={messageText} />
      <AccountExistsModal open={showAccountExists} onClose={onCloseAccountExists} email={accountEmail} />
      <InstallModal open={showInstall} onClose={onCloseInstall} />
    </>
  )
}
