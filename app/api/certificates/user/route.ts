import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const certificates = await sql`
      SELECT *
      FROM certificates
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `

    return NextResponse.json(certificates)
  } catch (error) {
    console.error("[v0] Get certificates error:", error)
    return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 })
  }
}
