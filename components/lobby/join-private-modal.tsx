"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DoorOpen } from "lucide-react"

interface JoinPrivateModalProps {
  trigger?: React.ReactNode
}

export function JoinPrivateModal({ trigger }: JoinPrivateModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [roomCode, setRoomCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleJoinRoom = async () => {
    if (!roomCode.trim() || roomCode.length !== 6) {
      setError("Please enter a valid 6-digit room code")
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
        setOpen(false)
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full gap-2 bg-transparent">
            <DoorOpen className="w-4 h-4" />
            JOIN A PRIVATE ROOM
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">JOIN PRIVATE ROOM</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">ROOM CODE</Label>
            <Input
              placeholder="Enter 6-digit room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="bg-secondary border-border text-center text-2xl font-mono tracking-widest"
              disabled={loading}
            />
          </div>

          <Button className="w-full" onClick={handleJoinRoom} disabled={loading || roomCode.length !== 6}>
            {loading ? "Joining..." : "Join Room"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
