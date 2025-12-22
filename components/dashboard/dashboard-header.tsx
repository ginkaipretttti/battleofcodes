"use client"

import type { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { LogOut, Trophy, UserIcon, Award, LayoutGrid } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  user: User
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  const navItems = [
    { href: "/dashboard", label: "LOBBY", icon: LayoutGrid },
    { href: "/leaderboard", label: "LEADERBOARD", icon: Trophy },
    { href: "/profile", label: "PROFILE", icon: UserIcon },
    { href: "/badges", label: "BADGES AND REWARDS", icon: Award },
  ]

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Nav */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-3">
              <img src="/images/gamelogo.png" alt="Battle of Codes" className="h-10" />
            </Link>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-lg">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">{user.points} pts</span>
            </div>

            <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                {user.fullname.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-sm">{user.fullname}</span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop warning banner */}
      <div className="bg-primary/10 border-t border-primary/20 px-4 py-2">
        <p className="text-center text-sm text-muted-foreground">
          Recommended to play on Desktop/Laptop for best experience
        </p>
      </div>
    </header>
  )
}
