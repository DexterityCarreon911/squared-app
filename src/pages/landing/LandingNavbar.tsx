import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Menu, X, Sun, Moon } from "lucide-react"
import { useDarkMode } from "@/hooks/useDarkMode"

export default function LandingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isDark, toggle: toggleDark } = useDarkMode()

  const scrollTo = (id: string) => {
    setMenuOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-[9999] bg-[#187C19]/90 backdrop-blur-md shadow-lg transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white">
          <img
            src="/images/Squared_Logo.png"
            alt="Squared"
            className="h-10 w-10 rounded bg-white/20 p-1.5 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
            style={{ imageRendering: "auto" }}
          />
          <span className="text-xl font-bold tracking-tight">Squared</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => scrollTo("about-squared")}
            className="text-white/90 hover:text-white text-sm font-semibold transition-colors"
          >
            About
          </button>
          <button
            onClick={() => scrollTo("programs")}
            className="text-white/90 hover:text-white text-sm font-semibold transition-colors"
          >
            Programs
          </button>
          <button
            onClick={() => scrollTo("avatars")}
            className="text-white/90 hover:text-white text-sm font-semibold transition-colors"
          >
            Avatars
          </button>
          <button
            onClick={() => scrollTo("upcoming-events")}
            className="text-white/90 hover:text-white text-sm font-semibold transition-colors"
          >
            Events
          </button>
          <button
            onClick={toggleDark}
            className="text-white/90 hover:text-white p-2 rounded-lg transition-colors"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link
            to="/login"
            className="text-white/90 hover:text-white text-sm font-semibold transition-opacity"
          >
            Login
          </Link>
          <Button
            asChild
            className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold shadow-lg shadow-orange-500/30 rounded-xl px-6"
          >
            <Link to="/register">Register</Link>
          </Button>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#187C19] border-t border-white/20 px-4 pb-4 space-y-2">
          <button onClick={() => scrollTo("about-squared")} className="block w-full text-left text-white/90 py-2 text-sm font-semibold">
            About
          </button>
          <button onClick={() => scrollTo("programs")} className="block w-full text-left text-white/90 py-2 text-sm font-semibold">
            Programs
          </button>
          <button onClick={() => scrollTo("avatars")} className="block w-full text-left text-white/90 py-2 text-sm font-semibold">
            Avatars
          </button>
          <button onClick={() => scrollTo("upcoming-events")} className="block w-full text-left text-white/90 py-2 text-sm font-semibold">
            Events
          </button>
          <Link to="/login" className="block text-white/90 py-2 text-sm font-semibold" onClick={() => setMenuOpen(false)}>
            Login
          </Link>
          <Link
            to="/register"
            className="block text-center bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold py-2 px-4 rounded-xl mt-2"
            onClick={() => setMenuOpen(false)}
          >
            Register
          </Link>
          <button
            onClick={() => { toggleDark(); setMenuOpen(false) }}
            className="flex items-center gap-2 text-white/90 py-2 text-sm font-semibold"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      )}
    </nav>
  )
}
