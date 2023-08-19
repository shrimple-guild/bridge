CREATE TABLE IF NOT EXISTS guilds (
  id TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS discord_members (
  id TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS minecraft_players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  skin TEXT NOT NULL,
  updated TIMESTAMP DEFAULT now(),
  update_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS linked_members (
  id SERIAL PRIMARY KEY,
  guild_id TEXT REFERENCES guilds(id),
  discord_id TEXT NOT NULL REFERENCES discord_members(id),
  minecraft_id TEXT REFERENCES minecraft_players(id),
  CONSTRAINT unique_discord UNIQUE(guild_id, discord_id),
  CONSTRAINT unique_minecraft UNIQUE(guild_id, minecraft_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_minecraft_names ON minecraft_players(lower(name));
