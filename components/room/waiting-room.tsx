"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { User, Copy, Check, Crown, Users, Send, Clock, ArrowLeft, Play } from "lucide-react"
import { useRoomSocket } from "@/lib/socket"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface WaitingRoomProps {
  room: any
  participants: any[]
  currentUser: any
}

const WAITING_ROOM_TIMER = 120 // 2 minutes countdown

export function WaitingRoom({ room, participants: initialParticipants, currentUser }: WaitingRoomProps) {
  const router = useRouter()
  const [participants, setParticipants] = useState(initialParticipants)
  const [isReady, setIsReady] = useState(
    initialParticipants.find((p) => p.user_id === currentUser.id)?.is_ready || false,
  )
  const [copied, setCopied] = useState(false)
  const [chatMessage, setChatMessage] = useState("")
  const [countdown, setCountdown] = useState<number | null>(null)
  const [showHostLeftDialog, setShowHostLeftDialog] = useState(false)
  const [isStarting, setIsStarting] = useState(false)

  const { connected, messages, sendMessage, updateReadyStatus } = useRoomSocket(
    room.room_code,
    currentUser.id,
    currentUser.fullname,
  )

  const isCreator = room.creator_id === currentUser.id
  const readyCount = participants.filter((p) => p.is_ready).length
  const minimumPlayersReady = participants.length >= 2

  // Poll for participants updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/rooms/${room.room_code}/participants`)
        if (response.ok) {
          const data = await response.json()
          setParticipants(data.participants)

          // Check if game started
          if (data.room.status === "in_progress") {
            router.push(`/game/${room.room_code}`)
            return
          }

          // Check if room was closed (host left)
          if (data.room.status === "completed" || data.room.status === "abandoned") {
            if (!isCreator) {
              setShowHostLeftDialog(true)
            }
          }

          // Check if host is still in the room
          const hostStillHere = data.participants.some((p: any) => p.user_id === room.creator_id)
          if (!hostStillHere && !isCreator) {
            setShowHostLeftDialog(true)
          }
        }
      } catch (error) {
        console.error("[v0] Failed to fetch participants:", error)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [room.room_code, room.creator_id, router, isCreator])

  // Countdown is no longer needed since host has manual control
  useEffect(() => {
    setCountdown(null)
  }, [])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.room_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleToggleReady = async () => {
    try {
      const response = await fetch(`/api/rooms/${room.room_code}/ready`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_ready: !isReady }),
      })

      if (response.ok) {
        setIsReady(!isReady)
        updateReadyStatus(!isReady)
      }
    } catch (error) {
      console.error("[v0] Toggle ready error:", error)
    }
  }

  const handleStartGame = async () => {
    if (isStarting) return
    setIsStarting(true)

    try {
      const response = await fetch(`/api/rooms/${room.room_code}/start`, {
        method: "POST",
      })

      if (response.ok) {
        router.push(`/game/${room.room_code}`)
      } else {
        const data = await response.json()
        console.error("[v0] Start game error:", data.error)
        setIsStarting(false)
      }
    } catch (error) {
      console.error("[v0] Start game error:", error)
      setIsStarting(false)
    }
  }

  const handleLeaveRoom = async () => {
    try {
      await fetch(`/api/rooms/${room.room_code}/leave`, {
        method: "POST",
      })
    } catch (error) {
      console.error("[v0] Leave room error:", error)
    }
    router.push("/dashboard")
  }

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      sendMessage(chatMessage)
      setChatMessage("")
    }
  }

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Host Left Dialog */}
      <AlertDialog open={showHostLeftDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Host Left the Room</AlertDialogTitle>
            <AlertDialogDescription>
              The host has left the waiting room. The game session has ended. You will be redirected to the lobby.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => router.push("/dashboard")}>Return to Lobby</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleLeaveRoom}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <img src="/images/gamelogo.png" alt="Battle of Codes" className="h-10" />
              <div>
                <h1 className="text-xl font-bold">Waiting Room</h1>
                <p className="text-sm text-muted-foreground">Room: {room.room_code}</p>
              </div>
            </div>

            {/* Countdown Timer */}
            {countdown !== null && countdown > 0 && (
              <div className="flex items-center gap-2 bg-primary/20 border border-primary/30 px-4 py-2 rounded-lg animate-pulse-glow">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-xl font-bold text-primary font-mono">{formatCountdown(countdown)}</span>
              </div>
            )}

            <Badge variant={connected ? "default" : "secondary"} className={connected ? "bg-green-600" : ""}>
              {connected ? "Connected" : "Connecting..."}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Room Info Card */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Room Code */}
                <div className="flex items-center gap-4 bg-secondary/50 px-6 py-4 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Room Code</p>
                    <p className="text-3xl font-bold font-mono tracking-widest text-primary">{room.room_code}</p>
                  </div>
                  <Button onClick={handleCopyCode} variant="outline" size="icon">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Room Stats */}
                <div className="flex items-center gap-6">
                  <div className="text-center px-4">
                    <p className="text-xs text-muted-foreground uppercase">Difficulty</p>
                    <p className="font-bold capitalize text-lg">{room.difficulty}</p>
                  </div>
                  <div className="text-center px-4 border-x border-border">
                    <p className="text-xs text-muted-foreground uppercase">Rounds</p>
                    <p className="font-bold text-lg">{room.total_rounds}</p>
                  </div>
                  <div className="text-center px-4">
                    <p className="text-xs text-muted-foreground uppercase">Players</p>
                    <p className="font-bold text-lg">
                      {participants.length} / {room.max_players}
                    </p>
                  </div>
                </div>

                {/* Ready Status */}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Ready Status</p>
                  <Badge
                    variant={minimumPlayersReady ? "default" : "secondary"}
                    className={minimumPlayersReady ? "bg-green-600" : ""}
                  >
                    {readyCount}/{participants.length} Ready
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Participants List */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Players ({participants.length}/{room.max_players})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      participant.is_ready ? "bg-green-500/10 border-green-500/30" : "bg-secondary/50 border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          participant.user_id === room.creator_id ? "bg-yellow-500/20" : "bg-primary/20"
                        }`}
                      >
                        {participant.user_id === room.creator_id ? (
                          <Crown className="w-6 h-6 text-yellow-500" />
                        ) : (
                          <User className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{participant.fullname}</p>
                          {participant.user_id === room.creator_id && (
                            <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500/30">
                              HOST
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Level {participant.level} • {participant.points} pts
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={participant.is_ready ? "default" : "secondary"}
                      className={participant.is_ready ? "bg-green-600 text-white" : ""}
                    >
                      {participant.is_ready ? "Ready" : "Not Ready"}
                    </Badge>
                  </div>
                ))}

                {participants.length < 2 && (
                  <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Waiting for more players...</p>
                    <p className="text-sm mt-1">Share the room code to invite players!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chat Section */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Chat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-[300px] overflow-y-auto space-y-2 bg-secondary/30 p-3 rounded-lg">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No messages yet...</p>
                  ) : (
                    messages.map((msg, i) => (
                      <div key={i} className="bg-background/50 p-3 rounded text-sm">
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
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1 h-12 bg-transparent" onClick={handleLeaveRoom}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Leave Room
            </Button>

            {!isCreator && (
              <Button
                className={`flex-1 h-12 ${isReady ? "bg-yellow-600 hover:bg-yellow-700" : ""}`}
                onClick={handleToggleReady}
              >
                {isReady ? "Cancel Ready" : "Ready"}
              </Button>
            )}

            {isCreator && (
              <Button className="flex-1 h-12" onClick={handleStartGame} disabled={!minimumPlayersReady || isStarting}>
                <Play className="w-4 h-4 mr-2" />
                {isStarting ? "Starting..." : minimumPlayersReady ? "Start Game NOW" : "Need 2+ Players"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
