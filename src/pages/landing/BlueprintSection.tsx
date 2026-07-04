import { QrCode, ClipboardCheck, Palette, Camera, TrendingUp, Bot, GraduationCap, Users, Heart, Leaf, DollarSign, Globe } from "lucide-react"

const pillars = [
  {
    id: 1,
    number: "01",
    icon: QrCode,
    color: "#3E9DD4",
    title: "Digital Governance & Smart Systems",
    desc: "Establish efficient, paperless, technology-driven systems for student org operations.",
  },
  {
    id: 2,
    number: "02",
    icon: ClipboardCheck,
    color: "#87A52B",
    title: "Quality Assurance, Evaluation & Reporting",
    desc: "Ensure consistent high standards and accountability in student events and activities.",
  },
  {
    id: 3,
    number: "03",
    icon: Palette,
    color: "#C4401C",
    title: "Communications, Branding & Publications",
    desc: "Establish professional and consistent branding for all Squared communications.",
  },
  {
    id: 4,
    number: "04",
    icon: Camera,
    color: "#C0395A",
    title: "Creative Media & Cultural Production",
    desc: "Amplify student voices and promote campus creativity through multimedia.",
  },
  {
    id: 5,
    number: "05",
    icon: TrendingUp,
    color: "#2AAD7A",
    title: "Research, Development & Innovation",
    desc: "Apply research to guide continuous improvement and innovation.",
  },
  {
    id: 6,
    number: "06",
    icon: Bot,
    color: "#5B46AE",
    title: "Artificial Intelligence Integration",
    desc: "Integrate AI responsibly to enhance organizational efficiency and learning.",
  },
  {
    id: 7,
    number: "07",
    icon: GraduationCap,
    color: "#B09020",
    title: "Student Development & Capacity Building",
    desc: "Develop competent, ethical, and future-ready student leaders.",
  },
  {
    id: 8,
    number: "08",
    icon: Users,
    color: "#2AABAB",
    title: "Partnerships & Collaboration",
    desc: "Strengthen collaborations with student organizations and institutional offices.",
  },
  {
    id: 9,
    number: "09",
    icon: Heart,
    color: "#C83020",
    title: "Community Extension & Social Impact",
    desc: "Expand Squared’s impact to communities outside the campus.",
  },
  {
    id: 10,
    number: "10",
    icon: Leaf,
    color: "#3B9E40",
    title: "Sustainability & Green Operations",
    desc: "Promote environmentally responsible and sustainable organizational practices.",
  },
  {
    id: 11,
    number: "11",
    icon: DollarSign,
    color: "#F0931E",
    title: "Financial Sustainability & Resource Mobilization",
    desc: "Ensure Squared’s financial independence and continuity.",
  },
  {
    id: 12,
    number: "12",
    icon: Globe,
    color: "#7B3FAE",
    title: "Platform Development & Accessibility",
    desc: "Ensure inclusive, accessible, and user-friendly digital platforms.",
  },
]

const stripColors = [
  "#3E9DD4", "#87A52B", "#C4401C", "#C0395A", "#2AAD7A", "#5B46AE",
  "#B09020", "#2AABAB", "#C83020", "#3B9E40", "#F0931E", "#7B3FAE",
]

export default function BlueprintSection() {
  const IconGlobe = Globe

  return (
    <section
      id="blueprint"
      className="relative py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden"
    >
      {/* Grid background pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(30,60,120,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(30,60,120,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="mb-4">
            <img
              src="/images/Squared_Blueprint_Logo.png"
              alt="Squared Blueprint Logo"
              className="w-24 h-24 mx-auto object-contain drop-shadow-lg animate-logoFloat"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none"
              }}
            />
          </div>

          <span className="inline-block bg-[#1a1d28] text-white text-xs font-bold tracking-widest px-4 py-2 rounded-full uppercase mb-3">
            Strategic Plan 2026–2030
          </span>

          <h2 className="text-3xl md:text-5xl font-extrabold text-[#1a1d28] mb-2">
            Squared <span className="bg-gradient-to-r from-[#3F51B5] to-[#1a3a5c] bg-clip-text text-transparent">Blueprint</span> 2030
          </h2>

          <p className="text-gray-500 text-base font-semibold uppercase tracking-wider mb-2">
            12 Pillars. One Vision. Sustainable Impact.
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            A five-year roadmap transforming Squared into a leading, digitally empowered, and sustainable
            student organization — built on innovation, research, creative production, and digital systems.
          </p>
        </div>

        {/* Color Strip */}
        <div className="flex h-2 rounded-full overflow-hidden max-w-2xl mx-auto mb-6">
          {stripColors.map((color, i) => (
            <div
              key={i}
              className="flex-1 animate-stripReveal opacity-0"
              style={{
                background: color,
                animationDelay: `${0.5 + i * 0.05}s`,
                transformOrigin: "left",
              }}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 md:gap-12 mb-8">
          {[
            { number: "12", label: "Pillars" },
            { number: "5", label: "Years" },
            { number: "2030", label: "Vision" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-[#1a1d28]">{stat.number}</div>
              <div className="text-xs md:text-sm text-gray-500 font-semibold uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* 12 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-[1200px] mx-auto">
          {pillars.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div
                key={pillar.id}
                className="group bg-white rounded-2xl p-6 relative overflow-hidden shadow-md hover:shadow-xl border border-black/5 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer"
              >
                {/* Color top bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-[5px] transition-transform duration-300 group-hover:scale-x-[1.05]"
                  style={{ background: pillar.color }}
                />
                {/* Number badge */}
                <div className="absolute top-3 right-3 font-bold text-xs md:text-sm text-gray-800 bg-black/5 px-2.5 py-1 rounded tracking-wider">
                  {pillar.number}
                </div>
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mb-3 text-gray-500 transition-all duration-300 group-hover:bg-[#1a1d28] group-hover:text-white group-hover:scale-110 group-hover:-rotate-6">
                  <Icon className="w-5 h-5" />
                </div>
                {/* Title */}
                <h5 className="text-sm md:text-base font-bold text-[#1a1d28] mb-2 leading-tight">
                  {pillar.title}
                </h5>
                {/* Description */}
                <p className="text-xs md:text-sm text-gray-500 leading-relaxed">{pillar.desc}</p>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-8 bg-[#1a1d28] rounded-2xl p-8 md:p-10 text-center relative overflow-hidden">
          {/* Animated glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-ctaGlow opacity-[0.08]"
              style={{
                background:
                  "radial-gradient(circle, rgba(63,81,181,1) 0%, transparent 70%)",
              }}
            />
          </div>
          <div className="relative z-10">
            <p className="text-lg md:text-2xl font-semibold text-white max-w-3xl mx-auto leading-relaxed mb-3">
              &ldquo;Squared is a structured, future-ready organization built on interconnected pillars,
              guided by a clear blueprint, and designed for{" "}
              <em className="text-[#26BDE2] not-italic">sustainable and inclusive impact.</em>&rdquo;
            </p>
            <p className="text-white/60 text-xs md:text-sm tracking-widest uppercase">
              Squared Blueprint 2030 · 12 Pillars · One Vision
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.02); }
        }
        @keyframes stripReveal {
          to { opacity: 1; }
        }
        @keyframes ctaGlow {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(180deg); }
        }
        .animate-logoFloat { animation: logoFloat 6s ease-in-out infinite; }
        .animate-stripReveal { animation: stripReveal 0.8s ease forwards; }
        .animate-ctaGlow { animation: ctaGlow 8s ease-in-out infinite; }
      `}</style>
    </section>
  )
}
