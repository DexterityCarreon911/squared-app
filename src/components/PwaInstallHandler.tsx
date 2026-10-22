import { useEffect, useRef } from "react"

interface Props {
  onShowInstall: (install: () => Promise<void>) => void
}

export default function PwaInstallHandler({ onShowInstall }: Props) {
  const promptRef = useRef<(Event & {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
  }) | null>(null)

  useEffect(() => {
    let installTimer = 0
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      promptRef.current = e as typeof promptRef.current
      installTimer = window.setTimeout(() => {
        if (promptRef.current) {
          onShowInstall(async () => {
            const promptEvent = promptRef.current
            if (!promptEvent) return
            await promptEvent.prompt()
            await promptEvent.userChoice
            promptRef.current = null
          })
        }
      }, 30000)
    }

    const handleAppInstalled = () => {
      promptRef.current = null
      window.clearTimeout(installTimer)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.clearTimeout(installTimer)
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [onShowInstall])

  return null
}
