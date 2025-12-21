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

    // Get game details
    const games = await sql`
      SELECT g.*, r.total_rounds, r.current_round, r.status as room_status
      FROM games g
      JOIN rooms r ON g.room_id = r.id
      WHERE g.id = ${gameId}
    `

    if (games.length === 0) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    const game = games[0]

    // Check if game is completed
    if (game.room_status === "completed") {
      const finalScores = await sql`
        SELECT gs.*, u.fullname
        FROM game_scores gs
        JOIN users u ON gs.user_id = u.id
        WHERE gs.game_id = ${gameId}
        ORDER BY gs.total_points DESC, gs.average_time ASC
      `

      return NextResponse.json({ gameEnded: true, finalScores })
    }

    // Get or create current round
    let currentRound = await sql`
      SELECT * FROM game_rounds 
      WHERE game_id = ${gameId} AND status = 'active'
      ORDER BY round_number DESC
      LIMIT 1
    `

    // If no active round, create next round
    if (currentRound.length === 0) {
      const nextRoundNumber = (game.current_round as number) + 1

      if (nextRoundNumber > game.total_rounds) {
        // Game is over
        await sql`UPDATE games SET status = 'completed', completed_at = NOW() WHERE id = ${gameId}`
        await sql`UPDATE rooms SET status = 'completed', ended_at = NOW() WHERE id = ${game.room_id}`

        // Calculate final results
        const finalScores = await sql`
          SELECT gs.*, u.fullname
          FROM game_scores gs
          JOIN users u ON gs.user_id = u.id
          WHERE gs.game_id = ${gameId}
          ORDER BY gs.total_points DESC, gs.average_time ASC
        `

        // Update user stats
        for (let i = 0; i < finalScores.length; i++) {
          const score = finalScores[i]
          const result = i === 0 ? "winner" : finalScores[0].total_points === score.total_points ? "draw" : "loser"

          await sql`
            UPDATE game_scores 
            SET result = ${result}
            WHERE id = ${score.id}
          `

          if (result === "winner") {
            await sql`
              UPDATE users 
              SET total_wins = total_wins + 1, 
                  total_games = total_games + 1,
                  points = points + ${score.total_points},
                  experience = experience + ${score.total_points}
              WHERE id = ${score.user_id}
            `
          } else if (result === "draw") {
            await sql`
              UPDATE users 
              SET total_draws = total_draws + 1, 
                  total_games = total_games + 1,
                  points = points + ${score.total_points},
                  experience = experience + ${score.total_points}
              WHERE id = ${score.user_id}
            `
          } else {
            await sql`
              UPDATE users 
              SET total_losses = total_losses + 1, 
                  total_games = total_games + 1,
                  points = points + ${score.total_points},
                  experience = experience + ${score.total_points}
              WHERE id = ${score.user_id}
            `
          }
        }

        return NextResponse.json({ gameEnded: true, finalScores })
      }

      // Get room details
      const rooms = await sql`SELECT difficulty FROM rooms WHERE id = ${game.room_id}`
      const room = rooms[0]

      // Select random challenge based on difficulty
      const challenges = await sql`
        SELECT * FROM challenges 
        WHERE difficulty = ${room.difficulty} AND is_active = true
        ORDER BY RANDOM()
        LIMIT 1
      `

      if (challenges.length === 0) {
        return NextResponse.json({ error: "No challenges available" }, { status: 404 })
      }

      const challenge = challenges[0]

      // Create new round
      const newRounds = await sql`
        INSERT INTO game_rounds (game_id, round_number, challenge_id, status)
        VALUES (${gameId}, ${nextRoundNumber}, ${challenge.id}, 'active')
        RETURNING *
      `

      currentRound = newRounds

      // Update room's current round
      await sql`UPDATE rooms SET current_round = ${nextRoundNumber} WHERE id = ${game.room_id}`
    }

    const round = currentRound[0]

    // Get challenge
    const challenges = await sql`SELECT * FROM challenges WHERE id = ${round.challenge_id}`
    const challenge = challenges[0]

    // Get current scores
    const scores = await sql`
      SELECT gs.*, u.fullname
      FROM game_scores gs
      JOIN users u ON gs.user_id = u.id
      WHERE gs.game_id = ${gameId}
      ORDER BY gs.total_points DESC
    `

    return NextResponse.json({
      round,
      challenge,
      scores,
    })
  } catch (error) {
    console.error("[v0] Get current round error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
