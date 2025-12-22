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
    const { is_ready } = await request.json()

    const rooms = await sql`SELECT * FROM rooms WHERE room_code = ${code}`
    if (rooms.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    const room = rooms[0]

    await sql`
      UPDATE room_participants 
      SET is_ready = ${is_ready}
      WHERE room_id = ${room.id} AND user_id = ${user.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Toggle ready error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
