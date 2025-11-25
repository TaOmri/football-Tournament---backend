CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  group_name VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  home_team_id INTEGER NOT NULL REFERENCES teams(id),
  away_team_id INTEGER NOT NULL REFERENCES teams(id),
  kickoff_at TIMESTAMPTZ NOT NULL,
  stage VARCHAR(50) NOT NULL,
  result_home INTEGER,
  result_away INTEGER
);

CREATE TABLE IF NOT EXISTS predictions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  match_id INTEGER NOT NULL REFERENCES matches(id),
  predicted_home INTEGER NOT NULL,
  predicted_away INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, match_id)
);

CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  bets_close_at TIMESTAMPTZ NOT NULL
);