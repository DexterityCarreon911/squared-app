import { Outlet, Link, useLocation } from "react-router-dom"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard, Users, Calendar, Megaphone, MessageSquare,
  Menu, X, LogOut, ChevronDown, CreditCard, Sliders, BarChart3,
} from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Students", href: "/admin/students", icon: Users },
  { label: "Events", href: "/admin/events", icon: Calendar },
  { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { label: "Confessions", href: "/admin/confessions", icon: MessageSquare },
  { label: "Scanner", href: "/admin/scanner", icon: BarChart3 },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Support", href: "/admin/support", icon: MessageSquare },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = useLocation().pathname

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link to="/admin" className="flex items-center gap-2">
              <img src="/images/Squared_Logo.png" alt="Squared" className="h-8 w-8" />
              <span className="font-bold text-xl text-[#187C19]">Squared Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto pt-16 lg:pt-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-[#187C19] text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-[#187C19]"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
