import { QrCode, BarChart3, Users } from "lucide-react"

const features = [
  {
    icon: QrCode,
    title: "Scan QR Codes",
    desc: "Quick and secure attendance tracking with instant QR code scanning technology.",
    gradient: "from-[#69B41E] to-[#8DC71E]",
  },
  {
    icon: BarChart3,
    title: "View Analytics",
    desc: "Comprehensive analytics and detailed attendance reports with real-time data.",
    gradient: "from-blue-500 to-blue-400",
  },
  {
    icon: Users,
    title: "Manage Users",
    desc: "Efficiently manage users and their attendance records with advanced tools.",
    gradient: "from-orange-500 to-amber-400",
  },
]

export default function AboutSection() {
  return (
    <section
      id="about-squared"
      className="relative py-16 md:py-20 bg-gradient-to-br from-[#f8fdf0] via-white to-white overflow-hidden"
    >
      {/* Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#69B41E] via-[#187C19] to-[#0D5B11]" />

      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#187C19] to-[#69B41E] bg-clip-text text-transparent relative inline-block">
            About Squared
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#69B41E] to-[#8DC71E] rounded-full" />
          </h2>

          {/* Logos */}
          <div className="flex items-center justify-center gap-8 md:gap-12 mt-8 mb-6">
            <div className="text-center group cursor-pointer">
              <img
                src="/images/dcc_logo.png"
                alt="Davao Central College"
                className="h-20 md:h-24 w-auto mx-auto transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-lg"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
              />
              <p className="text-xs text-gray-500 font-semibold mt-2">Davao Central College</p>
            </div>
            <div className="text-center group cursor-pointer">
              <img
                src="/images/Squared_Logo.png"
                alt="Squared QR System"
                className="h-20 md:h-24 w-auto mx-auto transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-lg"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
              />
              <p className="text-xs text-gray-500 font-semibold mt-2">Squared QR System</p>
            </div>
          </div>

          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Revolutionizing Davao Central College Main Campus Experiences — powered by QR technology.
          </p>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border-l-4 border-[#69B41E] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#69B41E]/[0.03] to-[#8DC71E]/[0.03] z-0" />
            <div className="relative z-10 space-y-4 text-gray-600 leading-relaxed">
              <p>
                <strong className="text-[#187C19]">Squared</strong> is a modern web-based system developed
                for DCC students to streamline attendance, event participation, and transactions using QR
                code technology.
              </p>
              <p>
                Originally launched through Google Forms, Squared has now evolved into a complete web
                application. Students can register on the platform, automatically generate their own QR
                codes, and use them for quick and efficient scanning during DCC activities.
              </p>
              <p>
                Whether it&apos;s attending an event, verifying identity, or checking in for official
                activities, Squared simplifies the process for both students and organizers — reducing
                queues, manual tracking, and paperwork.
              </p>
              <p className="mb-0">
                The goal of Squared is to enhance accessibility, boost efficiency, and improve the overall
                experience of every DCC event — all with a simple scan.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon
            return (
              <div
                key={feat.title}
                className="group bg-white rounded-xl p-6 md:p-8 text-center shadow-lg hover:shadow-xl border-t-4 border-transparent hover:border-[#69B41E] transition-all duration-300 hover:-translate-y-2"
              >
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${feat.gradient} flex items-center justify-center mx-auto mb-4 text-white text-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <h5 className="text-xl font-bold text-gray-800 mb-3">{feat.title}</h5>
                <p className="text-gray-500 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
