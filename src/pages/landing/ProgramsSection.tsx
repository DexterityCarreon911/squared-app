const programs = [
  {
    id: "cba",
    name: "College of Business Administration",
    short: "CBA",
    logo: "https://dcc.edu.ph/wp-content/uploads/2021/04/BA-WEB.png",
    gradient: "from-yellow-400 to-yellow-300",
    shadow: "shadow-yellow-500/30",
    border: "border-yellow-400",
    hoverGradient: "hover:from-yellow-300 hover:to-yellow-400",
  },
  {
    id: "cela",
    name: "College of Education and Liberal Arts",
    short: "CELA",
    logo: "https://dcc.edu.ph/wp-content/uploads/2021/04/CELA-WEB.png",
    gradient: "from-blue-500 to-blue-400",
    shadow: "shadow-blue-500/30",
    border: "border-blue-500",
    hoverGradient: "hover:from-blue-400 hover:to-blue-500",
  },
  {
    id: "cje",
    name: "Criminal Justice Education",
    short: "CJE",
    logo: "https://dcc.edu.ph/wp-content/uploads/2021/04/CJE-WEB.png",
    gradient: "from-gray-900 to-gray-700",
    shadow: "shadow-gray-900/30",
    border: "border-gray-900",
    hoverGradient: "hover:from-gray-700 hover:to-gray-900",
  },
  {
    id: "hme",
    name: "Hospitality Management Education",
    short: "HME",
    logo: "https://dcc.edu.ph/wp-content/uploads/2021/04/HM-LOGO-revised-2.0-768x765.png",
    gradient: "from-red-600 to-red-400",
    shadow: "shadow-red-600/30",
    border: "border-red-600",
    hoverGradient: "hover:from-red-400 hover:to-red-600",
  },
  {
    id: "ite",
    name: "Information Technology Education",
    short: "ITE",
    logo: "https://dcc.edu.ph/wp-content/uploads/2021/04/ITE-WEB.png",
    gradient: "from-purple-600 to-purple-400",
    shadow: "shadow-purple-600/30",
    border: "border-purple-600",
    hoverGradient: "hover:from-purple-400 hover:to-purple-600",
  },
]

export default function ProgramsSection() {
  return (
    <section
      id="programs"
      className="relative py-16 md:py-20 bg-gradient-to-br from-[#f8fdf0] via-white to-[#e8f5e9] overflow-hidden"
    >
      {/* Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#69B41E] via-[#187C19] to-[#0D5B11]" />

      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#187C19] to-[#69B41E] bg-clip-text text-transparent relative inline-block">
            Academic Programs
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#69B41E] to-[#8DC71E] rounded-full" />
          </h2>
          <p className="text-gray-500 text-lg mt-4 max-w-2xl mx-auto">
            Discover the diverse range of programs designed to shape future leaders and professionals
          </p>
        </div>

        {/* Program Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {programs.map((prog) => (
            <div
              key={prog.id}
              className={`group bg-white rounded-2xl p-6 md:p-8 text-center shadow-lg border-2 border-transparent transition-all duration-300 hover:-translate-y-3 hover:scale-105 hover:${prog.border} min-h-[250px] flex flex-col items-center justify-center`}
            >
              {/* Icon */}
              <div
                className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br ${prog.gradient} flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg ${prog.shadow} ${prog.hoverGradient}`}
              >
                <img
                  src={prog.logo}
                  alt={prog.name}
                  className="w-14 h-14 md:w-16 md:h-16 object-contain transition-all duration-300 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none"
                  }}
                />
              </div>

              <h3 className="text-sm md:text-base font-bold text-gray-800 mb-3 leading-tight">
                {prog.name}
              </h3>

              <span
                className={`inline-block text-sm font-bold px-4 py-2 rounded-full bg-[#f1f8e9] text-[#69B41E] border-2 border-[#e8f5e9] transition-all duration-300 group-hover:bg-[#69B41E] group-hover:text-white group-hover:border-[#69B41E]`}
              >
                {prog.short}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
