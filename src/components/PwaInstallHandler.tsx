import { useEffect, useRef } from "react"

interface Props {
  onShowInstall: () => void
}

export default function PwaInstallHandler({ onShowInstall }: Props) {
  const promptRef = useRef<Event | null>(null)

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      promptRef.current = e
      // Show install modal after 30 seconds
      setTimeout(() => {
        if (promptRef.current) {
          onShowInstall()
        }
      }, 30000)
    }

    const handleAppInstalled = () => {
      promptRef.current = null
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [onShowInstall])

  return null
}
