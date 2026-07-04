import LandingNavbar from "@/pages/landing/LandingNavbar"
import HeroSlider from "@/pages/landing/HeroSlider"
import AboutSection from "@/pages/landing/AboutSection"
import FoundersSection from "@/pages/landing/FoundersSection"
import ProgramsSection from "@/pages/landing/ProgramsSection"
import AvatarsSection from "@/pages/landing/AvatarsSection"
import BeyondAttendanceSection from "@/pages/landing/BeyondAttendanceSection"
import BlueprintSection from "@/pages/landing/BlueprintSection"
import StudentCountsSection from "@/pages/landing/StudentCountsSection"
import UpcomingEventsSection from "@/pages/landing/UpcomingEventsSection"
import LandingFooter from "@/pages/landing/LandingFooter"
import AnnouncementSection from "@/pages/landing/AnnouncementSection"
import BackToTop from "@/components/BackToTop"
import PwaInstallHandler from "@/components/PwaInstallHandler"
import DarkModeStyles from "@/components/DarkModeStyles"
import { useState, useEffect } from "react"
import { useDarkMode } from "@/hooks/useDarkMode"
import LandingModals from "@/pages/landing/LandingModals"

export default function Landing() {
  useDarkMode()

  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [showAccountExists, setShowAccountExists] = useState(false)
  const [showInstall, setShowInstall] = useState(false)
  const [messageType, setMessageType] = useState<"success" | "error" | "warning">("success")
  const [messageText, setMessageText] = useState("")
  const [accountEmail, setAccountEmail] = useState("")

  // URL parameter modal handling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const modal = params.get("modal")
    const msg = params.get("message")

    if (modal === "success" || modal === "danger" || modal === "warning") {
      setMessageType(modal === "danger" ? "error" : modal)
      setMessageText(decodeURIComponent(msg || "Operation successful."))
      setShowMessage(true)
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    if (params.has("account_exists")) {
      const email = params.get("email")
      if (email) setAccountEmail(email)
      setShowAccountExists(true)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  return (
    <div className="min-h-screen bg-white font-['Nunito',system-ui,sans-serif]">
      <LandingNavbar />

      {/* Offset for fixed navbar */}
      <div className="pt-16">
        <HeroSlider />
        <StudentCountsSection />
        <AboutSection />
        <BeyondAttendanceSection />
        <BlueprintSection />
        <ProgramsSection />
        <FoundersSection />
        <AvatarsSection />

        {/* Squared overview image */}
        <img
          src="/images/Squared.png"
          alt="Squared QR Attendance System Overview"
          className="w-full h-auto mt-4"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
        />

        <AnnouncementSection />
        <UpcomingEventsSection />
      </div>

      <LandingFooter />
      <BackToTop />

      {/* Modals */}
      <LandingModals
        showLogin={showLogin}
        showRegister={showRegister}
        showMessage={showMessage}
        showAccountExists={showAccountExists}
        showInstall={showInstall}
        messageType={messageType}
        messageText={messageText}
        accountEmail={accountEmail}
        onCloseLogin={() => setShowLogin(false)}
        onCloseRegister={() => setShowRegister(false)}
        onCloseMessage={() => setShowMessage(false)}
        onCloseAccountExists={() => setShowAccountExists(false)}
        onCloseInstall={() => setShowInstall(false)}
        onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true) }}
        onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true) }}
      />

      {/* PWA Install Prompt */}
      <PwaInstallHandler onShowInstall={() => setShowInstall(true)} />

      {/* Dark Mode Styles — injected via ref to avoid TSX parser conflicts with CSS curly braces */}
      <DarkModeStyles />
      </div>
  )
}
