import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Code2 } from "lucide-react"

export default async function AdminChallengesPage() {
  const user = await getSession()
  if (!user) {
    redirect("/login")
  }

  const challenges = await sql`
    SELECT * FROM challenges 
    ORDER BY difficulty, created_at DESC
  `

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Challenge Management</h1>
            <p className="text-muted-foreground mt-2">Create and manage coding challenges</p>
          </div>
          <Button asChild>
            <Link href="/admin/challenges/new">
              <Plus className="w-4 h-4 mr-2" />
              New Challenge
            </Link>
          </Button>
        </div>

        <div className="grid gap-4">
          {challenges.map((challenge: any) => (
            <Card key={challenge.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Code2 className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
                    </div>
                  </div>
                  <Badge variant={challenge.difficulty === "easy" ? "secondary" : "default"}>
                    {challenge.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span>{challenge.points} points</span>
                  <span>{challenge.time_limit}s time limit</span>
                  <span>{(challenge.test_cases as any[]).length} test cases</span>
                  <Badge variant={challenge.is_active ? "default" : "secondary"}>
                    {challenge.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
