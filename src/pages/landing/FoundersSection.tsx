import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Globe, ExternalLink, Mail, ArrowRight } from "lucide-react"

const founders = [
  {
    name: "Roberto P. Tacbobo Jr.",
    role: "Founder",
    title: "Visionary Leader",
    image: "/images/founders/roberto.png",
    desc: "The innovative mind behind Squared QR, dedicated to transforming traditional campus processes into seamless digital experiences through cutting-edge technology solutions.",
    links: [
      { icon: Globe, href: "https://www.instagram.com/tacky_ed", label: "Instagram" },
      { icon: Globe, href: "https://www.facebook.com/robertopelaeztacbobo", label: "Facebook" },
      { icon: Mail, href: "mailto:robertojrpelaeztacbobo.dcc@gmail.com", label: "Email" },
    ],
  },
  {
    name: "Charles S. Evangelio Jr.",
    role: "Co-Founder",
    title: "Technical Lead & Developer",
    image: "/images/founders/charles.png",
    desc: "Full-stack developer who architectured and built the Squared QR system from ground up, ensuring robust performance and exceptional user experience across all platforms.",
    links: [
      { icon: Globe, href: "https://www.facebook.com/chazy.mushie", label: "Facebook" },
      { icon: Globe, href: "https://github.com/charlesevangeliojr", label: "GitHub" },
      { icon: Mail, href: "mailto:charles123evangelio@gmail.com", label: "Email" },
    ],
  },
  {
    name: "Angel Pitch R. Geronggay",
    role: "Co-Founder",
    title: "Creative Strategist",
    image: "/images/founders/pitch.png",
    desc: "Creative director and strategic partner focused on user experience design and ensuring the platform meets the diverse needs of the DCC student community.",
    links: [
      { icon: Globe, href: "https://www.instagram.com/sme_paesthetichy/", label: "Instagram" },
      { icon: Globe, href: "https://www.facebook.com/paesthetichy", label: "Facebook" },
      { icon: Mail, href: "mailto:geronggayangelpitch@gmail.com", label: "Email" },
    ],
  },
]

export default function FoundersSection() {
  return (
    <section
      id="founders"
      className="relative py-16 md:py-20 bg-gradient-to-br from-[#f8fdf0] to-[#e8f5e9] overflow-hidden"
    >
      {/* Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#69B41E] via-[#187C19] to-[#0D5B11]" />

      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#187C19] to-[#69B41E] bg-clip-text text-transparent relative inline-block">
            Meet Our Visionary Team
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-[#69B41E] to-[#8DC71E] rounded-full" />
          </h2>
          <p className="text-gray-500 text-lg mt-4 max-w-2xl mx-auto">
            The passionate minds revolutionizing campus experiences at Davao Central College
          </p>
        </div>

        {/* Founder Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {founders.map((founder) => (
            <div
              key={founder.name}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-3 hover:shadow-xl hover:border-[#69B41E] border-2 border-transparent relative"
            >
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#69B41E] to-[#8DC71E] scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

              <div className="p-6 md:p-8 text-center">
                {/* Image */}
                <div className="relative mb-6">
                  <div className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-[#69B41E] shadow-lg mx-auto transition-all duration-300 group-hover:border-[#8DC71E] group-hover:shadow-xl group-hover:scale-105">
                    <img
                      src={founder.image}
                      alt={founder.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement
                        el.style.display = "none"
                        el.parentElement!.classList.add("bg-gradient-to-br", "from-[#69B41E]", "to-[#8DC71E]")
                      }}
                    />
                  </div>
                  {/* Role Badge */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#69B41E] to-[#187C19] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                    {founder.role}
                  </div>
                </div>

                <h5 className="text-lg font-bold text-gray-900 mb-1">{founder.name}</h5>
                <p className="text-sm text-gray-500 mb-3">{founder.title}</p>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{founder.desc}</p>

                {/* Social Links */}
                <div className="flex items-center justify-center gap-2">
                  {founder.links.map((link) => {
                    const Icon = link.icon
                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-lg bg-[#69B41E] text-white flex items-center justify-center hover:bg-[#187C19] hover:-translate-y-1 transition-all duration-200 hover:shadow-lg"
                        title={link.label}
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg max-w-2xl mx-auto">
            <h4 className="text-xl font-bold text-[#187C19] mb-2">Join Our Mission</h4>
            <p className="text-gray-500 mb-4">Be part of the revolution in campus digital transformation</p>
            <Button asChild size="lg" className="bg-gradient-to-r from-[#187C19] to-[#69B41E] hover:from-[#136a14] hover:to-[#8DC71E] text-white font-bold rounded-full px-8 shadow-lg">
              <Link to="/register">
                Get Registered Now! <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
