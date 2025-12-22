import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function POST(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      difficulty = "medium",
      total_rounds = 3,
      is_private = false,
      max_players = 4,
      room_name,
    } = await request.json()

    // Validate max_players (2-10)
    const validMaxPlayers = Math.min(10, Math.max(2, max_players))

    // Generate unique room code
    let roomCode = generateRoomCode()
    let attempts = 0
    while (attempts < 10) {
      const existing = await sql`SELECT id FROM rooms WHERE room_code = ${roomCode}`
      if (existing.length === 0) break
      roomCode = generateRoomCode()
      attempts++
    }

    // Create room with new fields
    const rooms = await sql`
      INSERT INTO rooms (room_code, room_name, creator_id, difficulty, total_rounds, status, is_private, max_players)
      VALUES (${roomCode}, ${room_name || null}, ${user.id}, ${difficulty}, ${total_rounds}, 'waiting', ${is_private}, ${validMaxPlayers})
      RETURNING *
    `

    const room = rooms[0]

    // Add creator as participant
    await sql`
      INSERT INTO room_participants (room_id, user_id, is_ready)
      VALUES (${room.id}, ${user.id}, false)
    `

    return NextResponse.json({ success: true, room })
  } catch (error) {
    console.error("[v0] Create room error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
