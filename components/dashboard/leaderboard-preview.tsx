import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import type { User } from "@/lib/types"

export async function LeaderboardPreview() {
  const topPlayers = (await sql`
    SELECT id, fullname, points, total_wins, total_games, level
    FROM users
    ORDER BY points DESC
    LIMIT 5
  `) as User[]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Top Players
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topPlayers.map((player, index) => (
            <div key={player.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0
                      ? "bg-yellow-500 text-white"
                      : index === 1
                        ? "bg-gray-400 text-white"
                        : index === 2
                          ? "bg-orange-600 text-white"
                          : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{player.fullname}</p>
                  <p className="text-xs text-muted-foreground">
                    Level {player.level} • {player.total_wins}W / {player.total_games}G
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">{player.points}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
