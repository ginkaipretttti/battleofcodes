"use client"

import type { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { LogOut, Trophy, UserIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface DashboardHeaderProps {
  user: User
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <img src="/images/gamelogo.png" alt="Battle of Codes" className="h-12 cursor-pointer" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">Battle of Codes</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user.fullname}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/profile">
                <UserIcon className="w-4 h-4 mr-2" />
                Profile
              </Link>
            </Button>

            <Button variant="ghost" size="sm" asChild>
              <Link href="/leaderboard">
                <Trophy className="w-4 h-4 mr-2" />
                Leaderboard
              </Link>
            </Button>

            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">{user.points} pts</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
