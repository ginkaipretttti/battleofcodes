"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { GameHeader } from "./game-header"
import { CodeEditor } from "./code-editor"
import { GamePlayers } from "./game-players"
import { GameTimer } from "./game-timer"
import { TestResults } from "./test-results"
import { useGameSocket } from "@/lib/socket"
import { Send, MessageSquare, X, AlertCircle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  const [showHostLeftDialog, setShowHostLeftDialog] = useState(false)
  const [showChatPanel, setShowChatPanel] = useState(false)
  const [chatMessage, setChatMessage] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [leftMidGame, setLeftMidGame] = useState(false)
  const [showRoundEndDialog, setShowRoundEndDialog] = useState(false)
  const [showCorrectDialog, setShowCorrectDialog] = useState(false)
  const [roundEndDetails, setRoundEndDetails] = useState<any>(null)

  const isHost = room.creator_id === currentUser.id

  const { connected, notifySubmission } = useGameSocket(room.room_code, game.id, currentUser.id, currentUser.fullname)

  // Fetch current round and challenge
  const fetchCurrentRound = useCallback(async () => {
    try {
      const response = await fetch(`/api/game/${game.id}/current-round`)
      if (response.ok) {
        const data = await response.json()

        if (data.gameEnded) {
          setGameEnded(true)
          setScores(data.finalScores)
          return
        }

        if (data.hostLeft) {
          setShowHostLeftDialog(true)
          return
        }

        if (data.round) {
          // Only reset code if it's a new round
          if (!currentRound || currentRound.id !== data.round.id) {
            setCurrentRound(data.round)
            setChallenge(data.challenge)
            setCode(data.challenge?.initial_code || "")
            setTestResults(null)
          }
        }

        if (data.scores) {
          setScores(data.scores)
        }
      }
    } catch (error) {
      console.error("[v0] Fetch round error:", error)
    }
  }, [game.id, currentRound])

  useEffect(() => {
    fetchCurrentRound()
    const interval = setInterval(fetchCurrentRound, 3000)
    return () => clearInterval(interval)
  }, [fetchCurrentRound])

  const handleTimeUp = () => {
    setShowRoundEndDialog(true)
    setRoundEndDetails({
      title: "Time's Up!",
      description: "The round timer has ended. The results will be calculated and the next round will start soon.",
      isTimeUp: true,
    })
    // Wait 3 seconds then move to next round
    setTimeout(() => {
      setShowRoundEndDialog(false)
      fetchCurrentRound()
    }, 3000)
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
        notifySubmission(data.results.is_correct, data.results.points_earned)

        if (data.results.is_correct) {
          setShowCorrectDialog(true)
          setTimeout(() => {
            setShowCorrectDialog(false)
            // Give a small delay before fetching next round
            setTimeout(() => {
              fetchCurrentRound()
            }, 500)
          }, 2000)
        }
      } else {
        setTestResults({
          is_correct: false,
          test_results: [],
          points_earned: 0,
          execution_time: 0,
          error: data.error,
        })
      }
    } catch (error) {
      console.error("[v0] Submit error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLeaveGame = async () => {
    setLeftMidGame(true)

    try {
      await fetch(`/api/game/${game.id}/leave`, {
        method: "POST",
      })
    } catch (error) {
      console.error("[v0] Leave game error:", error)
    }

    router.push("/dashboard")
  }

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      setMessages((prev) => [...prev, { fullname: currentUser.fullname, message: chatMessage, timestamp: Date.now() }])
      setChatMessage("")
    }
  }

  if (gameEnded) {
    return <GameResults scores={scores} currentUserId={currentUser.id} roomCode={room.room_code} gameId={game.id} />
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
      {/* Host Left Dialog */}
      <AlertDialog open={showHostLeftDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Host Left the Game</AlertDialogTitle>
            <AlertDialogDescription>
              The host has left the game. The match has ended. You will be redirected to the lobby.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => router.push("/dashboard")}>Return to Lobby</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRoundEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              {roundEndDetails?.title}
            </AlertDialogTitle>
            <AlertDialogDescription>{roundEndDetails?.description}</AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showCorrectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-500">Correct! ✓</AlertDialogTitle>
            <AlertDialogDescription>
              Your solution passed all test cases! Proceeding to the next round...
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>

      <GameHeader room={room} currentRound={currentRound} onLeave={handleLeaveGame} isHost={isHost} />

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Challenge Description */}
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-foreground">{challenge.title}</h2>
                  <Badge
                    variant={challenge.difficulty === "easy" ? "secondary" : "default"}
                    className={
                      challenge.difficulty === "easy"
                        ? "bg-green-600/20 text-green-400"
                        : challenge.difficulty === "medium"
                          ? "bg-yellow-600/20 text-yellow-400"
                          : "bg-red-600/20 text-red-400"
                    }
                  >
                    {challenge.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-primary border-primary/30">
                    {challenge.points} pts
                  </Badge>
                </div>
                <GameTimer
                  timeLimit={challenge.time_limit}
                  roundStartedAt={currentRound.started_at}
                  onTimeUp={handleTimeUp}
                />
              </div>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{challenge.description}</p>

              {/* Test Cases */}
              <div className="mt-4 space-y-2">
                <h3 className="font-semibold text-sm text-foreground">Example Test Cases:</h3>
                <div className="bg-secondary/50 p-4 rounded-lg font-mono text-sm space-y-2 border border-border">
                  {challenge.test_cases.slice(0, 2).map((tc: any, i: number) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-muted-foreground">Input:</span>
                      <span className="text-primary">{tc.input}</span>
                      <span className="text-muted-foreground">→ Expected:</span>
                      <span className="text-green-400">{tc.expectedOutput}</span>
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
            {/* Live Leaderboard */}
            <GamePlayers
              participants={participants}
              scores={scores}
              currentUserId={currentUser.id}
              hostId={room.creator_id}
            />

            {/* In-Match Chat Toggle */}
            <Button
              variant="outline"
              className="w-full gap-2 bg-transparent"
              onClick={() => setShowChatPanel(!showChatPanel)}
            >
              <MessageSquare className="w-4 h-4" />
              {showChatPanel ? "Hide Chat" : "Show Chat"}
            </Button>

            {/* Chat Panel */}
            {showChatPanel && (
              <Card className="bg-card border-border">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold">Match Chat</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowChatPanel(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="p-4 space-y-4">
                  <div className="h-48 overflow-y-auto space-y-2 bg-secondary/30 p-3 rounded-lg">
                    {messages.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No messages yet...</p>
                    ) : (
                      messages.map((msg, i) => (
                        <div key={i} className="bg-background/50 p-2 rounded text-sm">
                          <span className="font-semibold text-primary">{msg.fullname}:</span>{" "}
                          <span className="text-foreground">{msg.message}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      className="bg-secondary border-border"
                    />
                    <Button size="icon" onClick={handleSendMessage}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Game Results Component with animations
function GameResults({
  scores,
  currentUserId,
  roomCode,
  gameId,
}: {
  scores: any[]
  currentUserId: number
  roomCode: string
  gameId: number
}) {
  const router = useRouter()
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  const getPlacementStyle = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-600/20 to-yellow-500/10 border-yellow-500/50"
      case 1:
        return "bg-gradient-to-r from-gray-400/20 to-gray-300/10 border-gray-400/50"
      case 2:
        return "bg-gradient-to-r from-orange-600/20 to-orange-500/10 border-orange-600/50"
      default:
        return "bg-secondary/50 border-border"
    }
  }

  const getPlacementLabel = (index: number) => {
    switch (index) {
      case 0:
        return { text: "1st Place", icon: "🏆", color: "text-yellow-500" }
      case 1:
        return { text: "2nd Place", icon: "🥈", color: "text-gray-400" }
      case 2:
        return { text: "3rd Place", icon: "🥉", color: "text-orange-600" }
      default:
        return { text: `${index + 1}th Place`, icon: "", color: "text-muted-foreground" }
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: ["#FFD700", "#C0C0C0", "#CD7F32", "#FF6B6B", "#4ECDC4"][Math.floor(Math.random() * 5)],
                borderRadius: Math.random() > 0.5 ? "50%" : "0",
              }}
            />
          ))}
        </div>
      )}

      <Card className="max-w-2xl w-full p-8 bg-card border-border relative z-10">
        <div className="text-center space-y-8">
          <div className="animate-slide-up">
            <h1 className="text-4xl font-bold text-foreground mb-2">Game Over!</h1>
            <p className="text-muted-foreground">Room: {roomCode}</p>
          </div>

          <div className="space-y-4">
            {scores.map((score: any, index: number) => {
              const placement = getPlacementLabel(index)
              const isCurrentUser = score.user_id === currentUserId

              return (
                <div
                  key={score.user_id}
                  className={`p-6 rounded-lg border transition-all animate-slide-up ${getPlacementStyle(index)} ${
                    isCurrentUser ? "ring-2 ring-primary" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{placement.icon || `#${index + 1}`}</span>
                      <div className="text-left">
                        <p className={`text-sm font-medium ${placement.color}`}>{placement.text}</p>
                        <p className="text-xl font-bold text-foreground">
                          {score.fullname}
                          {isCurrentUser && <span className="text-sm text-muted-foreground ml-2">(You)</span>}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary">{score.total_points}</p>
                      <p className="text-sm text-muted-foreground">
                        {score.rounds_won} rounds won • {score.average_time || 0}ms avg
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex gap-4 pt-4">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => router.push("/dashboard")}>
              Return to Lobby
            </Button>
            <Button className="flex-1" onClick={() => router.push(`/certificate/${gameId}`)}>
              View Certificate
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
