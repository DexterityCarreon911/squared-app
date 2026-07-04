import { Calendar, Shield, Bell, BarChart3, BadgeCheck, GitBranch, Smartphone, DollarSign, Rocket } from "lucide-react"

const features = [
  {
    icon: Calendar,
    title: "Event Management",
    desc: "Create, organize, and manage school events with ease. From seminars to sports meets, handle everything in one platform.",
    gradient: "from-[#3E9DD4] to-[#2AAD7A]",
  },
  {
    icon: Shield,
    title: "Secure Authentication",
    desc: "Multi-layered security to keep student data safe and protected at all times.",
    gradient: "from-[#5B46AE] to-[#7B3FAE]",
  },
  {
    icon: Bell,
    title: "Real-time Notifications",
    desc: "Instant alerts for events, announcements, and important updates. Never miss what matters.",
    gradient: "from-[#C4401C] to-[#F0931E]",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    desc: "Track attendance patterns, event participation, and generate comprehensive reports for better decision-making.",
    gradient: "from-[#87A52B] to-[#3B9E40]",
  },
  {
    icon: BadgeCheck,
    title: "Student Profiles",
    desc: "Personalized dashboards for students to view their attendance records, upcoming events, and achievements.",
    gradient: "from-[#C0395A] to-[#C83020]",
  },
  {
    icon: GitBranch,
    title: "Department Integration",
    desc: "Support for multiple departments (CBA, CELA, CJE, HME, ITE) with tailored experiences for each.",
    gradient: "from-[#2AABAB] to-[#3E9DD4]",
  },
  {
    icon: Smartphone,
    title: "Mobile-First PWA",
    desc: "Install as a native app on any device. Download your personalized QR card for quick and easy scanning at events.",
    gradient: "from-yellow-600 to-amber-500",
  },
  {
    icon: DollarSign,
    title: "Squared Pay",
    desc: "Scan-Pay-Go system for membership fee transactions with digital receipts and real-time tracking.",
    gradient: "from-[#5B46AE] to-[#2AAD7A]",
    badge: "Coming Soon",
  },
]

export default function BeyondAttendanceSection() {
  return (
    <section className="relative py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Subtle top line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-gradient-to-r from-[#1a1d28] to-[#3F51B5] text-white text-xs font-bold tracking-widest px-5 py-2 rounded-full uppercase mb-4">
            Beyond QR Scanning
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#1a1d28] mb-3">
            Squared is{" "}
            <span className="bg-gradient-to-r from-[#3F51B5] to-[#1a3a5c] bg-clip-text text-transparent">
              More Than Attendance
            </span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            A comprehensive digital ecosystem empowering student organizations
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon
            return (
              <div
                key={feat.title}
                className="group bg-white rounded-2xl p-6 md:p-7 shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-2"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center mx-auto mb-5 text-white text-xl transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-[#1a1d28] mb-2 text-center">
                  {feat.title}
                  {feat.badge && (
                    <span className="inline-block bg-amber-500 text-white text-[0.6rem] font-bold px-1.5 py-0.5 rounded ml-1.5 align-middle tracking-wide">
                      {feat.badge}
                    </span>
                  )}
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed text-center">{feat.desc}</p>
              </div>
            )
          })}
        </div>

        {/* Mission Statement */}
        <div className="mt-12 bg-[#1a1d28] rounded-2xl p-8 md:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-5 leading-tight">
                Building the Future of Student Organizations
              </h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Squared is a <strong className="text-white">digital transformation platform</strong>{" "}
                designed to modernize how student organizations operate. From attendance tracking to
                event management, from secure payments to real-time analytics — we&apos;re creating an
                ecosystem where technology empowers student leaders.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Our mission goes beyond convenience. We&apos;re building{" "}
                <strong className="text-white">sustainable, inclusive, and future-ready</strong> systems
                that will serve generations of students.
              </p>
            </div>
            <div className="hidden md:flex items-center justify-center">
              <Rocket className="w-32 h-32 text-white/15" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
