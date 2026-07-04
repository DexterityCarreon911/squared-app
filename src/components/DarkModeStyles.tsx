import { useEffect, useRef } from "react"

const CSS = `
.dark-mode {
  --dm-bg: #0a1f0c;
  --dm-bg-alt: #112d14;
  --dm-card: #112d14;
  --dm-card-hover: #1a3d1d;
  --dm-border: #1a4a1e;
  --dm-text: #e0f2e1;
  --dm-text-muted: #81c784;
  --dm-text-heading: #e0f2e1;
  --dm-accent: #2ecc40;
  --dm-accent-light: #4ae54a;
}
.dark-mode, .dark-mode body {
  background-color: var(--dm-bg) !important;
  color: var(--dm-text) !important;
}
.dark-mode section { background: transparent !important; }
.dark-mode .bg-white { background-color: var(--dm-card) !important; }
.dark-mode .text-gray-900,
.dark-mode .text-gray-800,
.dark-mode .text-gray-700,
.dark-mode h1, .dark-mode h2, .dark-mode h3, .dark-mode h4, .dark-mode h5, .dark-mode h6 {
  color: var(--dm-text-heading) !important;
}
.dark-mode .text-gray-500,
.dark-mode .text-gray-600,
.dark-mode .text-gray-400,
.dark-mode p {
  color: var(--dm-text) !important;
}
.dark-mode .text-gray-300 { color: var(--dm-text-muted) !important; }
.dark-mode .border-gray-100,
.dark-mode .border-gray-200,
.dark-mode .border-gray-300 {
  border-color: var(--dm-border) !important;
}
.dark-mode .bg-gray-50,
.dark-mode .from-gray-50,
.dark-mode .to-gray-100 {
  background-color: var(--dm-bg) !important;
}
.dark-mode .shadow-lg,
.dark-mode .shadow-md,
.dark-mode .shadow-xl,
.dark-mode .shadow-sm {
  box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
}
.dark-mode .bg-white\\/80 {
  background-color: rgba(17, 45, 20, 0.8) !important;
}
.dark-mode footer.bg-\\[\\#0D5B11\\] {
  background: linear-gradient(135deg, #1a1d28 0%, #2d3142 50%, #1a1d28 100%) !important;
}
.dark-mode footer .text-green-200,
.dark-mode footer .text-green-300 {
  color: var(--dm-text-muted) !important;
}
.dark-mode footer .border-green-700 { border-color: var(--dm-border) !important; }
.dark-mode footer .bg-green-700 { background: var(--dm-card) !important; }
.dark-mode .from-\\[\\#f8fdf0\\],
.dark-mode .to-\\[\\#e8f5e9\\] {
  background: linear-gradient(135deg, var(--dm-bg) 0%, var(--dm-bg-alt) 100%) !important;
}
.dark-mode #programs {
  background: linear-gradient(135deg, var(--dm-bg) 0%, var(--dm-bg-alt) 50%, var(--dm-bg) 100%) !important;
}
.dark-mode #blueprint {
  background: linear-gradient(135deg, var(--dm-bg) 0%, var(--dm-bg-alt) 100%) !important;
}
.dark-mode #blueprint .text-\\[\\#1a1d28\\] { color: var(--dm-text-heading) !important; }
.dark-mode #blueprint .bg-\\[\\#1a1d28\\] { background: var(--dm-card) !important; }
.dark-mode #blueprint .bg-white { background: var(--dm-card) !important; border-color: var(--dm-border) !important; }
.dark-mode #blueprint .text-gray-500 { color: var(--dm-text-muted) !important; }
.dark-mode .text-\\[\\#187C19\\] { color: var(--dm-accent-light) !important; }
.dark-mode .hover\\:border-\\[\\#69B41E\\]:hover { border-color: var(--dm-accent) !important; }
`

export default function DarkModeStyles() {
  const injected = useRef(false)

  useEffect(() => {
    if (injected.current) return
    injected.current = true
    const style = document.createElement("style")
    style.textContent = CSS
    document.head.appendChild(style)
    return () => {
      style.remove()
    }
  }, [])

  return null
}
