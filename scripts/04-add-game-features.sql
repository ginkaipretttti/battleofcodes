-- Add new columns for game features

-- Add room_name and room visibility to rooms
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_name VARCHAR(100);

-- Add leave penalty tracking to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS leave_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS timeout_until TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS character_type VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type VARCHAR(20) DEFAULT 'student';

-- Add certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    placement INTEGER NOT NULL, -- 1, 2, 3, or 0 for participation
    certificate_type VARCHAR(50) NOT NULL, -- 'winner', 'second', 'third', 'participation'
    player_name VARCHAR(100) NOT NULL,
    game_date TIMESTAMP NOT NULL,
    total_players INTEGER NOT NULL,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, game_id)
);

-- Add index for certificates
CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);

-- Add kick votes table for in-match voting
CREATE TABLE IF NOT EXISTS kick_votes (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    target_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    voter_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, target_user_id, voter_user_id)
);

-- Update room status tracking
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS auto_start_at TIMESTAMP;
