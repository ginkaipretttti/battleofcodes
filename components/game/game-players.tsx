"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface GameTimerProps {
  timeLimit: number
  roundStartedAt: string
  onTimeUp?: () => void
}

export function GameTimer({ timeLimit, roundStartedAt, onTimeUp }: GameTimerProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [hasNotifiedTimeUp, setHasNotifiedTimeUp] = useState(false)

  useEffect(() => {
    const startTime = new Date(roundStartedAt).getTime()

    const updateTimer = () => {
      const now = Date.now()
      const elapsed = Math.floor((now - startTime) / 1000)
      const remaining = Math.max(0, timeLimit - elapsed)
      setTimeLeft(remaining)

      if (remaining === 0 && !hasNotifiedTimeUp && onTimeUp) {
        setHasNotifiedTimeUp(true)
        onTimeUp()
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [timeLimit, roundStartedAt, onTimeUp, hasNotifiedTimeUp])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const isWarning = timeLeft < 60
  const isDanger = timeLeft < 30

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono ${
        isDanger
          ? "bg-destructive/20 text-destructive"
          : isWarning
            ? "bg-yellow-500/20 text-yellow-600"
            : "bg-muted text-foreground"
      }`}
    >
      <Clock className="w-4 h-4" />
      <span className="font-bold">
        {minutes}:{seconds.toString().padStart(2, "0")}
      </span>
    </div>
  )
}
