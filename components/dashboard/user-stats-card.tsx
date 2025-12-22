import type { User } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Target, Award, TrendingUp } from "lucide-react"

interface UserStatsCardProps {
  user: User
}

export function UserStatsCard({ user }: UserStatsCardProps) {
  const winRate = user.total_games > 0 ? ((user.total_wins / user.total_games) * 100).toFixed(1) : "0.0"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-muted-foreground">Total Points</span>
          </div>
          <span className="font-bold text-lg">{user.points}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-muted-foreground">Games Played</span>
          </div>
          <span className="font-bold text-lg">{user.total_games}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-green-500" />
            <span className="text-sm text-muted-foreground">Wins</span>
          </div>
          <span className="font-bold text-lg">{user.total_wins}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-muted-foreground">Win Rate</span>
          </div>
          <span className="font-bold text-lg">{winRate}%</span>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Level</span>
            <span className="font-bold text-2xl text-primary">{user.level}</span>
          </div>
          <div className="mt-2 bg-muted rounded-full h-2 overflow-hidden">
            <div className="bg-primary h-full transition-all" style={{ width: `${(user.experience % 1000) / 10}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-center">{user.experience % 1000} / 1000 XP</p>
        </div>
      </CardContent>
    </Card>
  )
}
