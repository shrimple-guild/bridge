DROP TABLE IF EXISTS linked_members;
DROP TABLE IF EXISTS discord_members;
DROP TABLE IF EXISTS minecraft_players;
DROP TABLE IF EXISTS discord_members;
DROP INDEX IF EXISTS idx_minecraft_names;

CREATE TABLE IF NOT EXISTS discord_members (
  id TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS linked_members (
  discord_id TEXT PRIMARY KEY REFERENCES discord_members(id),
  minecraft_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS minecraft_players (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE,
  skin TEXT NOT NULL,
  updated TIMESTAMP DEFAULT now(),
  update_count INTEGER DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_minecraft_names ON minecraft_players(lower(name));
