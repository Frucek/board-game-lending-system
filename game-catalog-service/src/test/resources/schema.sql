CREATE TABLE IF NOT EXISTS games (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    min_players INTEGER NOT NULL,
    max_players INTEGER NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE
);