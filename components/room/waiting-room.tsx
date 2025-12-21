"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { User, Copy, Check, Crown, Users, Send } from "lucide-react"
import { useRoomSocket } from "@/lib/socket"

interface WaitingRoomProps {
  room: any
  participants: any[]
  currentUser: any
}

export function WaitingRoom({ room, participants: initialParticipants, currentUser }: WaitingRoomProps) {
  const router = useRouter()
  const [participants, setParticipants] = useState(initialParticipants)
  const [isReady, setIsReady] = useState(false)
  const [copied, setCopied] = useState(false)
  const [chatMessage, setChatMessage] = useState("")

  const { connected, messages, sendMessage, updateReadyStatus } = useRoomSocket(
    room.room_code,
    currentUser.id,
    currentUser.fullname,
  )

  const isCreator = room.creator_id === currentUser.id
  const allReady = participants.length >= 2 && participants.every((p) => p.is_ready)

  // Poll for participants updates
  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch(`/api/rooms/${room.room_code}/participants`)
      if (response.ok) {
        const data = await response.json()
        setParticipants(data.participants)

        // Check if game started
        if (data.room.status === "in_progress") {
          router.push(`/game/${room.room_code}`)
        }
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [room.room_code, router])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.room_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleToggleReady = async () => {
    const response = await fetch(`/api/rooms/${room.room_code}/ready`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_ready: !isReady }),
    })

    if (response.ok) {
      setIsReady(!isReady)
      updateReadyStatus(!isReady)
    }
  }

  const handleStartGame = async () => {
    const response = await fetch(`/api/rooms/${room.room_code}/start`, {
      method: "POST",
    })

    if (response.ok) {
      router.push(`/game/${room.room_code}`)
    }
  }

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      sendMessage(chatMessage)
      setChatMessage("")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Connection Status */}
          {!connected && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 px-4 py-2 rounded-lg text-sm text-center">
              Connecting to real-time server...
            </div>
          )}

          {/* Room Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Waiting Room</CardTitle>
                <Badge variant="secondary">{room.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Room Code</p>
                  <p className="text-3xl font-bold font-mono tracking-wider">{room.room_code}</p>
                </div>
                <Button onClick={handleCopyCode} variant="outline">
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Difficulty</p>
                  <p className="font-semibold capitalize">{room.difficulty}</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Rounds</p>
                  <p className="font-semibold">{room.total_rounds}</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Players</p>
                  <p className="font-semibold">
                    {participants.length} / {room.max_players}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Players ({participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      participant.is_ready ? "bg-green-500/10 border-green-500/20" : "bg-muted/50 border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {participant.user_id === room.creator_id ? (
                          <Crown className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <User className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{participant.fullname}</p>
                        <p className="text-xs text-muted-foreground">
                          Level {participant.level} • {participant.points} pts
                        </p>
                      </div>
                    </div>
                    <Badge variant={participant.is_ready ? "default" : "secondary"}>
                      {participant.is_ready ? "Ready" : "Not Ready"}
                    </Badge>
                  </div>
                ))}

                {participants.length < 2 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Waiting for more players to join...</p>
                    <p className="text-sm mt-2">Share the room code with your opponent!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chat */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-64 overflow-y-auto space-y-2 bg-muted/30 p-3 rounded-lg">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No messages yet...</p>
                  ) : (
                    messages.map((msg, i) => (
                      <div key={i} className="bg-background p-2 rounded text-sm">
                        <span className="font-semibold text-primary">{msg.fullname}:</span> {msg.message}
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
                  />
                  <Button size="icon" onClick={handleSendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => router.push("/dashboard")}>
              Leave Room
            </Button>

            {!isCreator && participants.length >= 2 && (
              <Button className="flex-1" onClick={handleToggleReady}>
                {isReady ? "Not Ready" : "Ready"}
              </Button>
            )}

            {isCreator && (
              <Button className="flex-1" onClick={handleStartGame} disabled={!allReady}>
                {allReady ? "Start Game" : "Waiting for players..."}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
