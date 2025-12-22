"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LogOut, Crown } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface GameHeaderProps {
  room: any
  currentRound: any
  onLeave?: () => void
  isHost?: boolean
}

export function GameHeader({ room, currentRound, onLeave, isHost }: GameHeaderProps) {
  return (
    <div className="bg-card border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/images/gamelogo.png" alt="Battle of Codes" className="h-10" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-foreground">Room {room.room_code}</h1>
                {isHost && (
                  <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                    <Crown className="w-3 h-3 mr-1" />
                    Host
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Round {currentRound.round_number} of {room.total_rounds}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="default" className="text-base px-4 py-2 bg-green-600">
              In Progress
            </Badge>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <LogOut className="w-4 h-4" />
                  Leave
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Leave Game?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {isHost
                      ? "As the host, leaving will end the game for all players. Your points from this match will not be counted."
                      : "If you leave mid-game, your points from this match will not be counted towards your profile. Leaving 3 games will result in a 2-minute timeout."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Stay in Game</AlertDialogCancel>
                  <AlertDialogAction onClick={onLeave} className="bg-destructive text-destructive-foreground">
                    Leave Game
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  )
}
