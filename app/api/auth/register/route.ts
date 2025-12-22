import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { hashPassword, setSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { fullname, email, password } = await request.json()

    if (!fullname || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Check if email already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const newUsers = await sql`
      INSERT INTO users (fullname, email, password)
      VALUES (${fullname}, ${email}, ${hashedPassword})
      RETURNING id, fullname, email
    `

    const user = newUsers[0]
    await setSession(user.id as number)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
