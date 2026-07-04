import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 500)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`fixed bottom-6 md:bottom-8 right-6 md:right-8 z-[999] w-12 h-12 rounded-full bg-gradient-to-r from-[#2AAD7A] to-[#3B9E40] text-white flex items-center justify-center shadow-lg shadow-green-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        visible ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  )
}
