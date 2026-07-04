import { useState, useEffect, useCallback } from "react"
import { X, ChevronRight } from "lucide-react"

const avatars = [
  {
    id: "joy",
    name: "JOY",
    role: "The Optimist",
    image: "/avatars/JOY.png",
    desc: "Always cheerful and energetic, JOY brings positivity to every interaction. She represents the happy moments of campus life and spreads enthusiasm throughout the Squared community.",
    traits: ["Energetic", "Friendly", "Optimistic", "Positive"],
    color: "rose",
    accent: "from-pink-500 to-pink-400",
    headerBg: "from-[#E91E63] to-[#F06292]",
    tagBg: "bg-pink-50 text-pink-700 border-pink-200",
  },
  {
    id: "sevi",
    name: "SEVI",
    role: "The Analyst",
    image: "/avatars/SEVI.png",
    desc: "Logical and detail-oriented, SEVI ensures everything runs smoothly. He's the brains behind efficient operations and loves optimizing processes for better performance.",
    traits: ["Analytical", "Organized", "Precise", "Efficient"],
    color: "blue",
    accent: "from-blue-500 to-blue-400",
    headerBg: "from-[#2196F3] to-[#64B5F6]",
    tagBg: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "samantha",
    name: "SAMANTHA",
    role: "The Innovator",
    image: "/avatars/SAMANTHA.png",
    desc: "Creative and forward-thinking, SAMANTHA brings fresh ideas to the table. She represents innovation and progress, always looking for new ways to improve the student experience.",
    traits: ["Creative", "Visionary", "Modern", "Innovative"],
    color: "purple",
    accent: "from-purple-600 to-purple-400",
    headerBg: "from-[#9C27B0] to-[#BA68C8]",
    tagBg: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    id: "zeke",
    name: "ZEKE",
    role: "The Guardian",
    image: "/avatars/ZEKE.png",
    desc: "Strong and reliable, ZEKE represents security and trust. He ensures every transaction and interaction is protected, providing peace of mind for all users.",
    traits: ["Reliable", "Secure", "Strong", "Trustworthy"],
    color: "orange",
    accent: "from-orange-500 to-amber-400",
    headerBg: "from-[#FF9800] to-[#FFB74D]",
    tagBg: "bg-orange-50 text-orange-700 border-orange-200",
  },
]

export default function AvatarsSection() {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth <= 768)
  }, [])

  useEffect(() => {
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [checkMobile])

  const handleAvatarClick = (id: string) => {
    if (isMobile) {
      setSelectedAvatar(id)
    }
  }

  const current = avatars.find((a) => a.id === selectedAvatar)

  return (
    <section
      id="avatars"
      className="relative py-16 md:py-20 bg-gradient-to-br from-white to-[#f8fdf0] overflow-hidden"
    >
      {/* Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#69B41E] via-[#187C19] to-[#0D5B11]" />

      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#187C19] to-[#69B41E] bg-clip-text text-transparent relative inline-block">
            Squared Avatars
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#69B41E] to-[#8DC71E] rounded-full" />
          </h2>
          <p className="text-gray-500 text-lg mt-4 max-w-2xl mx-auto">
            Meet the unique personalities that represent the spirit of Squared QR System
          </p>
        </div>

        {/* Avatar Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              onClick={() => handleAvatarClick(avatar.id)}
              className={`group bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-transparent transition-all duration-300 hover:-translate-y-4 hover:scale-105 hover:border-[#69B41E] ${isMobile ? "cursor-pointer" : ""}`}
            >
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#69B41E] to-[#8DC71E] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 z-10" />

              <img
                src={avatar.image}
                alt={`${avatar.name} Avatar`}
                className="w-full h-56 md:h-60 object-cover object-top transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none"
                }}
              />

              <div className="p-4 md:p-5 text-center">
                <h3 className={`text-xl font-extrabold mb-1 ${
                  avatar.id === "joy" ? "text-pink-600" :
                  avatar.id === "sevi" ? "text-blue-600" :
                  avatar.id === "samantha" ? "text-purple-600" :
                  "text-orange-600"
                }`}>
                  {avatar.name}
                </h3>
                <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-2 ${
                  avatar.id === "joy" ? "bg-pink-50 text-pink-700" :
                  avatar.id === "sevi" ? "bg-blue-50 text-blue-700" :
                  avatar.id === "samantha" ? "bg-purple-50 text-purple-700" :
                  "bg-orange-50 text-orange-700"
                }`}>
                  {avatar.role}
                </span>

                {/* Desktop: show full content */}
                <p className="text-sm text-gray-500 leading-relaxed hidden md:block">
                  {avatar.desc}
                </p>

                {/* Traits - desktop visible */}
                <div className="hidden md:flex flex-wrap gap-1.5 justify-center mt-3">
                  {avatar.traits.slice(0, 3).map((trait) => (
                    <span
                      key={trait}
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        avatar.id === "joy" ? "bg-pink-50 text-pink-600 border border-pink-200" :
                        avatar.id === "sevi" ? "bg-blue-50 text-blue-600 border border-blue-200" :
                        avatar.id === "samantha" ? "bg-purple-50 text-purple-600 border border-purple-200" :
                        "bg-orange-50 text-orange-600 border border-orange-200"
                      }`}
                    >
                      {trait}
                    </span>
                  ))}
                </div>

                {/* Mobile: "Tap to view details" */}
                <p className="block md:hidden text-xs text-[#69B41E] font-semibold mt-2">
                  Tap to view details <ChevronRight className="w-3 h-3 inline" />
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Avatar Modal */}
      {current && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedAvatar(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${current.headerBg} px-6 py-4 text-white flex items-center justify-between`}>
              <h5 className="font-bold text-lg">{current.role}</h5>
              <button
                onClick={() => setSelectedAvatar(null)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div>
              <img
                src={current.image}
                alt={`${current.name} Avatar`}
                className="w-full h-56 object-cover object-top"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none"
                }}
              />
              <div className="p-6">
                <h3 className={`text-2xl font-extrabold mb-1 ${
                  current.id === "joy" ? "text-pink-600" :
                  current.id === "sevi" ? "text-blue-600" :
                  current.id === "samantha" ? "text-purple-600" :
                  "text-orange-600"
                }`}>
                  {current.name}
                </h3>
                <span className={`inline-block text-sm font-bold px-4 py-1.5 rounded-full mb-3 ${
                  current.id === "joy" ? "bg-pink-50 text-pink-700" :
                  current.id === "sevi" ? "bg-blue-50 text-blue-700" :
                  current.id === "samantha" ? "bg-purple-50 text-purple-700" :
                  "bg-orange-50 text-orange-700"
                }`}>
                  {current.role}
                </span>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{current.desc}</p>

                {/* Traits */}
                <div className="flex flex-wrap gap-2">
                  {current.traits.map((trait) => (
                    <span
                      key={trait}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                        current.id === "joy" ? "bg-pink-50 text-pink-600 border border-pink-200" :
                        current.id === "sevi" ? "bg-blue-50 text-blue-600 border border-blue-200" :
                        current.id === "samantha" ? "bg-purple-50 text-purple-600 border border-purple-200" :
                        "bg-orange-50 text-orange-600 border border-orange-200"
                      }`}
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
