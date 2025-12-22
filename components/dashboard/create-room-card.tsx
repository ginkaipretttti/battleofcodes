"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

export function CreateRoomCard() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [difficulty, setDifficulty] = useState("medium")
  const [totalRounds, setTotalRounds] = useState("3")
  const [isPrivate, setIsPrivate] = useState(false)
  const [maxPlayers, setMaxPlayers] = useState("4")
  const [roomName, setRoomName] = useState("")
  const [error, setError] = useState("")

  const handleCreateRoom = async () => {
    setError("")

    if (!isPrivate && !roomName.trim()) {
      setError("Room name is required for public rooms")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          difficulty,
          total_rounds: Number.parseInt(totalRounds),
          is_private: isPrivate,
          max_players: Number.parseInt(maxPlayers),
          room_name: isPrivate ? null : roomName.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/room/${data.room.room_code}`)
      } else {
        setError(data.error || "Failed to create room")
      }
    } catch (error) {
      console.error("[v0] Create room error:", error)
      setError("An error occurred while creating the room")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Room
        </CardTitle>
        <CardDescription>Start a new coding battle and invite others</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Room Type</Label>
          <Select value={isPrivate ? "private" : "public"} onValueChange={(val) => setIsPrivate(val === "private")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public (by room name)</SelectItem>
              <SelectItem value="private">Private (by room code)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!isPrivate && (
          <div className="space-y-2">
            <Label>Room Name *</Label>
            <Input
              placeholder="e.g., Morning Coding Challenge"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              disabled={loading}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Difficulty</Label>
          <Select value={difficulty} onValueChange={setDifficulty} disabled={loading}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Number of Rounds</Label>
          <Select value={totalRounds} onValueChange={setTotalRounds} disabled={loading}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Round</SelectItem>
              <SelectItem value="3">3 Rounds</SelectItem>
              <SelectItem value="5">5 Rounds</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Max Players</Label>
          <Select value={maxPlayers} onValueChange={setMaxPlayers} disabled={loading}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 Players</SelectItem>
              <SelectItem value="4">4 Players</SelectItem>
              <SelectItem value="6">6 Players</SelectItem>
              <SelectItem value="8">8 Players</SelectItem>
              <SelectItem value="10">10 Players</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</div>}

        <Button className="w-full" onClick={handleCreateRoom} disabled={loading}>
          {loading ? "Creating..." : "Create Room"}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Public:</strong> Room is listed by name, anyone can search and join
          </p>
          <p>
            <strong>Private:</strong> Room is invisible, only people with the room code can join
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
