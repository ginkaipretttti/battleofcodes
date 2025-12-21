import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { GameInterface } from "@/components/game/game-interface"

interface GamePageProps {
  params: Promise<{ code: string }>
}

export default async function GamePage({ params }: GamePageProps) {
  const user = await getSession()
  if (!user) {
    redirect("/login")
  }

  const { code } = await params

  // Fetch room and game details
  const rooms = await sql`
    SELECT * FROM rooms WHERE room_code = ${code}
  `

  if (rooms.length === 0) {
    redirect("/dashboard")
  }

  const room = rooms[0]

  if (room.status !== "in_progress") {
    redirect(`/room/${code}`)
  }

  // Get game
  const games = await sql`
    SELECT * FROM games WHERE room_id = ${room.id} AND status = 'active'
  `

  if (games.length === 0) {
    redirect("/dashboard")
  }

  const game = games[0]

  // Get participants
  const participants = await sql`
    SELECT rp.*, u.fullname, u.points, u.level, u.avatar_url
    FROM room_participants rp
    JOIN users u ON rp.user_id = u.id
    WHERE rp.room_id = ${room.id}
  `

  return <GameInterface room={room} game={game} participants={participants} currentUser={user} />
}
