import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

const CSHARP_EXECUTOR_URL = process.env.CSHARP_EXECUTOR_URL || "http://localhost:3002"

async function executeWithRetry(code: string, testCases: any[], maxRetries = 3) {
  let lastError: any

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[v0] Executing code, attempt ${attempt}/${maxRetries}`)

      const executorResponse = await fetch(`${CSHARP_EXECUTOR_URL}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          testCases,
        }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })

      if (!executorResponse.ok) {
        const errorData = await executorResponse.json()
        throw new Error(errorData.error || "Code execution failed")
      }

      return await executorResponse.json()
    } catch (error: any) {
      lastError = error
      console.error(`[v0] Attempt ${attempt} failed:`, error.message)

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

export async function POST(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { game_round_id, code } = await request.json()

    // Get round and challenge details
    const rounds = await sql`
      SELECT gr.*, c.test_cases, c.points, c.title
      FROM game_rounds gr
      JOIN challenges c ON gr.challenge_id = c.id
      WHERE gr.id = ${game_round_id}
    `

    if (rounds.length === 0) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 })
    }

    const round = rounds[0]
    const testCases = round.test_cases as any[]

    let results
    let executionTime
    let allPassed = false

    try {
      const executorData = await executeWithRetry(code, testCases)
      results = executorData.results
      executionTime = executorData.totalExecutionTime
      allPassed = executorData.allPassed
    } catch (error: any) {
      console.error("[v0] C# executor error after retries:", error)

      return NextResponse.json({
        success: false,
        error: error.message || "Code execution failed. Please try again.",
        results: {
          is_correct: false,
          test_results: testCases.map((tc) => ({
            input: tc.input,
            expected: tc.expectedOutput,
            actual: null,
            passed: false,
            error: error.message,
          })),
          points_earned: 0,
          execution_time: 0,
        },
      })
    }

    const pointsEarned = allPassed ? (round.points as number) : Math.floor((round.points as number) * 0.3)

    // Save submission
    await sql`
      INSERT INTO submissions (game_round_id, user_id, code, is_correct, test_results, points_earned, execution_time)
      VALUES (${game_round_id}, ${user.id}, ${code}, ${allPassed}, ${JSON.stringify(results)}, ${pointsEarned}, ${executionTime})
    `

    // Update game score
    if (allPassed) {
      await sql`
        UPDATE game_scores
        SET total_points = total_points + ${pointsEarned},
            rounds_won = rounds_won + 1,
            average_time = CASE 
              WHEN average_time IS NULL THEN ${executionTime}
              ELSE (average_time + ${executionTime}) / 2
            END
        WHERE game_id = ${round.game_id} AND user_id = ${user.id}
      `
    } else {
      await sql`
        UPDATE game_scores
        SET total_points = total_points + ${pointsEarned}
        WHERE game_id = ${round.game_id} AND user_id = ${user.id}
      `
    }

    return NextResponse.json({
      success: true,
      results: {
        is_correct: allPassed,
        test_results: results,
        points_earned: pointsEarned,
        execution_time: executionTime,
      },
    })
  } catch (error) {
    console.error("[v0] Submit code error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
