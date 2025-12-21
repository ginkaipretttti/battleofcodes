import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User } from "lucide-react"

interface GamePlayersProps {
  participants: any[]
  scores: any[]
  currentUserId: number
}

export function GamePlayers({ participants, scores, currentUserId }: GamePlayersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Players</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {participants.map((participant) => {
          const score = scores.find((s) => s.user_id === participant.user_id)
          const isCurrentUser = participant.user_id === currentUserId

          return (
            <div
              key={participant.id}
              className={`p-4 rounded-lg border ${
                isCurrentUser ? "bg-primary/10 border-primary/20" : "bg-muted/50 border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      {participant.fullname}
                      {isCurrentUser && <span className="text-xs text-muted-foreground ml-1">(You)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">Level {participant.level}</p>
                  </div>
                </div>
              </div>

              {score && (
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Points</p>
                    <p className="text-lg font-bold text-primary">{score.total_points}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Rounds Won</p>
                    <p className="text-lg font-bold">{score.rounds_won}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
