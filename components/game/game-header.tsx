import { Badge } from "@/components/ui/badge"

interface GameHeaderProps {
  room: any
  currentRound: any
}

export function GameHeader({ room, currentRound }: GameHeaderProps) {
  return (
    <div className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/images/gamelogo.png" alt="Battle of Codes" className="h-10" />
            <div>
              <h1 className="text-lg font-bold">Room {room.room_code}</h1>
              <p className="text-sm text-muted-foreground">
                Round {currentRound.round_number} of {room.total_rounds}
              </p>
            </div>
          </div>
          <Badge variant="default" className="text-base px-4 py-2">
            In Progress
          </Badge>
        </div>
      </div>
    </div>
  )
}
