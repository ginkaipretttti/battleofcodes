import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function POST(request: Request, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { gameId } = await params

    // Get game and room details
    const games = await sql`
      SELECT g.*, r.creator_id, r.id as room_id
      FROM games g
      JOIN rooms r ON g.room_id = r.id
      WHERE g.id = ${gameId}
    `

    if (games.length === 0) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    const game = games[0]
    const isHost = game.creator_id === user.id

    // Increment leave count for the user
    await sql`
      UPDATE users 
      SET leave_count = COALESCE(leave_count, 0) + 1
      WHERE id = ${user.id}
    `

    // Check if user has left 3 times - apply timeout
    const updatedUser = await sql`SELECT leave_count FROM users WHERE id = ${user.id}`
    if (updatedUser[0].leave_count >= 3) {
      await sql`
        UPDATE users 
        SET timeout_until = NOW() + INTERVAL '2 minutes',
            leave_count = 0
        WHERE id = ${user.id}
      `
    }

    // Remove user's score (points don't count if left mid-game)
    await sql`
      DELETE FROM game_scores WHERE game_id = ${gameId} AND user_id = ${user.id}
    `

    // If host leaves, end the game for everyone
    if (isHost) {
      await sql`
        UPDATE games 
        SET status = 'abandoned', completed_at = NOW()
        WHERE id = ${gameId}
      `

      await sql`
        UPDATE rooms 
        SET status = 'completed', ended_at = NOW()
        WHERE id = ${game.room_id}
      `

      // Don't award points to anyone if host left
      await sql`
        DELETE FROM game_scores WHERE game_id = ${gameId}
      `
    }

    return NextResponse.json({ success: true, hostLeft: isHost })
  } catch (error) {
    console.error("[v0] Leave game error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
