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

    // Remove user from room participants
    await sql`
      DELETE FROM room_participants 
      WHERE room_id = ${room.id} AND user_id = ${user.id}
    `

    // If the user leaving is the creator, close the room
    if (room.creator_id === user.id) {
      await sql`
        UPDATE rooms 
        SET status = 'completed', ended_at = NOW()
        WHERE id = ${room.id}
      `

      // Remove all remaining participants
      await sql`
        DELETE FROM room_participants WHERE room_id = ${room.id}
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Leave room error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
