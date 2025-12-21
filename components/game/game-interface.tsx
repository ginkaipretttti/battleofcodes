"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GameHeader } from "./game-header"
import { CodeEditor } from "./code-editor"
import { GamePlayers } from "./game-players"
import { GameTimer } from "./game-timer"
import { TestResults } from "./test-results"

interface GameInterfaceProps {
  room: any
  game: any
  participants: any[]
  currentUser: any
}

export function GameInterface({ room, game, participants, currentUser }: GameInterfaceProps) {
  const router = useRouter()
  const [currentRound, setCurrentRound] = useState<any>(null)
  const [challenge, setChallenge] = useState<any>(null)
  const [code, setCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [scores, setScores] = useState<any[]>([])
  const [gameEnded, setGameEnded] = useState(false)

  // Fetch current round and challenge
  useEffect(() => {
    fetchCurrentRound()
    const interval = setInterval(fetchCurrentRound, 3000)
    return () => clearInterval(interval)
  }, [game.id])

  const fetchCurrentRound = async () => {
    const response = await fetch(`/api/game/${game.id}/current-round`)
    if (response.ok) {
      const data = await response.json()

      if (data.gameEnded) {
        setGameEnded(true)
        setScores(data.finalScores)
        return
      }

      if (data.round) {
        setCurrentRound(data.round)
        setChallenge(data.challenge)
        if (!code && data.challenge) {
          setCode(data.challenge.initial_code)
        }
      }

      if (data.scores) {
        setScores(data.scores)
      }
    }
  }

  const handleSubmit = async () => {
    if (!currentRound || !challenge) return

    setIsSubmitting(true)
    setTestResults(null)

    try {
      const response = await fetch(`/api/game/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_round_id: currentRound.id,
          code,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setTestResults(data.results)
        fetchCurrentRound()
      }
    } catch (error) {
      console.error("[v0] Submit error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (gameEnded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold">Game Over!</h1>

            <div className="space-y-4">
              {scores.map((score: any, index: number) => (
                <div
                  key={score.user_id}
                  className={`p-6 rounded-lg border ${
                    index === 0 ? "bg-yellow-500/10 border-yellow-500/20" : "bg-muted/50 border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{index === 0 ? "🏆 Winner" : `#${index + 1}`}</p>
                      <p className="text-lg font-semibold">{score.fullname}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary">{score.total_points}</p>
                      <p className="text-sm text-muted-foreground">
                        {score.rounds_won} rounds won • {score.average_time}ms avg
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button size="lg" onClick={() => router.push("/dashboard")}>
              Return to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!currentRound || !challenge) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading challenge...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <GameHeader room={room} currentRound={currentRound} />

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Challenge Description */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">{challenge.title}</h2>
                  <Badge variant={challenge.difficulty === "easy" ? "secondary" : "default"}>
                    {challenge.difficulty}
                  </Badge>
                </div>
                <GameTimer timeLimit={challenge.time_limit} roundStartedAt={currentRound.started_at} />
              </div>
              <p className="text-muted-foreground whitespace-pre-wrap">{challenge.description}</p>

              {/* Test Cases */}
              <div className="mt-4 space-y-2">
                <h3 className="font-semibold text-sm">Example Test Cases:</h3>
                <div className="bg-muted/50 p-3 rounded-lg font-mono text-sm space-y-1">
                  {challenge.test_cases.slice(0, 2).map((tc: any, i: number) => (
                    <div key={i}>
                      Input: {tc.input} → Expected: {tc.expectedOutput}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Code Editor */}
            <CodeEditor code={code} onChange={setCode} onSubmit={handleSubmit} isSubmitting={isSubmitting} />

            {/* Test Results */}
            {testResults && <TestResults results={testResults} />}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <GamePlayers participants={participants} scores={scores} currentUserId={currentUser.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
