import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowRight, QrCode, Sparkles, Users, Shield } from "lucide-react"

const features = [
  { icon: QrCode, title: "QR Attendance", desc: "Seamless event attendance tracking with QR code scanning." },
  { icon: Sparkles, title: "Activity Evaluation", desc: "Real-time feedback and evaluation forms for every event." },
  { icon: Users, title: "Student Portal", desc: "Personal dashboard with attendance history and profiles." },
  { icon: Shield, title: "Admin Control", desc: "Full management suite for students, events, and payments." },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/Squared_Logo.png" alt="Squared" className="h-8 w-8" />
            <span className="text-xl font-bold text-[#187C19]">Squared</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Register</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-20 md:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-100 text-[#187C19] px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" /> Smart Attendance System
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Streamline Your{" "}
            <span className="text-[#187C19]">School Events</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            QR-based attendance tracking, real-time evaluations, and student management — all in one platform.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="xl" asChild>
              <Link to="/register">Get Started <ArrowRight className="w-5 h-5 ml-2" /></Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat) => (
            <div key={feat.title} className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <feat.icon className="w-6 h-6 text-[#187C19]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feat.title}</h3>
              <p className="text-gray-600 text-sm">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2026 Squared. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
