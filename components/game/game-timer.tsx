"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface GameTimerProps {
  timeLimit: number
  roundStartedAt: string
}

export function GameTimer({ timeLimit, roundStartedAt }: GameTimerProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit)

  useEffect(() => {
    const startTime = new Date(roundStartedAt).getTime()

    const updateTimer = () => {
      const now = Date.now()
      const elapsed = Math.floor((now - startTime) / 1000)
      const remaining = Math.max(0, timeLimit - elapsed)
      setTimeLeft(remaining)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [timeLimit, roundStartedAt])

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
