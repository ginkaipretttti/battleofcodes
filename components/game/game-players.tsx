import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Crown, Trophy } from "lucide-react"

interface GamePlayersProps {
  participants: any[]
  scores: any[]
  currentUserId: number
  hostId?: number
}

export function GamePlayers({ participants, scores, currentUserId, hostId }: GamePlayersProps) {
  // Sort participants by score
  const sortedParticipants = [...participants].sort((a, b) => {
    const scoreA = scores.find((s) => s.user_id === a.user_id)?.total_points || 0
    const scoreB = scores.find((s) => s.user_id === b.user_id)?.total_points || 0
    return scoreB - scoreA
  })

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="w-5 h-5 text-primary" />
          Live Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedParticipants.map((participant, index) => {
          const score = scores.find((s) => s.user_id === participant.user_id)
          const isCurrentUser = participant.user_id === currentUserId
          const isHost = participant.user_id === hostId

          return (
            <div
              key={participant.id}
              className={`p-4 rounded-lg border transition-colors ${
                isCurrentUser
                  ? "bg-primary/10 border-primary/30"
                  : index === 0
                    ? "bg-yellow-500/10 border-yellow-500/30"
                    : "bg-secondary/50 border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0
                        ? "bg-yellow-500 text-black"
                        : index === 1
                          ? "bg-gray-400 text-black"
                          : index === 2
                            ? "bg-orange-600 text-white"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>

                  {/* Player Info */}
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isHost ? "bg-yellow-500/20" : "bg-primary/20"
                      }`}
                    >
                      {isHost ? (
                        <Crown className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <User className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-foreground">{participant.fullname}</p>
                        {isCurrentUser && (
                          <Badge variant="outline" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Level {participant.level}</p>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">{score?.total_points || 0}</p>
                  <p className="text-xs text-muted-foreground">{score?.rounds_won || 0} rounds</p>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
