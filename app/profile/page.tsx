import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Target, Award, TrendingUp, Calendar, Clock, Zap, Download } from "lucide-react"
import Link from "next/link"

export default async function ProfilePage() {
  const user = await getSession()
  if (!user) {
    redirect("/login")
  }

  // Get user's badges
  const userBadges = await sql`
    SELECT b.*, ub.earned_at
    FROM user_badges ub
    JOIN badges b ON ub.badge_id = b.id
    WHERE ub.user_id = ${user.id}
    ORDER BY ub.earned_at DESC
  `

  // Get recent games
  const recentGames = await sql`
    SELECT 
      gs.*, 
      r.room_code, 
      r.created_at as game_date,
      r.difficulty,
      r.total_rounds
    FROM game_scores gs
    JOIN games g ON gs.game_id = g.id
    JOIN rooms r ON g.room_id = r.id
    WHERE gs.user_id = ${user.id}
    ORDER BY r.created_at DESC
    LIMIT 10
  `

  // Get user's rank
  const userRank = await sql`
    SELECT COUNT(*) + 1 as rank
    FROM users
    WHERE points > ${user.points}
  `

  const currentUserRank = Number(userRank[0].rank)
  const winRate = user.total_games > 0 ? ((user.total_wins / user.total_games) * 100).toFixed(1) : "0.0"

  const certificates = await sql`
    SELECT *
    FROM certificates
    WHERE user_id = ${user.id}
    ORDER BY created_at DESC
    LIMIT 20
  `

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold">
                {user.fullname.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-4xl font-bold">{user.fullname}</h1>
                <p className="text-muted-foreground mt-2">{user.email}</p>
                <div className="flex items-center gap-4 mt-3">
                  <Badge variant="default" className="text-base px-3 py-1">
                    Level {user.level}
                  </Badge>
                  <Badge variant="outline" className="text-base px-3 py-1">
                    Rank #{currentUserRank}
                  </Badge>
                </div>
              </div>
            </div>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-3xl font-bold text-primary">{user.points}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Points</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-3xl font-bold">{user.total_games}</p>
                <p className="text-sm text-muted-foreground mt-1">Games Played</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Award className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-green-600">{user.total_wins}</p>
                <p className="text-sm text-muted-foreground mt-1">Victories</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-purple-600">{winRate}%</p>
                <p className="text-sm text-muted-foreground mt-1">Win Rate</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Games */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Games
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentGames.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No games played yet</p>
                ) : (
                  recentGames.map((game: any) => (
                    <div key={game.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge variant={game.result === "winner" ? "default" : "secondary"}>
                            {game.result === "winner" ? "Victory" : game.result === "draw" ? "Draw" : "Defeat"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">Room {game.room_code}</span>
                          <Badge variant="outline" className="capitalize">
                            {game.difficulty}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(game.game_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3 text-center text-sm">
                        <div>
                          <p className="text-xl font-bold text-primary">{game.total_points}</p>
                          <p className="text-muted-foreground">Points</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold">{game.rounds_won}</p>
                          <p className="text-muted-foreground">Rounds Won</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold">{game.average_time}ms</p>
                          <p className="text-muted-foreground">Avg Time</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with Achievements and Certificates */}
          <div>
            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {userBadges.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground text-sm">No achievements yet. Keep playing!</p>
                ) : (
                  userBadges.map((badge: any) => (
                    <div key={badge.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {new Date(badge.earned_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Certificates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {certificates.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground text-sm">No certificates earned yet</p>
                ) : (
                  certificates.map((cert: any) => (
                    <Link
                      key={cert.id}
                      href={`/certificate/${cert.game_id}`}
                      className="block p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-sm capitalize group-hover:text-primary transition-colors">
                            {cert.certificate_type === "winner"
                              ? "1st Place"
                              : cert.certificate_type === "second"
                                ? "2nd Place"
                                : cert.certificate_type === "third"
                                  ? "3rd Place"
                                  : "Participation"}
                          </p>
                          <p className="text-xs text-muted-foreground">{cert.points_earned} points</p>
                          <p className="text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {new Date(cert.game_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Progress to Next Level */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Level Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level {user.level}</span>
                    <span className="font-semibold">Level {user.level + 1}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-primary/60 h-full transition-all"
                      style={{ width: `${(user.experience % 1000) / 10}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">{user.experience % 1000} / 1000 XP</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
