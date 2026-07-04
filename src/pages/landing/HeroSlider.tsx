import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import LiveClock from "@/components/LiveClock"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"

const SLIDES = [
  {
    image: "/images/Cover.jpg",
    title: "Transforming Queues, Elevating Transactions",
    subtitle: "Experience the future of attendance management with our innovative QR scanning technology.",
  },
  {
    image: "/images/Cover1.jpg",
    title: "Fast, Secure & Reliable",
    subtitle: "Track and manage attendance with ease using Squared's advanced QR scanning system. No more paperwork, no more hassle.",
  },
  {
    image: "/images/Cover2.jpg",
    title: "Empowering Student Engagement",
    subtitle: "Connect, participate, and engage with campus activities like never before.",
  },
]

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % SLIDES.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <section className="relative w-full overflow-hidden min-h-[600px] md:min-h-[700px] flex items-center">
      {/* Background Slider */}
      <div className="absolute inset-0">
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt=""
              className="w-full h-full object-cover scale-105"
              style={{
                animation: i === current ? "slideZoom 8s ease-in-out infinite" : "none",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none"
              }}
            />
          </div>
        ))}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-[#187C19]/60 z-[2]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-20 md:py-32">
        <div className="text-center max-w-3xl mx-auto">
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              className={`transition-all duration-700 ${
                i === current
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4 absolute inset-0 pointer-events-none"
              }`}
            >
              {i === current && (
                <>
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Smart Attendance System
                  </div>
                  <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6 drop-shadow-lg">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-md">
                    {slide.subtitle}
                  </p>
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    <Button
                      size="xl"
                      asChild
                      className="bg-gradient-to-r from-[#69B41E] to-[#4CAF50] hover:from-[#4CAF50] hover:to-[#69B41E] text-white font-bold rounded-full px-8 py-6 text-lg shadow-lg shadow-green-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                      <Link to="/register">
                        Get Started <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>
                    </Button>
                    <Button
                      size="xl"
                      variant="outline"
                      asChild
                      className="border-2 border-white text-white hover:bg-white hover:text-[#187C19] rounded-full px-8 py-6 text-lg font-semibold transition-all"
                    >
                      <Link to="/login">Sign In</Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Arrow Controls */}
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center text-white transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center text-white transition-all"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* Dot Navigation */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i === current
                  ? "bg-[#69B41E] scale-125 border-2 border-white"
                  : "bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Live Clock Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-[3] bg-gradient-to-r from-[#69B41E]/90 to-[#187C19]/90 backdrop-blur-sm border-t border-white/20 py-2">
        <LiveClock />
      </div>

      <style>{`
        @keyframes slideZoom {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </section>
  )
}
