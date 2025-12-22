import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { gameId } = await params

    const certificates = await sql`
      SELECT *
      FROM certificates
      WHERE game_id = ${gameId} AND user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (certificates.length === 0) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    return NextResponse.json(certificates[0])
  } catch (error) {
    console.error("[v0] Certificate fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch certificate" }, { status: 500 })
  }
}
