import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get various stats
    const totalUsers = await sql`SELECT COUNT(*) as count FROM users`
    const totalGames = await sql`SELECT COUNT(*) as count FROM games WHERE status = 'completed'`
    const totalChallenges = await sql`SELECT COUNT(*) as count FROM challenges WHERE is_active = true`

    const userRank = await sql`
      SELECT COUNT(*) + 1 as rank
      FROM users
      WHERE points > ${user.points}
    `

    return NextResponse.json({
      totalUsers: Number(totalUsers[0].count),
      totalGames: Number(totalGames[0].count),
      totalChallenges: Number(totalChallenges[0].count),
      userRank: Number(userRank[0].rank),
    })
  } catch (error) {
    console.error("[v0] Get stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
