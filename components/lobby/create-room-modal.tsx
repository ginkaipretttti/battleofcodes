"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Plus } from "lucide-react"

interface CreateRoomModalProps {
  trigger?: React.ReactNode
}

export function CreateRoomModal({ trigger }: CreateRoomModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Form state
  const [roomType, setRoomType] = useState<"public" | "private">("public")
  const [roomName, setRoomName] = useState("")
  const [maxPlayers, setMaxPlayers] = useState([4])
  const [difficulty, setDifficulty] = useState("medium")
  const [totalRounds, setTotalRounds] = useState("3")

  const handleCreateRoom = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_name: roomName || undefined,
          is_private: roomType === "private",
          max_players: maxPlayers[0],
          difficulty,
          total_rounds: Number.parseInt(totalRounds),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setOpen(false)
        router.push(`/room/${data.room.room_code}`)
      } else {
        setError(data.error || "Failed to create room")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full gap-2">
            <Plus className="w-4 h-4" />
            CREATE A ROOM
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">CREATE A GAME ROOM</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Room Type */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">ROOM TYPE</Label>
            <Select value={roomType} onValueChange={(v) => setRoomType(v as "public" | "private")}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Room Name */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">ROOM NAME</Label>
            <Input
              placeholder="Enter room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>

          {/* Max Players */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">MAX PLAYERS (2-10)</Label>
              <span className="text-lg font-bold text-primary">{maxPlayers[0]}</span>
            </div>
            <Slider value={maxPlayers} onValueChange={setMaxPlayers} min={2} max={10} step={1} className="w-full" />
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">DIFFICULTY</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rounds */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">NUMBER OF ROUNDS</Label>
            <Select value={totalRounds} onValueChange={setTotalRounds}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Round</SelectItem>
                <SelectItem value="3">3 Rounds</SelectItem>
                <SelectItem value="5">5 Rounds</SelectItem>
                <SelectItem value="10">10 Rounds</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Create Button */}
          <Button className="w-full mt-4" onClick={handleCreateRoom} disabled={loading}>
            {loading ? "Creating..." : "Create Game"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
