import { Outlet, Link } from "react-router-dom"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import {
  LayoutDashboard, Menu, X, LogOut, User, Settings, ChevronDown,
} from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/home", icon: LayoutDashboard },
  { label: "Attendance", href: "/attendance", icon: User },
  { label: "Confessions", href: "/confessions", icon: User },
  { label: "Voting", href: "/voting", icon: User },
  { label: "QR Quest", href: "/qr-quest", icon: User },
  { label: "Payments", href: "/payments", icon: User },
]

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <img src="/images/Squared_Logo.png" alt="Squared" className="h-8 w-8" />
              <span className="font-bold text-xl text-[#187C19]">Squared</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4 mr-1" /> Settings
            </Button>
            <Avatar className="w-8 h-8">
              <AvatarImage src="/avatars/JOY.png" alt="Avatar" />
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto pt-16 lg:pt-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-[#187C19] transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
            <Button variant="outline" className="w-full justify-start text-red-500" asChild>
              <Link to="/logout"><LogOut className="w-4 h-4 mr-2" /> Logout</Link>
            </Button>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
