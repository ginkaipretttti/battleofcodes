-- Seed achievement badges

INSERT INTO badges (name, description, icon_url, requirement_type, requirement_value) VALUES
('First Victory', 'Win your first game', '/images/badges/first-win.png', 'wins', 1),
('Veteran', 'Play 10 games', '/images/badges/veteran.png', 'games_played', 10),
('Champion', 'Win 5 games', '/images/badges/champion.png', 'wins', 5),
('Code Master', 'Earn 1000 points', '/images/badges/code-master.png', 'points', 1000),
('Speed Demon', 'Win 3 games in a row', '/images/badges/speed-demon.png', 'streak', 3),
('Perfectionist', 'Win a game with perfect score', '/images/badges/perfectionist.png', 'perfect_game', 1);
