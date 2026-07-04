import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Eye, EyeOff, Lock, User, Shield, Bolt, ChartLine } from "lucide-react"

export default function AdminLogin() {
  const navigate = useNavigate()
  const { loginAdmin } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [cardHovered, setCardHovered] = useState(false)

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/admin/php/check_session.php", {
          credentials: "include",
        })
        if (res.ok) {
          const data = await res.json()
          if (data.authenticated) {
            await loginAdmin("", "", "")
            navigate("/admin/dashboard", { replace: true })
          }
        }
      } catch {}
    }
    checkAuth()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!username || !password) {
      setError("Please enter both username and password.")
      setLoading(false)
      return
    }

    try {
      const formData = new URLSearchParams({
        username,
        password,
        csrf_token: "",
      })
      const res = await fetch("/admin/php/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        await loginAdmin(username, password, "")
        setTimeout(() => {
          navigate(data.redirect || "/admin/dashboard", { replace: true })
        }, 800)
      } else {
        setError(data.message || "Access denied.")
        setLoading(false)
      }
    } catch {
      setError("System error. Try again later.")
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        fontFamily: "'Nunito', sans-serif",
        background: "linear-gradient(135deg, #f5f9f6 0%, #e8f4e9 100%)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Branding Navbar */}
      <div
        style={{
          background: "linear-gradient(135deg, #0D5B11 0%, #187019 100%)",
          boxShadow: "0 4px 20px rgba(13, 91, 17, 0.15)",
          padding: "15px 25px",
          display: "flex",
          alignItems: "center",
          position: "relative",
        }}
      >
        <img
          src="/images/Squared_Logo.png"
          alt="Squared Logo"
          style={{ height: 42, marginRight: 15, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
        />
        <span
          style={{
            fontWeight: 800,
            fontSize: "1.5rem",
            color: "white",
            letterSpacing: "0.5px",
            textShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        >
          Squared Admin
        </span>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: 4,
            background: "linear-gradient(90deg, #69B41E, #8DC71E, #B88D53)",
          }}
        />
      </div>

      {/* Background Shapes */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "#0D5B11",
            opacity: 0.05,
            top: -150,
            right: -100,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "#69B41E",
            opacity: 0.05,
            bottom: -80,
            left: -80,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: "#B88D53",
            opacity: 0.05,
            top: "50%",
            left: "10%",
          }}
        />
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "30px 20px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ width: "100%", maxWidth: 450, margin: "0 auto" }}>
          <div
            className="admin-login-card"
            onMouseEnter={() => setCardHovered(true)}
            onMouseLeave={() => setCardHovered(false)}
            style={{
              border: "none",
              borderRadius: 20,
              boxShadow: cardHovered
                ? "0 20px 50px rgba(13, 91, 17, 0.18)"
                : "0 15px 40px rgba(13, 91, 17, 0.12)",
              overflow: "hidden",
              transition: "transform 0.4s ease, box-shadow 0.4s ease",
              transform: cardHovered ? "translateY(-8px)" : "none",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
            }}
          >
            {/* Card Header */}
            <div
              className="admin-login-header"
              style={{
                background: "linear-gradient(135deg, #0D5B11 0%, #187019 100%)",
                color: "white",
                fontWeight: 800,
                fontSize: "1.6rem",
                textAlign: "center",
                padding: 25,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Lock className="me-2" style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }} />
              Admin Login
              {/* Shine overlay */}
              <div
                className="shine-overlay"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background:
                    "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
                  transform: "translateX(-100%)",
                  pointerEvents: "none",
                }}
              />
            </div>

            {/* Card Body */}
            <div style={{ padding: 35 }}>
              {/* Error Alert */}
              {error && (
                <div
                  style={{
                    borderRadius: 12,
                    border: "none",
                    padding: "15px 20px",
                    marginBottom: 25,
                    backgroundColor: "rgba(220, 53, 69, 0.1)",
                    color: "#dc3545",
                    borderLeft: "4px solid #dc3545",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    animation: "fadeIn 0.5s ease",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Username Input */}
                <div style={{ position: "relative", marginBottom: 25 }}>
                  <User
                    className="w-5 h-5"
                    style={{
                      position: "absolute",
                      left: 15,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#187019",
                      zIndex: 5,
                    }}
                  />
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                    style={{
                      borderRadius: 12,
                      padding: "15px 20px 15px 45px",
                      border: "2px solid #e0e0e0",
                      transition: "all 0.3s",
                      fontSize: "1rem",
                      backgroundColor: "#f9fdfa",
                      height: 55,
                      width: "100%",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#69B41E"
                      e.target.style.boxShadow = "0 0 0 0.25rem rgba(105, 180, 30, 0.2)"
                      e.target.style.backgroundColor = "white"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e0e0e0"
                      e.target.style.boxShadow = "none"
                      e.target.style.backgroundColor = "#f9fdfa"
                    }}
                  />
                </div>

                {/* Password Input */}
                <div style={{ position: "relative", marginBottom: 25 }}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#187019"
                    strokeWidth="2"
                    style={{
                      position: "absolute",
                      left: 15,
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 5,
                    }}
                  >
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                  </svg>
                  <input
                    type={showPw ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    style={{
                      borderRadius: 12,
                      padding: "15px 45px 15px 45px",
                      border: "2px solid #e0e0e0",
                      transition: "all 0.3s",
                      fontSize: "1rem",
                      backgroundColor: "#f9fdfa",
                      height: 55,
                      width: "100%",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#69B41E"
                      e.target.style.boxShadow = "0 0 0 0.25rem rgba(105, 180, 30, 0.2)"
                      e.target.style.backgroundColor = "white"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e0e0e0"
                      e.target.style.boxShadow = "none"
                      e.target.style.backgroundColor = "#f9fdfa"
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    style={{
                      position: "absolute",
                      right: 15,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "#777",
                      cursor: "pointer",
                      zIndex: 10,
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="admin-login-btn"
                  style={{
                    background: loading
                      ? "linear-gradient(to right, #69B41E, #8DC71E)"
                      : "linear-gradient(to right, #69B41E, #8DC71E)",
                    border: "none",
                    borderRadius: 12,
                    padding: 15,
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: "white",
                    width: "100%",
                    height: 55,
                    marginTop: 10,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 4px 15px rgba(105, 180, 30, 0.3)",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background =
                        "linear-gradient(to right, #187019, #69B41E)"
                      e.currentTarget.style.transform = "translateY(-3px)"
                      e.currentTarget.style.boxShadow = "0 7px 20px rgba(105, 180, 30, 0.4)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background =
                        "linear-gradient(to right, #69B41E, #8DC71E)"
                      e.currentTarget.style.transform = "none"
                      e.currentTarget.style.boxShadow = "0 4px 15px rgba(105, 180, 30, 0.3)"
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        style={{
                          width: "1rem",
                          height: "1rem",
                          borderWidth: "0.15em",
                          borderRightColor: "transparent",
                          borderRadius: "50%",
                          display: "inline-block",
                          animation: "spin 0.75s linear infinite",
                          border: "0.15em solid currentColor",
                          verticalAlign: "middle",
                          marginRight: 8,
                        }}
                      />
                      Checking...
                    </>
                  ) : (
                    <>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }}
                      >
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                      </svg>
                      Login to Dashboard
                    </>
                  )}
                </button>
              </form>

              {/* Error Result Area */}
              <div id="loginResult" style={{ minHeight: 24, fontWeight: 600, padding: 10, borderRadius: 8 }} />

              {/* Features */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 25,
                  paddingTop: 20,
                  borderTop: "1px solid #eee",
                }}
              >
                <div style={{ textAlign: "center", flex: 1, padding: "0 10px" }}>
                  <Shield
                    className="w-6 h-6"
                    style={{ color: "#187019", marginBottom: 8, display: "inline-block" }}
                  />
                  <div style={{ fontSize: "0.85rem", color: "#666" }}>Secure Access</div>
                </div>
                <div style={{ textAlign: "center", flex: 1, padding: "0 10px" }}>
                  <Bolt
                    className="w-6 h-6"
                    style={{ color: "#187019", marginBottom: 8, display: "inline-block" }}
                  />
                  <div style={{ fontSize: "0.85rem", color: "#666" }}>Fast Performance</div>
                </div>
                <div style={{ textAlign: "center", flex: 1, padding: "0 10px" }}>
                  <ChartLine
                    className="w-6 h-6"
                    style={{ color: "#187019", marginBottom: 8, display: "inline-block" }}
                  />
                  <div style={{ fontSize: "0.85rem", color: "#666" }}>Analytics Ready</div>
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  textAlign: "center",
                  marginTop: 30,
                  color: "#777",
                  fontSize: "0.9rem",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M10 9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V9z" />
                </svg>{" "}
                {new Date().getFullYear()} Squared Admin. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .admin-login-card:hover .shine-overlay {
          animation: shine 1.5s ease;
        }
        .admin-login-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: 0.5s;
        }
        .admin-login-btn:hover::before {
          left: 100%;
        }
      `}</style>
    </div>
  )
}
