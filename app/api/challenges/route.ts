import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const difficulty = searchParams.get("difficulty")

    let challenges

    if (difficulty) {
      challenges = await sql`
        SELECT * FROM challenges 
        WHERE difficulty = ${difficulty} AND is_active = true
        ORDER BY created_at DESC
      `
    } else {
      challenges = await sql`
        SELECT * FROM challenges 
        WHERE is_active = true
        ORDER BY difficulty, created_at DESC
      `
    }

    return NextResponse.json({ challenges })
  } catch (error) {
    console.error("[v0] Get challenges error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, difficulty, test_cases, initial_code, solution_template, points, time_limit } =
      await request.json()

    const challenges = await sql`
      INSERT INTO challenges (title, description, difficulty, test_cases, initial_code, solution_template, points, time_limit)
      VALUES (${title}, ${description}, ${difficulty}, ${JSON.stringify(test_cases)}, ${initial_code}, ${solution_template}, ${points}, ${time_limit})
      RETURNING *
    `

    return NextResponse.json({ success: true, challenge: challenges[0] })
  } catch (error) {
    console.error("[v0] Create challenge error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
