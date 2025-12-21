import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { CreateRoomCard } from "@/components/dashboard/create-room-card"
import { JoinRoomCard } from "@/components/dashboard/join-room-card"
import { UserStatsCard } from "@/components/dashboard/user-stats-card"
import { LeaderboardPreview } from "@/components/dashboard/leaderboard-preview"

export default async function DashboardPage() {
  const user = await getSession()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Actions */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Start a Battle</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <CreateRoomCard />
              <JoinRoomCard />
            </div>

            <LeaderboardPreview />
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            <UserStatsCard user={user} />
          </div>
        </div>
      </div>
    </div>
  )
}
