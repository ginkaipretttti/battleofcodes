import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, Lock, CheckCircle } from "lucide-react"
import Link from "next/link"

export default async function BadgesPage() {
  const user = await getSession()

  if (!user) {
    redirect("/login")
  }

  // Get all badges
  const allBadges = await sql`
    SELECT * FROM badges ORDER BY requirement_value ASC
  `

  // Get user's earned badges
  const userBadges = await sql`
    SELECT badge_id FROM user_badges WHERE user_id = ${user.id}
  `

  const earnedBadgeIds = new Set(userBadges.map((b: any) => b.badge_id))

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block">
            &larr; Back to Lobby
          </Link>
          <h1 className="text-3xl font-bold text-primary mb-2">BADGES & REWARDS</h1>
          <p className="text-muted-foreground">Complete challenges and unlock exclusive badges</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <Badge variant="default" className="px-4 py-2 text-sm cursor-pointer">
            Earned
          </Badge>
          <Badge variant="outline" className="px-4 py-2 text-sm cursor-pointer">
            Locked
          </Badge>
        </div>

        {/* Badges Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {allBadges.map((badge: any) => {
            const isEarned = earnedBadgeIds.has(badge.id)

            return (
              <Card
                key={badge.id}
                className={`relative overflow-hidden ${
                  isEarned ? "bg-primary/10 border-primary/30" : "bg-secondary/50 border-border opacity-60"
                }`}
              >
                <CardContent className="p-6 text-center">
                  {/* Badge Icon */}
                  <div
                    className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      isEarned ? "bg-primary/20" : "bg-muted"
                    }`}
                  >
                    {isEarned ? (
                      <Award className="w-10 h-10 text-primary" />
                    ) : (
                      <span className="text-4xl font-bold text-muted-foreground">??</span>
                    )}
                  </div>

                  {/* Badge Name */}
                  <h3 className={`font-bold text-lg mb-1 ${isEarned ? "text-foreground" : "text-muted-foreground"}`}>
                    {badge.name}
                  </h3>

                  {/* Badge Description */}
                  <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>

                  {/* Status */}
                  <div className="flex items-center justify-center gap-2">
                    {isEarned ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-500">Complete</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Locked</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
