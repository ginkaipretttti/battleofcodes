export interface User {
  id: number
  fullname: string
  email: string
  total_games: number
  total_wins: number
  total_losses: number
  total_draws: number
  points: number
  level: number
  experience: number
  avatar_url: string | null
}

export interface Room {
  id: number
  room_code: string
  creator_id: number
  status: "waiting" | "in_progress" | "completed"
  total_rounds: number
  current_round: number
  difficulty: "easy" | "medium" | "hard"
  is_private: boolean
  max_players: number
  created_at: string
  started_at: string | null
  ended_at: string | null
  participants?: RoomParticipant[]
  creator?: User
}

export interface RoomParticipant {
  id: number
  room_id: number
  user_id: number
  joined_at: string
  is_ready: boolean
  user?: User
}

export interface Challenge {
  id: number
  title: string
  description: string
  difficulty: "easy" | "medium" | "hard"
  test_cases: TestCase[]
  initial_code: string
  solution_template: string
  points: number
  time_limit: number
}

export interface TestCase {
  input: string
  expectedOutput: string
}

export interface Game {
  id: number
  room_id: number
  status: "active" | "completed" | "abandoned"
  created_at: string
  completed_at: string | null
}

export interface GameRound {
  id: number
  game_id: number
  round_number: number
  challenge_id: number
  started_at: string
  ended_at: string | null
  status: "active" | "completed"
  challenge?: Challenge
}

export interface Submission {
  id: number
  game_round_id: number
  user_id: number
  code: string
  is_correct: boolean
  test_results: any
  points_earned: number
  submitted_at: string
  execution_time: number
}

export interface GameScore {
  id: number
  game_id: number
  user_id: number
  total_points: number
  rounds_won: number
  average_time: number
  result: "winner" | "loser" | "draw"
  user?: User
}

export interface Badge {
  id: number
  name: string
  description: string
  icon_url: string
  requirement_type: string
  requirement_value: number
}

export interface ChatMessage {
  id: number
  room_id: number
  user_id: number
  message: string
  created_at: string
  user?: User
}
