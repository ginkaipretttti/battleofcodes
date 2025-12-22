"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, Crown, Search, RefreshCw, Gamepad2 } from "lucide-react"
import type { Room } from "@/lib/types"

export function PublicRoomsList() {
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [joining, setJoining] = useState<string | null>(null)
  const [error, setError] = useState("")

  const fetchRooms = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/rooms/public")
      if (response.ok) {
        const data = await response.json()
        setRooms(data.rooms)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch rooms:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
    // Poll for new rooms every 5 seconds
    const interval = setInterval(fetchRooms, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleJoinRoom = async (roomCode: string, status: string) => {
    if (status === "in_progress") {
      setError("This game has already started. You can only join rooms that are waiting.")
      setTimeout(() => setError(""), 3000)
      return
    }

    setJoining(roomCode)
    setError("")

    try {
      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_code: roomCode }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/room/${roomCode}`)
      } else {
        setError(data.error || "Failed to join room")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setJoining(null)
    }
  }

  const filteredRooms = rooms.filter(
    (room) =>
      room.room_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.creator_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.room_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      {/* Search and Refresh */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search for Room or Host..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-secondary border-border"
          />
        </div>
        <Button variant="outline" size="icon" onClick={fetchRooms} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Rooms Grid */}
      {loading && rooms.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Loading rooms...</div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-12">
          <Gamepad2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No public rooms available</p>
          <p className="text-sm text-muted-foreground mt-1">Create a room to start playing!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room) => (
            <Card
              key={room.id}
              className={`bg-secondary/50 border-border hover:border-primary/50 transition-colors cursor-pointer ${
                room.status === "in_progress" ? "opacity-75" : ""
              }`}
              onClick={() => handleJoinRoom(room.room_code, room.status)}
            >
              <CardContent className="p-4">
                {/* Room Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Gamepad2 className="w-6 h-6 text-primary" />
                  </div>
                  <Badge
                    variant={room.status === "waiting" ? "default" : "secondary"}
                    className={room.status === "waiting" ? "bg-green-600 text-white" : "bg-yellow-600 text-white"}
                  >
                    {room.status === "waiting" ? "Waiting" : "In Match"}
                  </Badge>
                </div>

                {/* Room Info */}
                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-foreground">
                    {room.room_name || `PUBLIC BATTLE #${room.room_code}`}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span>HOST: {room.creator_name}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>
                      PLAYERS: {room.participant_count}/{room.max_players}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {room.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {room.total_rounds} Rounds
                    </Badge>
                  </div>
                </div>

                {/* Join Button */}
                <Button
                  className="w-full mt-4"
                  variant={room.status === "waiting" ? "default" : "secondary"}
                  disabled={joining === room.room_code || room.status === "in_progress"}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleJoinRoom(room.room_code, room.status)
                  }}
                >
                  {joining === room.room_code
                    ? "Joining..."
                    : room.status === "in_progress"
                      ? "Game Started"
                      : "Join Room"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
