import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PublicRoomsList } from "@/components/lobby/public-rooms-list"
import { CreateRoomModal } from "@/components/lobby/create-room-modal"
import { JoinPrivateModal } from "@/components/lobby/join-private-modal"
import { UserStatsCard } from "@/components/dashboard/user-stats-card"
import { Plus, DoorOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const user = await getSession()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Actions */}
          <div className="space-y-4">
            <CreateRoomModal
              trigger={
                <Button className="w-full gap-2 h-12 text-base">
                  <Plus className="w-5 h-5" />
                  CREATE A ROOM
                </Button>
              }
            />

            <JoinPrivateModal
              trigger={
                <Button variant="outline" className="w-full gap-2 h-12 text-base bg-transparent">
                  <DoorOpen className="w-5 h-5" />
                  JOIN A PRIVATE ROOM
                </Button>
              }
            />

            {/* User Stats */}
            <UserStatsCard user={user} />
          </div>

          {/* Main Content - Public Rooms */}
          <div className="lg:col-span-3">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-foreground">Available Public Rooms</h2>
              <p className="text-sm text-muted-foreground">Join an existing room or create your own</p>
            </div>
            <PublicRoomsList />
          </div>
        </div>
      </div>
    </div>
  )
}
