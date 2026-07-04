import { useEffect, useState, useRef } from "react"

interface Props {
  value: number
  duration?: number
  className?: string
  formatter?: (n: number) => string
}

export default function AnimatedNumber({ value, duration = 800, className, formatter }: Props) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef<number | undefined>(undefined)
  const startTimeRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    setDisplay(0)
    startTimeRef.current = undefined
    const range = value - 0
    if (range === 0) {
      setDisplay(value)
      return
    }

    const step = (timestamp: number) => {
      if (startTimeRef.current === undefined) {
        startTimeRef.current = timestamp
      }
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const current = Math.round(progress * range)
      setDisplay(current)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        setDisplay(value)
      }
    }

    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
    }
  }, [value, duration])

  const formatted = formatter ? formatter(display) : display.toLocaleString()
  return <span className={className}>{formatted}</span>
}
