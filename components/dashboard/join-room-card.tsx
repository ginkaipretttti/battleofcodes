"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DoorOpen } from "lucide-react"

export function JoinRoomCard() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      setError("Please enter a room code")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_code: roomCode.toUpperCase() }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/room/${roomCode.toUpperCase()}`)
      } else {
        setError(data.error || "Failed to join room")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DoorOpen className="w-5 h-5" />
          Join Room
        </CardTitle>
        <CardDescription>Enter a room code to join an existing battle</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label>Room Code</Label>
          <Input
            placeholder="Enter 6-digit code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            maxLength={6}
            disabled={loading}
          />
        </div>

        <Button className="w-full" onClick={handleJoinRoom} disabled={loading || !roomCode.trim()}>
          {loading ? "Joining..." : "Join Room"}
        </Button>
      </CardContent>
    </Card>
  )
}
