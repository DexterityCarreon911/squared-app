import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Lock, QrCode, ListChecks, Receipt, Headset, Download,
  X, Send, AlertCircle, CheckCircle, Eye, EyeOff,
} from "lucide-react"

interface StudentData {
  student_id: string
  first_name: string
  middle_name: string
  last_name: string
  suffix: string
  avatar: string
  email: string
  course: string
  program: string
  created_at: string
  qr_code: string | null
}

export default function StudentHome() {
  const navigate = useNavigate()
  const [student, setStudent] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrError, setQrError] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  // Modals
  const [showPassModal, setShowPassModal] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageType, setMessageType] = useState<"success" | "error">("success")
  const [messageText, setMessageText] = useState("")

  // Password form
  const [passForm, setPassForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })
  const [showPassFields, setShowPassFields] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  // Support form
  const [supportForm, setSupportForm] = useState({
    subject: "",
    message: "",
  })
  const [supportError, setSupportError] = useState("")
  const [supportSending, setSupportSending] = useState(false)

  useEffect(() => {
    fetchStudent()
  }, [])

  const fetchStudent = async () => {
    try {
      const res = await fetch("/php/get_student.php", {
        credentials: "include",
      })
      if (res.redirected) {
        navigate("/login", { replace: true })
        return
      }
      const data = await res.json()
      if (data.status === "success" && data.student) {
        setStudent(data.student)
      } else if (data.student_id) {
        setStudent(data)
      }
    } catch (err) {
      console.error("Failed to fetch student data", err)
    }
    setLoading(false)
  }

  // Check for session messages on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const msg = params.get("message")
    const type = params.get("message_type")
    if (msg && type) {
      setMessageText(msg)
      setMessageType(type as "success" | "error")
      setShowMessageModal(true)
      // Clean URL
      if (window.history.replaceState) {
        window.history.replaceState({}, "", "/home")
      }
    }
  }, [])

  const handlePassSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passForm.new_password !== passForm.confirm_password) {
      setMessageText("Passwords do not match.")
      setMessageType("error")
      setShowMessageModal(true)
      return
    }
    try {
      const res = await fetch("/php/changepass.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
        body: new URLSearchParams({
          current_password: passForm.current_password,
          new_password: passForm.new_password,
          confirm_password: passForm.confirm_password,
          csrf_token: "",
        }),
      })
      const data = await res.json()
      setMessageText(data.message || "Password updated successfully.")
      setMessageType(data.status === "success" ? "success" : "error")
      setShowMessageModal(true)
      if (data.status === "success") {
        setShowPassModal(false)
        setPassForm({ current_password: "", new_password: "", confirm_password: "" })
      }
    } catch {
      setMessageText("Connection error. Please try again.")
      setMessageType("error")
      setShowMessageModal(true)
    }
  }

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSupportError("")
    if (!supportForm.subject || !supportForm.message) {
      setSupportError("Please fill in all fields.")
      return
    }
    setSupportSending(true)
    try {
      const res = await fetch("/php/support.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
        body: new URLSearchParams({
          subject: supportForm.subject,
          message: supportForm.message,
          csrf_token: "",
        }),
      })
      const data = await res.json()
      setMessageText(data.message || "Message sent successfully!")
      setMessageType(data.status === "success" ? "success" : "error")
      setShowMessageModal(true)
      if (data.status === "success") {
        setShowSupportModal(false)
        setSupportForm({ subject: "", message: "" })
      }
    } catch {
      setSupportError("Connection error.")
    }
    setSupportSending(false)
  }

  const regenerateQR = async () => {
    setRegenerating(true)
    try {
      const res = await fetch("/php/regenerate_qr.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
        body: new URLSearchParams({ action: "regenerate_qr", csrf_token: "" }),
      })
      const data = await res.json()
      if (data.status === "success") {
        setQrError(false)
        fetchStudent()
      }
      setMessageText(data.message || "QR code generated!")
      setMessageType(data.status === "success" ? "success" : "error")
      setShowMessageModal(true)
    } catch {
      setMessageText("Failed to regenerate QR code.")
      setMessageType("error")
      setShowMessageModal(true)
    }
    setRegenerating(false)
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${months[d.getMonth()]} ${d.getFullYear()}`
  }

  if (loading) {
    return (
      <div className="text-center py-20" style={{ color: "#666" }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid #e0e0e0",
            borderTopColor: "#187C19",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        Loading dashboard...
      </div>
    )
  }

  if (!student) {
    return (
      <div className="text-center py-20" style={{ color: "#666" }}>
        Could not load student data.
      </div>
    )
  }

  return (
    <div>
      {/* Welcome Hero */}
      <div
        className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h1
            className="text-4xl md:text-5xl font-black tracking-tighter mb-2"
            style={{ color: "#111" }}
          >
            Hello,{" "}
            <span style={{ color: "#187C19" }}>{student.first_name}</span>
          </h1>
          <p className="fw-bold tracking-tight" style={{ color: "#999" }}>
            View your QR code and attendance records.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPassModal(true)}
            className="d-inline-flex align-items-center gap-2 px-4 py-3 rounded-3 fw-bold shadow-sm border"
            style={{
              background: "white",
              border: "1px solid #e0e0e0",
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <Lock className="w-4 h-4" /> Change Password
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="row">
        {/* Left: Profile + Quick Actions (7 cols on lg) */}
        <div className="col-12 col-lg-7" style={{ marginBottom: 24 }}>
          {/* Profile Card */}
          <div
            className="glass-card p-4 p-md-5 rounded-5 shadow-sm position-relative overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(0,0,0,0.05)",
              borderRadius: "2.5rem",
              marginBottom: 24,
            }}
          >
            <div
              className="position-absolute"
              style={{
                right: -40,
                top: -40,
                width: 160,
                height: 160,
                background: "rgba(24,124,25,0.05)",
                borderRadius: "50%",
                filter: "blur(64px)",
                pointerEvents: "none",
              }}
            />

            <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-4" style={{ position: "relative", zIndex: 1 }}>
              {/* Avatar */}
              <div className="position-relative">
                <div
                  className="overflow-hidden"
                  style={{
                    width: 128,
                    height: 128,
                    borderRadius: "50%",
                    background: "white",
                    padding: 8,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
                    transition: "transform 0.5s",
                  }}
                >
                  <img
                    src={`/avatars/${student.avatar}.png`}
                    alt="Avatar"
                    className="w-100 h-100"
                    style={{ objectFit: "contain" }}
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23e0e0e0' width='100' height='100'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23999' font-size='40'%3E👤%3C/text%3E%3C/svg%3E"
                    }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center text-md-start">
                <div style={{ marginBottom: 24 }}>
                  <h2
                    className="fw-black tracking-tight mb-1"
                    style={{ fontSize: "1.5rem", color: "#111" }}
                  >
                    {student.first_name} {student.last_name}
                  </h2>
                  <p
                    className="fw-black text-uppercase"
                    style={{
                      fontSize: "0.75rem",
                      letterSpacing: "0.1em",
                      color: "#187C19",
                    }}
                  >
                    {student.course}
                  </p>
                </div>

                <div
                  className="row"
                  style={{
                    borderTop: "1px solid rgba(0,0,0,0.05)",
                    paddingTop: 24,
                  }}
                >
                  <div className="col-6" style={{ marginBottom: 16 }}>
                    <p
                      className="text-uppercase fw-black"
                      style={{
                        fontSize: "0.625rem",
                        color: "#999",
                        letterSpacing: "0.1em",
                        marginBottom: 4,
                      }}
                    >
                      Student ID
                    </p>
                    <p className="fw-bold" style={{ fontSize: "0.95rem" }}>
                      {student.student_id}
                    </p>
                  </div>
                  <div className="col-6" style={{ marginBottom: 16 }}>
                    <p
                      className="text-uppercase fw-black"
                      style={{
                        fontSize: "0.625rem",
                        color: "#999",
                        letterSpacing: "0.1em",
                        marginBottom: 4,
                      }}
                    >
                      Member Since
                    </p>
                    <p className="fw-bold" style={{ fontSize: "0.95rem" }}>
                      {formatDate(student.created_at)}
                    </p>
                  </div>
                  <div className="col-12">
                    <p
                      className="text-uppercase fw-black"
                      style={{
                        fontSize: "0.625rem",
                        color: "#999",
                        letterSpacing: "0.1em",
                        marginBottom: 4,
                      }}
                    >
                      Official Email
                    </p>
                    <p
                      className="fw-bold"
                      style={{
                        fontSize: "0.95rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {student.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="row" style={{ gap: 16 }}>
            {/* View Attendance */}
            <Link
              to="/attendance-record"
              className="col glass-card p-4 rounded-4 d-flex align-items-center gap-3 text-decoration-none"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(0,0,0,0.05)",
                borderRadius: "2rem",
                transition: "all 0.2s",
                flex: "1 1 calc(50% - 8px)",
                minWidth: 200,
              }}
            >
              <div
                className="d-flex align-items-center justify-content-center rounded-3"
                style={{
                  width: 48,
                  height: 48,
                  background: "rgba(16,185,129,0.1)",
                  color: "#187C19",
                  transition: "transform 0.2s",
                }}
              >
                <ListChecks className="w-6 h-6" />
              </div>
              <div>
                <p
                  className="fw-black text-uppercase"
                  style={{ fontSize: "0.625rem", letterSpacing: "0.1em", color: "#999", marginBottom: 0 }}
                >
                  View
                </p>
                <p className="fw-black mb-0" style={{ fontSize: "0.875rem", color: "#111" }}>
                  Attendance
                </p>
              </div>
            </Link>

            {/* Track Payments */}
            <Link
              to="/payments"
              className="col glass-card p-4 rounded-4 d-flex align-items-center gap-3 text-decoration-none"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(0,0,0,0.05)",
                borderRadius: "2rem",
                transition: "all 0.2s",
                flex: "1 1 calc(50% - 8px)",
                minWidth: 200,
              }}
            >
              <div
                className="d-flex align-items-center justify-content-center rounded-3"
                style={{
                  width: 48,
                  height: 48,
                  background: "rgba(24,124,25,0.1)",
                  color: "#187C19",
                  transition: "transform 0.2s",
                }}
              >
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <p
                  className="fw-black text-uppercase"
                  style={{ fontSize: "0.625rem", letterSpacing: "0.1em", color: "#999", marginBottom: 0 }}
                >
                  Track
                </p>
                <p className="fw-black mb-0" style={{ fontSize: "0.875rem", color: "#111" }}>
                  Payments
                </p>
              </div>
            </Link>

            {/* Contact Support */}
            <button
              onClick={() => setShowSupportModal(true)}
              className="col glass-card p-4 rounded-4 d-flex align-items-center gap-3 text-start w-100 border-0"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(0,0,0,0.05)",
                borderRadius: "2rem",
                transition: "all 0.2s",
                flex: "1 1 calc(50% - 8px)",
                minWidth: 200,
                cursor: "pointer",
              }}
            >
              <div
                className="d-flex align-items-center justify-content-center rounded-3"
                style={{
                  width: 48,
                  height: 48,
                  background: "rgba(59,130,246,0.1)",
                  color: "#2563eb",
                  transition: "transform 0.2s",
                }}
              >
                <Headset className="w-6 h-6" />
              </div>
              <div>
                <p
                  className="fw-black text-uppercase"
                  style={{ fontSize: "0.625rem", letterSpacing: "0.1em", color: "#999", marginBottom: 0 }}
                >
                  Get Help
                </p>
                <p className="fw-black mb-0" style={{ fontSize: "0.875rem", color: "#111" }}>
                  Contact Support
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Right: QR Section (5 cols on lg) */}
        <div className="col-12 col-lg-5" style={{ marginBottom: 24 }}>
          <div
            className="glass-card p-4 p-md-5 text-center sticky-top"
            style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(16px)",
              border: "2px solid rgba(24,124,25,0.1)",
              borderRadius: "2.5rem",
              boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
              top: 96,
            }}
          >
            {/* Decorative bar */}
            <div
              className="mx-auto mb-4"
              style={{
                width: 96,
                height: 8,
                borderRadius: 4,
                background: "linear-gradient(135deg, #187C19, #2ecc40)",
                opacity: 0.2,
              }}
            />

            <h3 className="fw-black tracking-tighter mb-2" style={{ fontSize: "1.5rem" }}>
              Active QR Code
            </h3>
            <p className="text-sm fw-medium mb-4" style={{ color: "#999" }}>
              Scan at any official station for secure attendance tracking.
            </p>

            {/* QR Code Display */}
            <div
              className="d-inline-block position-relative mb-4"
              style={{
                background: "white",
                padding: 24,
                borderRadius: 48,
                boxShadow: "inset 0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <div
                className="position-absolute"
                style={{
                  inset: 0,
                  background: "rgba(24,124,25,0.05)",
                  borderRadius: 48,
                  transform: "scale(1.1)",
                  filter: "blur(16px)",
                  opacity: 0,
                  transition: "opacity 0.3s",
                  pointerEvents: "none",
                }}
              />
              {student.qr_code && !qrError ? (
                <img
                  id="studentQR"
                  src={`/qr_images/${student.qr_code}`}
                  alt="QR Code"
                  className="position-relative"
                  style={{ width: 192, height: 192 }}
                  onError={() => setQrError(true)}
                />
              ) : (
                <div
                  className="d-flex flex-column align-items-center justify-content-center position-relative"
                  style={{
                    width: 192,
                    height: 192,
                    background: "#f9fafb",
                    borderRadius: 16,
                  }}
                >
                  <QrCode className="mb-2" style={{ width: 48, height: 48, color: "#d1d5db" }} />
                  <p className="text-sm fw-medium" style={{ color: "#9ca3af", marginBottom: 12 }}>
                    QR not generated
                  </p>
                  <button
                    onClick={regenerateQR}
                    disabled={regenerating}
                    className="btn btn-sm px-3 py-2 rounded-3 fw-bold text-white border-0"
                    style={{
                      background: "#187C19",
                      fontSize: "0.75rem",
                      cursor: regenerating ? "not-allowed" : "pointer",
                      opacity: regenerating ? 0.7 : 1,
                    }}
                  >
                    {regenerating ? "Generating..." : "Generate Now"}
                  </button>
                </div>
              )}
            </div>

            {/* Download Identity Card */}
            <Link
              to="/qr-card"
              className="w-100 d-flex align-items-center justify-content-center gap-2 py-3 rounded-4 fw-bold text-white border-0 text-decoration-none"
              style={{
                background: "#187C19",
                boxShadow: "0 4px 16px rgba(24,124,25,0.3)",
                borderRadius: 28,
                transition: "all 0.2s",
              }}
            >
              <Download className="w-5 h-5" />
              Download Identity Card
            </Link>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPassModal && (
        <div
          className="sq-modal d-flex align-items-center justify-content-center position-fixed"
          style={{
            inset: 0,
            zIndex: 200,
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPassModal(false)
          }}
        >
          <div
            className="modal-content-wrapper"
            style={{
              background: "white",
              width: "100%",
              maxWidth: 448,
              borderRadius: 32,
              overflow: "hidden",
              boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ padding: 32 }}>
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h3 className="fw-black tracking-tight mb-0" style={{ fontSize: "1.5rem" }}>
                  Security
                </h3>
                <button
                  onClick={() => setShowPassModal(false)}
                  className="d-flex align-items-center justify-content-center border-0 rounded-3"
                  style={{
                    width: 40,
                    height: 40,
                    background: "transparent",
                    color: "#999",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePassSubmit} className="space-y-4">
                <div style={{ marginBottom: 16 }}>
                  <label
                    className="fw-black text-uppercase mb-1 d-block"
                    style={{ fontSize: "0.625rem", letterSpacing: "0.1em", color: "#999" }}
                  >
                    Current Password
                  </label>
                  <div className="position-relative">
                    <input
                      type={showPassFields.current ? "text" : "password"}
                      value={passForm.current_password}
                      onChange={(e) => setPassForm({ ...passForm, current_password: e.target.value })}
                      required
                      className="w-100 border-0 rounded-4 px-4 py-3"
                      style={{ background: "#f5f5f5", fontSize: "0.9rem", outline: "none" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassFields({ ...showPassFields, current: !showPassFields.current })}
                      className="position-absolute border-0 bg-transparent"
                      style={{ right: 16, top: "50%", transform: "translateY(-50%)", color: "#999", cursor: "pointer" }}
                    >
                      {showPassFields.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label
                    className="fw-black text-uppercase mb-1 d-block"
                    style={{ fontSize: "0.625rem", letterSpacing: "0.1em", color: "#999" }}
                  >
                    New Password
                  </label>
                  <div className="position-relative">
                    <input
                      type={showPassFields.new ? "text" : "password"}
                      value={passForm.new_password}
                      onChange={(e) => setPassForm({ ...passForm, new_password: e.target.value })}
                      required
                      className="w-100 border-0 rounded-4 px-4 py-3"
                      style={{ background: "#f5f5f5", fontSize: "0.9rem", outline: "none" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassFields({ ...showPassFields, new: !showPassFields.new })}
                      className="position-absolute border-0 bg-transparent"
                      style={{ right: 16, top: "50%", transform: "translateY(-50%)", color: "#999", cursor: "pointer" }}
                    >
                      {showPassFields.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label
                    className="fw-black text-uppercase mb-1 d-block"
                    style={{ fontSize: "0.625rem", letterSpacing: "0.1em", color: "#999" }}
                  >
                    Confirm New Password
                  </label>
                  <div className="position-relative">
                    <input
                      type={showPassFields.confirm ? "text" : "password"}
                      value={passForm.confirm_password}
                      onChange={(e) => setPassForm({ ...passForm, confirm_password: e.target.value })}
                      required
                      className="w-100 border-0 rounded-4 px-4 py-3"
                      style={{ background: "#f5f5f5", fontSize: "0.9rem", outline: "none" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassFields({ ...showPassFields, confirm: !showPassFields.confirm })}
                      className="position-absolute border-0 bg-transparent"
                      style={{ right: 16, top: "50%", transform: "translateY(-50%)", color: "#999", cursor: "pointer" }}
                    >
                      {showPassFields.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-100 border-0 rounded-4 fw-bold text-white py-3"
                  style={{
                    background: "#187C19",
                    boxShadow: "0 4px 12px rgba(24,124,25,0.3)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  Update Password
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Contact Support Modal */}
      {showSupportModal && (
        <div
          className="sq-modal d-flex align-items-center justify-content-center position-fixed"
          style={{
            inset: 0,
            zIndex: 200,
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSupportModal(false)
          }}
        >
          <div
            className="modal-content-wrapper"
            style={{
              background: "white",
              width: "100%",
              maxWidth: 544,
              borderRadius: 32,
              overflow: "hidden",
              boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ padding: 32 }}>
              <div className="d-flex align-items-start justify-content-between mb-4">
                <div>
                  <h3 className="fw-black tracking-tight mb-1" style={{ fontSize: "1.5rem" }}>
                    Contact Support
                  </h3>
                  <p className="mb-0" style={{ fontSize: "0.875rem", color: "#999" }}>
                    Have a question or need help? We're here for you.
                  </p>
                </div>
                <button
                  onClick={() => setShowSupportModal(false)}
                  className="d-flex align-items-center justify-content-center border-0 rounded-3 flex-shrink-0"
                  style={{
                    width: 40,
                    height: 40,
                    background: "transparent",
                    color: "#999",
                    cursor: "pointer",
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSupportSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label
                    className="fw-black text-uppercase mb-1 d-block"
                    style={{ fontSize: "0.625rem", letterSpacing: "0.1em", color: "#999" }}
                  >
                    Subject
                  </label>
                  <select
                    value={supportForm.subject}
                    onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                    required
                    className="w-100 border-0 rounded-4 px-4 py-3"
                    style={{ background: "#f5f5f5", fontSize: "0.9rem", outline: "none" }}
                  >
                    <option value="">Select a topic...</option>
                    <option value="Password Reset Issue">🔑 Password Reset Issue</option>
                    <option value="Account Problem">👤 Account Problem</option>
                    <option value="Attendance Issue">📋 Attendance Issue</option>
                    <option value="Payment Concern">💳 Payment Concern</option>
                    <option value="QR Code Not Working">📱 QR Code Not Working</option>
                    <option value="Confession Issue">💬 Confession Issue</option>
                    <option value="Bug Report">🐛 Bug Report</option>
                    <option value="Feature Request">💡 Feature Request</option>
                    <option value="Other">📝 Other</option>
                  </select>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label
                    className="fw-black text-uppercase mb-1 d-block"
                    style={{ fontSize: "0.625rem", letterSpacing: "0.1em", color: "#999" }}
                  >
                    Message
                  </label>
                  <textarea
                    value={supportForm.message}
                    onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                    rows={5}
                    required
                    minLength={10}
                    maxLength={5000}
                    className="w-100 border-0 rounded-4 px-4 py-3"
                    style={{
                      background: "#f5f5f5",
                      fontSize: "0.9rem",
                      outline: "none",
                      resize: "vertical",
                    }}
                    placeholder="Describe your issue in detail..."
                  />
                  <div className="text-end" style={{ fontSize: "0.625rem", color: "#999" }}>
                    {supportForm.message.length}/5000
                  </div>
                </div>

                {supportError && (
                  <div
                    className="text-sm fw-medium mb-3"
                    style={{ color: "#dc2626", fontSize: "0.875rem" }}
                  >
                    {supportError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={supportSending}
                  className="w-100 border-0 rounded-4 fw-bold text-white py-3 d-flex align-items-center justify-content-center gap-2"
                  style={{
                    background: "#187C19",
                    boxShadow: "0 4px 12px rgba(24,124,25,0.3)",
                    cursor: supportSending ? "not-allowed" : "pointer",
                    opacity: supportSending ? 0.7 : 1,
                    transition: "all 0.2s",
                  }}
                >
                  <Send className="w-4 h-4" />
                  {supportSending ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Session Message Modal */}
      {showMessageModal && (
        <div
          className="sq-modal d-flex align-items-center justify-content-center position-fixed"
          style={{
            inset: 0,
            zIndex: 300,
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowMessageModal(false)
          }}
        >
          <div
            className="modal-content-wrapper text-center"
            style={{
              background: "white",
              width: "100%",
              maxWidth: 384,
              borderRadius: 32,
              padding: 32,
              boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background:
                  messageType === "success"
                    ? "rgba(16,185,129,0.1)"
                    : "rgba(239,68,68,0.1)",
                color: messageType === "success" ? "#10b981" : "#ef4444",
              }}
            >
              {messageType === "success" ? (
                <CheckCircle className="w-8 h-8" />
              ) : (
                <AlertCircle className="w-8 h-8" />
              )}
            </div>
            <h4 className="fw-black mb-4" style={{ fontSize: "1.25rem" }}>
              {messageText}
            </h4>
            <button
              onClick={() => setShowMessageModal(false)}
              className="w-100 border-0 rounded-4 fw-black text-uppercase py-3"
              style={{
                background: "#f5f5f5",
                fontSize: "0.625rem",
                letterSpacing: "0.1em",
                color: "#999",
                cursor: "pointer",
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .row {
          display: flex;
          flex-wrap: wrap;
        }
        .col-12 { flex: 0 0 100%; max-width: 100%; }
        .col-6 { flex: 0 0 50%; max-width: 50%; }
        .col-4 { flex: 0 0 33.333%; max-width: 33.333%; }
        @media (min-width: 992px) {
          .col-lg-7 { flex: 0 0 calc(58.333% - 12px); max-width: calc(58.333% - 12px); }
          .col-lg-5 { flex: 0 0 calc(41.667% - 12px); max-width: calc(41.667% - 12px); }
        }
        .glass-card:hover .d-flex.align-items-center.justify-content-center.rounded-3 {
          transform: scale(1.1);
        }
        .d-flex { display: flex; }
        .flex-column { flex-direction: column; }
        .align-items-center { align-items: center; }
        .align-items-start { align-items: flex-start; }
        .justify-content-center { justify-content: center; }
        .justify-content-between { justify-content: space-between; }
        .text-center { text-align: center; }
        .text-start { text-align: left; }
        .text-end { text-align: right; }
        .fw-bold { font-weight: 700; }
        .fw-black { font-weight: 900; }
        .fw-medium { font-weight: 500; }
        .text-uppercase { text-transform: uppercase; }
        .mb-0 { margin-bottom: 0; }
        .mb-1 { margin-bottom: 4px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-3 { margin-bottom: 12px; }
        .mb-4 { margin-bottom: 16px; }
        .mt-2 { margin-top: 8px; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .me-3 { margin-right: 12px; }
        .ms-auto { margin-left: auto; }
        .gap-2 { gap: 8px; }
        .gap-3 { gap: 12px; }
        .gap-4 { gap: 16px; }
        .p-4 { padding: 16px; }
        .p-md-5 { padding: 24px; }
        .px-3 { padding-left: 12px; padding-right: 12px; }
        .px-4 { padding-left: 16px; padding-right: 16px; }
        .py-3 { padding-top: 12px; padding-bottom: 12px; }
        .py-4 { padding-top: 16px; padding-bottom: 16px; }
        .position-relative { position: relative; }
        .position-absolute { position: absolute; }
        .position-fixed { position: fixed; }
        .overflow-hidden { overflow: hidden; }
        .w-100 { width: 100%; }
        .h-100 { height: 100%; }
        .border-0 { border: none; }
        .rounded-3 { border-radius: 12px; }
        .rounded-4 { border-radius: 16px; }
        .rounded-5 { border-radius: 2rem; }
        .text-decoration-none { text-decoration: none; }
        .text-white { color: white; }
        .text-truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .shadow-sm { box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
        .flex-shrink-0 { flex-shrink: 0; }
        .flex-1 { flex: 1; }
        .sticky-top { position: sticky; top: 96px; }
        .btn-sm { padding: 4px 12px; font-size: 0.8rem; }
        .sticky-top { position: sticky; top: 96px; }
        .glass-card a:hover div:first-child,
        .glass-card button:hover div:first-child {
          transform: scale(1.1);
        }
        .glass-card a:hover,
        .glass-card button:hover {
          border-color: rgba(24,124,25,0.3) !important;
        }
        .modal-content-wrapper {
          animation: modalIn 0.3s ease;
        }
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
