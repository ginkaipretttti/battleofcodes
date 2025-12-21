import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
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

    const participants = await sql`
      SELECT rp.*, u.fullname, u.points, u.level
      FROM room_participants rp
      JOIN users u ON rp.user_id = u.id
      WHERE rp.room_id = ${room.id}
      ORDER BY rp.joined_at ASC
    `

    return NextResponse.json({ room, participants })
  } catch (error) {
    console.error("[v0] Get participants error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
