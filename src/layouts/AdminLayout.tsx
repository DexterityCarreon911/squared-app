import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  LayoutDashboard, Users, Calendar, Megaphone, MessageSquare,
  Menu, X, LogOut, CreditCard, Sliders, BarChart3, Vote,
  ClipboardList, Gamepad2, Settings, ChevronLeft, QrCode,
} from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Students", href: "/admin/students", icon: Users },
  { label: "Scanner", href: "/admin/scanner", icon: BarChart3 },
  { label: "Events", href: "/admin/events", icon: Calendar },
  { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { label: "Voting", href: "/admin/voting", icon: Vote },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Slider", href: "/admin/slider", icon: Sliders },
  { label: "Evaluations", href: "/admin/evaluations", icon: ClipboardList },
  { label: "QR Quest", href: "/admin/qr-quest", icon: Gamepad2 },
  { label: "QR Scanner", href: "/admin/qr-scanner", icon: QrCode },
  { label: "Confessions", href: "/admin/confessions", icon: MessageSquare },
  { label: "Support", href: "/admin/support", icon: MessageSquare },
  { label: "Settings", href: "/admin/settings", icon: Settings },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = useLocation().pathname
  const navigate = useNavigate()
  const { logoutAdmin } = useAuth()

  const handleLogout = async () => {
    try {
      await fetch("/admin/php/logout.php", { credentials: "include" })
    } catch {}
    logoutAdmin()
    navigate("/admin")
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fbf9" }}>
      {/* Top Navbar */}
      <nav
        className="navbar navbar-dark sticky-top"
        style={{
          background: "linear-gradient(135deg, #0D5B11 0%, #187019 100%)",
          boxShadow: "0 2px 15px rgba(13, 91, 17, 0.2)",
          zIndex: 1030,
        }}
      >
        <div className="container-fluid px-4">
          <div className="d-flex align-items-center gap-0 w-100">
            <button
              className="btn btn-sm d-flex align-items-center justify-content-center text-white me-3"
              style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.5)" }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <span
              className="fw-bold text-white"
              style={{ fontSize: "1.4rem" }}
            >
              Squared Admin
            </span>
            <div className="ms-auto d-flex align-items-center gap-3">
              <span className="text-white d-none d-md-block" style={{ fontSize: "0.875rem", opacity: 0.9 }}>
                Welcome, Administrator
              </span>
              <button
                className="btn btn-sm d-flex align-items-center justify-content-center text-white d-md-none"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.5)",
                }}
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="d-flex position-relative">
        {/* Sidebar */}
        <aside
          id="sidebar"
          className={`${sidebarCollapsed ? "collapsed" : ""} ${sidebarOpen ? "mobile-open" : ""}`}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            width: 280,
            background: "linear-gradient(135deg, #0D5B11 0%, #187019 100%)",
            transition: "all 0.3s ease",
            zIndex: 1050,
            boxShadow: "3px 0 15px rgba(0,0,0,0.1)",
            overflowY: "auto",
            transform: sidebarOpen ? "translateX(0)" : undefined,
          }}
        >
          {/* Sidebar Header */}
          <div style={{ padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
            <img
              src="/images/Squared_Logo.png"
              alt="Squared Logo"
              style={{ width: 50, height: 50, marginBottom: 10, borderRadius: 8 }}
            />
            <span style={{ color: "white", fontWeight: 700, fontSize: "1.2rem", display: "block" }}>
              Squared Admin
            </span>
          </div>

          {/* Nav Items */}
          <ul className="nav flex-column" style={{ padding: "10px 0" }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li className="nav-item" key={item.href}>
                  <Link
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="nav-link"
                    style={{
                      color: "white",
                      padding: "15px 20px",
                      borderRadius: 8,
                      margin: "5px 15px",
                      display: "flex",
                      alignItems: "center",
                      gap: 15,
                      fontWeight: 500,
                      textDecoration: "none",
                      transition: "all 0.3s ease",
                      backgroundColor: isActive ? "#69B41E" : "transparent",
                      boxShadow: isActive ? "0 4px 12px rgba(105, 180, 30, 0.3)" : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)"
                        e.currentTarget.style.transform = "translateX(5px)"
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent"
                        e.currentTarget.style.transform = "none"
                      }
                    }}
                  >
                    <item.icon className="w-5 h-5" style={{ flexShrink: 0 }} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}

            {/* Logout */}
            <li className="nav-item" style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <button
                onClick={handleLogout}
                className="nav-link w-100 text-start bg-transparent border-0"
                style={{
                  color: "white",
                  padding: "15px 20px",
                  borderRadius: 8,
                  margin: "5px 15px",
                  display: "flex",
                  alignItems: "center",
                  gap: 15,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)"
                  e.currentTarget.style.transform = "translateX(5px)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent"
                  e.currentTarget.style.transform = "none"
                }}
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </li>
          </ul>

          {/* Sidebar Footer */}
          <div style={{ padding: "20px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <button
              className="btn btn-sm"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.5)",
                color: "white",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="d-lg-none"
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 1040,
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main
          id="content"
          style={{
            marginLeft: 280,
            transition: "all 0.3s ease",
            padding: "20px",
            minHeight: "100vh",
            width: "100%",
            backgroundColor: "#f8fbf9",
          }}
        >
          <div className="container-fluid">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Override styles for mobile */}
      <style>{`
        @media (max-width: 767.98px) {
          #sidebar {
            transform: translateX(-280px);
            z-index: 1060;
          }
          #sidebar.mobile-open {
            transform: translateX(0);
          }
          #content {
            margin-left: 0 !important;
            padding: 15px !important;
          }
        }
        @media (min-width: 768px) {
          #sidebar {
            transform: translateX(0);
          }
          .navbar .d-md-none {
            display: none;
          }
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        #sidebar::-webkit-scrollbar { width: 4px; }
        #sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  )
}
