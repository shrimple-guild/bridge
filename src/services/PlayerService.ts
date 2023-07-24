import SQL from "sql-template-strings";
import Postgres from "../database/database.js";
import { Player } from "../structures/Player.js";
import { QueryResult } from "pg";

export class PlayerService {
  constructor(private database: Postgres) {}

  async fetchByUsername(username: string) {
    const queryResult = await this.database.query<PlayerQueryResult>(SQL`
      SELECT id, username, skin FROM minecraft_players WHERE username = ${username} 
    `)
    return this.player(queryResult)
  }

  async fetchById(id: string) {
    const queryResult = await this.database.query<PlayerQueryResult>(SQL`
      SELECT id, username, skin FROM minecraft_players WHERE id = ${id}
    `)
    return this.player(queryResult)
  }

  async save(player: Player) {
    await this.database.query(SQL`
      INSERT OR REPLACE INTO minecraft_players
      VALUES ${player.id}, ${player.username}, ${player.skinData}, NOW()
    `)
  }

  private player(result: QueryResult<PlayerQueryResult>) {
    const player = result.rows.at(0)
    if (!player) return undefined
    return new Player(player.id, player.username, player.skin, player.updated)
  }
}

type PlayerQueryResult = {
  id: string,
  username: string,
  skin: string
  updated: Date
}