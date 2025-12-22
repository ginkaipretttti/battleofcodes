import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { WaitingRoom } from "@/components/room/waiting-room"

interface RoomPageProps {
  params: Promise<{ code: string }>
}

export default async function RoomPage({ params }: RoomPageProps) {
  const user = await getSession()
  if (!user) {
    redirect("/login")
  }

  const { code } = await params

  // Fetch room details
  const rooms = await sql`
    SELECT r.*, u.fullname as creator_name
    FROM rooms r
    JOIN users u ON r.creator_id = u.id
    WHERE r.room_code = ${code}
  `

  if (rooms.length === 0) {
    redirect("/dashboard")
  }

  const room = rooms[0]

  // Check if game has started
  if (room.status === "in_progress") {
    redirect(`/game/${code}`)
  }

  // Fetch participants
  const participants = await sql`
    SELECT rp.*, u.fullname, u.points, u.level
    FROM room_participants rp
    JOIN users u ON rp.user_id = u.id
    WHERE rp.room_id = ${room.id}
    ORDER BY rp.joined_at ASC
  `

  return <WaitingRoom room={room} participants={participants} currentUser={user} />
}
