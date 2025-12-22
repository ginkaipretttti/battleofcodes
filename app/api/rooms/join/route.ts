import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { room_code } = await request.json()

    if (!room_code) {
      return NextResponse.json({ error: "Room code is required" }, { status: 400 })
    }

    // Find room
    const rooms = await sql`
      SELECT * FROM rooms WHERE room_code = ${room_code}
    `

    if (rooms.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    const room = rooms[0]

    // Check if room is available
    if (room.status !== "waiting") {
      return NextResponse.json({ error: "Room is not available" }, { status: 400 })
    }

    // Check if already in room
    const existing = await sql`
      SELECT id FROM room_participants 
      WHERE room_id = ${room.id} AND user_id = ${user.id}
    `

    if (existing.length > 0) {
      return NextResponse.json({ success: true, room })
    }

    // Check room capacity
    const participants = await sql`
      SELECT COUNT(*) as count FROM room_participants WHERE room_id = ${room.id}
    `

    if (Number(participants[0].count) >= room.max_players) {
      return NextResponse.json({ error: "Room is full" }, { status: 400 })
    }

    // Add user to room
    await sql`
      INSERT INTO room_participants (room_id, user_id, is_ready)
      VALUES (${room.id}, ${user.id}, false)
    `

    return NextResponse.json({ success: true, room })
  } catch (error) {
    console.error("[v0] Join room error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
