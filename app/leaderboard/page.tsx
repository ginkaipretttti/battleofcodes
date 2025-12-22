import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, Award, TrendingUp, Target, Zap } from "lucide-react"
import Link from "next/link"
import type { User } from "@/lib/types"

export default async function LeaderboardPage() {
  const user = await getSession()
  if (!user) {
    redirect("/login")
  }

  // Get top 50 players
  const topPlayers = (await sql`
    SELECT 
      id, fullname, points, total_wins, total_games, total_losses, 
      total_draws, level, experience, avatar_url
    FROM users
    ORDER BY points DESC, total_wins DESC
    LIMIT 50
  `) as User[]

  // Get user's rank
  const userRank = await sql`
    SELECT COUNT(*) + 1 as rank
    FROM users
    WHERE points > ${user.points}
  `

  const currentUserRank = Number(userRank[0].rank)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Global Leaderboard</h1>
                <p className="text-muted-foreground mt-2">Compete with the best coders worldwide</p>
              </div>
            </div>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>

          {/* User's Current Rank */}
          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Current Rank</p>
                    <p className="text-2xl font-bold">#{currentUserRank}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{user.points}</p>
                    <p className="text-xs text-muted-foreground">Points</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{user.total_wins}</p>
                    <p className="text-xs text-muted-foreground">Wins</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{user.total_games}</p>
                    <p className="text-xs text-muted-foreground">Games</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Top Players</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {topPlayers.map((player, index) => {
                const isCurrentUser = player.id === user.id
                const winRate =
                  player.total_games > 0 ? ((player.total_wins / player.total_games) * 100).toFixed(1) : "0.0"

                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-6 hover:bg-muted/50 transition-colors ${
                      isCurrentUser ? "bg-primary/5" : ""
                    }`}
                  >
                    {/* Rank and Player Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                          index === 0
                            ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white"
                            : index === 1
                              ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white"
                              : index === 2
                                ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index < 3 ? (
                          index === 0 ? (
                            <Trophy className="w-6 h-6" />
                          ) : index === 1 ? (
                            <Medal className="w-6 h-6" />
                          ) : (
                            <Award className="w-6 h-6" />
                          )
                        ) : (
                          index + 1
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-lg">
                            {player.fullname}
                            {isCurrentUser && (
                              <Badge variant="outline" className="ml-2">
                                You
                              </Badge>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            Level {player.level}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {winRate}% Win Rate
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {player.total_games} Games
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">{player.points}</p>
                        <p className="text-xs text-muted-foreground">Points</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{player.total_wins}</p>
                        <p className="text-xs text-muted-foreground">Wins</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-600">{player.total_losses}</p>
                        <p className="text-xs text-muted-foreground">Losses</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
