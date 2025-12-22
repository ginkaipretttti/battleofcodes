import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { code } = await params

    const rooms = await sql`SELECT * FROM rooms WHERE room_code = ${code}`
    if (rooms.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    const room = rooms[0]

    // Check if user is creator
    if (room.creator_id !== user.id) {
      return NextResponse.json({ error: "Only room creator can start game" }, { status: 403 })
    }

    // Check participants
    const participants = await sql`
      SELECT * FROM room_participants WHERE room_id = ${room.id}
    `

    if (participants.length < 2) {
      return NextResponse.json({ error: "Need at least 2 players" }, { status: 400 })
    }

    // Update room status
    await sql`
      UPDATE rooms 
      SET status = 'in_progress', started_at = NOW()
      WHERE id = ${room.id}
    `

    // Create game record
    const games = await sql`
      INSERT INTO games (room_id, status)
      VALUES (${room.id}, 'active')
      RETURNING *
    `

    const game = games[0]

    // Initialize game scores for all participants
    for (const participant of participants) {
      await sql`
        INSERT INTO game_scores (game_id, user_id, total_points, rounds_won)
        VALUES (${game.id}, ${participant.user_id}, 0, 0)
      `
    }

    // Get a challenge for the first round
    const challenges = await sql`
      SELECT * FROM challenges 
      WHERE difficulty = ${room.difficulty} AND is_active = true
      ORDER BY RANDOM()
      LIMIT 1
    `

    if (challenges.length > 0) {
      // Create the first round
      await sql`
        INSERT INTO game_rounds (game_id, round_number, challenge_id, status)
        VALUES (${game.id}, 1, ${challenges[0].id}, 'active')
      `
    }

    return NextResponse.json({ success: true, game })
  } catch (error) {
    console.error("[v0] Start game error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
