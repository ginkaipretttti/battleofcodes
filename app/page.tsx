import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Code2, Trophy, Zap, Users } from "lucide-react"

export default async function HomePage() {
  const user = await getSession()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <img src="/images/gamelogo.png" alt="Battle of Codes" className="h-24 mx-auto mb-8" />
          <h1 className="text-5xl font-bold text-foreground mb-4 text-balance">Battle of Codes</h1>
          <p className="text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
            Compete in real-time coding challenges. Test your C# skills against other developers and climb the
            leaderboard.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Code2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Real-Time Battles</h3>
            <p className="text-sm text-muted-foreground">Compete against other players in live coding challenges</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Earn Points</h3>
            <p className="text-sm text-muted-foreground">Win games to earn points and unlock achievements</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Multiple Rounds</h3>
            <p className="text-sm text-muted-foreground">Face different challenges in each round of the game</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Join Rooms</h3>
            <p className="text-sm text-muted-foreground">Create or join rooms with custom difficulty settings</p>
          </div>
        </div>
      </div>
    </div>
  )
}
