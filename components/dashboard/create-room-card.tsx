"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

export function CreateRoomCard() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [difficulty, setDifficulty] = useState("medium")
  const [totalRounds, setTotalRounds] = useState("3")

  const handleCreateRoom = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          difficulty,
          total_rounds: Number.parseInt(totalRounds),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/room/${data.room.room_code}`)
      }
    } catch (error) {
      console.error("[v0] Create room error:", error)
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
          <Label>Difficulty</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
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
          <Select value={totalRounds} onValueChange={setTotalRounds}>
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

        <Button className="w-full" onClick={handleCreateRoom} disabled={loading}>
          {loading ? "Creating..." : "Create Room"}
        </Button>
      </CardContent>
    </Card>
  )
}
