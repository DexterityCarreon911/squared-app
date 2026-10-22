import { Outlet, Link, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Menu, X, LogOut, User,
  QrCode, ClipboardList, Bell, Scan, CreditCard, MessageSquare,
  Vote, Gamepad2, Settings, Moon, Sun,
  ShoppingBag,
} from "lucide-react"

const navItems = [
  { label: "Home", href: "/home", icon: LayoutDashboard },
  { label: "Card", href: "/qr-card", icon: QrCode },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Attendance Record", href: "/attendance-record", icon: ClipboardList },
  { label: "Attendance", href: "/attendance", icon: User },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Purchase History", href: "/student/purchases", icon: ShoppingBag },
  { label: "QR Quest", href: "/qr-quest", icon: Gamepad2 },
  { label: "Confessions", href: "/confessions", icon: MessageSquare },
  { label: "Voting", href: "/voting", icon: Vote },
  { label: "Scan Form", href: "/scan-form", icon: Scan },
  { label: "Generate QR", href: "/generate-qr", icon: QrCode },
]

const mobileNavItems = [
  { label: "Home", href: "/home", icon: LayoutDashboard },
  { label: "Card", href: "/qr-card", icon: QrCode },
  { label: "News", href: "/notifications", icon: Bell },
  { label: "Attendance", href: "/attendance-record", icon: ClipboardList },
]

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const pathname = useLocation().pathname

  // Dark mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("darkMode")
    if (saved === "true") {
      setDarkMode(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleDarkMode = () => {
    const next = !darkMode
    setDarkMode(next)
    localStorage.setItem("darkMode", String(next))
    if (next) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`} style={{ backgroundColor: darkMode ? "#0a1f0c" : "#fafafa" }}>
      {/* Desktop Navbar */}
      <nav
        className="hidden lg:flex fixed top-0 left-0 right-0 z-[100] items-center justify-between"
        style={{
          background: darkMode ? "rgba(10,31,12,0.9)" : "rgba(255,255,255,0.8)",
          backdropFilter: "blur(16px)",
          borderBottom: darkMode ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
          boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
          height: 80,
          padding: "0 24px",
        }}
      >
        <Link to="/home" className="flex items-center gap-3 group" style={{ textDecoration: "none" }}>
          <div
            style={{
              width: 40,
              height: 40,
              background: darkMode ? "rgba(0,0,0,0.2)" : "white",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              transition: "transform 0.3s",
            }}
            className="group-hover:scale-110"
          >
            <img src="/images/Squared_Logo.png" alt="Logo" className="w-full h-auto" />
          </div>
          <span
            className="text-xl font-black tracking-tighter"
            style={{ color: darkMode ? "#2ecc40" : "#187C19" }}
          >
            SQUARED
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {navItems.slice(0, 7).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center gap-2 px-3 py-2"
                style={{
                  borderRadius: 16,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  transition: "all 0.2s",
                  backgroundColor: isActive ? "#187C19" : "transparent",
                  color: isActive
                    ? "white"
                    : darkMode
                    ? "rgba(46,204,64,0.6)"
                    : "#666",
                  boxShadow: isActive ? "0 4px 12px rgba(24,124,25,0.3)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = darkMode
                      ? "rgba(24,124,25,0.1)"
                      : "rgba(24,124,25,0.05)"
                    e.currentTarget.style.color = darkMode ? "#2ecc40" : "#187C19"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent"
                    e.currentTarget.style.color = darkMode
                      ? "rgba(46,204,64,0.6)"
                      : "#666"
                  }
                }}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              color: darkMode ? "rgba(46,204,64,0.6)" : "#666",
              transition: "all 0.2s",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Link
            to="/logout"
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              backgroundColor: darkMode ? "rgba(255,0,0,0.1)" : "#fef2f2",
              color: darkMode ? "#f87171" : "#dc2626",
              transition: "all 0.2s",
              textDecoration: "none",
            }}
          >
            <LogOut className="w-5 h-5" />
          </Link>
        </div>
      </nav>

      {/* Mobile Header */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4"
        style={{
          height: 64,
          background: darkMode ? "rgba(10,31,12,0.9)" : "rgba(255,255,255,0.9)",
          backdropFilter: "blur(16px)",
          borderBottom: darkMode ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <span
          className="text-lg font-black tracking-tighter"
          style={{ color: darkMode ? "#2ecc40" : "#187C19" }}
        >
          SQUARED
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              color: darkMode ? "rgba(46,204,64,0.6)" : "#666",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              color: darkMode ? "#f87171" : "#dc2626",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "linear-gradient(135deg, #0D5B11 0%, #187019 100%)",
          boxShadow: "3px 0 15px rgba(0,0,0,0.1)",
          paddingTop: 64,
          zIndex: 1050,
        }}
      >
        <div style={{ padding: "20px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <img src="/images/Squared_Logo.png" alt="Logo" style={{ width: 50, height: 50, borderRadius: 8, marginBottom: 10 }} />
          <span style={{ color: "white", fontWeight: 700, fontSize: "1.1rem", display: "block" }}>Student Portal</span>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 180px)" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3"
                style={{
                  borderRadius: 8,
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                  backgroundColor: isActive ? "#69B41E" : "transparent",
                  color: "white",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  boxShadow: isActive ? "0 4px 12px rgba(105,180,30,0.3)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)"
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "transparent"
                }}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
          <div style={{ paddingTop: 20, marginTop: 20, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <Link
              to="/logout"
              className="flex items-center gap-3 px-4 py-3"
              style={{
                borderRadius: 8,
                textDecoration: "none",
                color: "white",
                fontWeight: 500,
                fontSize: "0.9rem",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main
        style={{
          paddingTop: 80,
          paddingBottom: 80,
          minHeight: "100vh",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[100]"
        style={{
          background: darkMode ? "rgba(10,31,12,0.95)" : "rgba(255,255,255,0.95)",
          backdropFilter: "blur(32px)",
          borderTop: darkMode ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
          boxShadow: "0 -1px 10px rgba(0,0,0,0.05)",
          height: 64,
        }}
      >
        <div className="flex justify-around items-center h-full px-2">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex flex-col items-center gap-1 px-3 py-1"
                style={{
                  textDecoration: "none",
                  transition: "all 0.2s",
                  color: isActive
                    ? "#187C19"
                    : darkMode
                    ? "rgba(46,204,64,0.6)"
                    : "#999",
                  transform: isActive ? "scale(1.1)" : "none",
                }}
              >
                <item.icon
                  className="w-5 h-5"
                  style={isActive ? { fill: "rgba(24,124,25,0.1)" } : undefined}
                />
                <span style={{ fontSize: "0.625rem", fontWeight: 700 }}>{item.label}</span>
              </Link>
            )
          })}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center gap-1 px-3 py-1"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: darkMode ? "rgba(46,204,64,0.6)" : "#999",
            }}
          >
            <Menu className="w-5 h-5" />
            <span style={{ fontSize: "0.625rem", fontWeight: 700 }}>More</span>
          </button>
        </div>
      </div>
    </div>
  )
}
