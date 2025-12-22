import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all public rooms that are waiting or in progress
    const rooms = await sql`
      SELECT 
        r.*,
        u.fullname as creator_name,
        (SELECT COUNT(*) FROM room_participants WHERE room_id = r.id) as participant_count
      FROM rooms r
      JOIN users u ON r.creator_id = u.id
      WHERE r.is_private = false 
        AND r.status IN ('waiting', 'in_progress')
      ORDER BY r.created_at DESC
      LIMIT 50
    `

    return NextResponse.json({ rooms })
  } catch (error) {
    console.error("[v0] Get public rooms error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
