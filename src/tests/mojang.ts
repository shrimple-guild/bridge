import SQL from "sql-template-strings"
import Postgres from "../database/database.js";
import config from '../config_dev.json' assert { type: "json" };

const pool = new Postgres(config.database)

await pool.query(SQL`

  CREATE TABLE guilds (
    id text PRIMARY KEY,
    hypixel_id text NOT NULL,
    guild_name text NOT NULL
  )

  CREATE TABLE guild_members (
    id text PRIMARY KEY,
    guild_id text NOT NULL,
    guild_role text NOT NULL,
    staff boolean DEFAULT false,
    CONSTRAINT fk_guild
      FOREIGN KEY (guild_id)
      REFERENCES guilds (id)
  );

  CREATE TABLE minecraft_users (
    id text PRIMARY KEY,
    username text UNIQUE NOT NULL,
    skin text NOT NULL,
    updated timestamp(0) DEFAULT CURRENT_TIMESTAMP(0)
    discord_id text UNIQUE REFERENCES discord_users(discord_id)
  );

  CREATE TABLE discord_users (
    id text PRIMARY KEY
  );

`)

await pool.query(SQL`
  DROP TABLE minecraft_players
`)

await pool.end()