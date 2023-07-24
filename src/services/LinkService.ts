import SQL from "sql-template-strings";
import Postgres from "../database/database.js";
import { Player } from "../structures/Player.js";
import { QueryResult } from "pg";
import { GuildMember } from "discord.js";

export class LinkService {
  constructor(private database: Postgres) {}

  async fetchMinecraft(discord: GuildMember) {
    this.database.query(SQL`
      
    `)
  }

  async fetchDiscord(minecraft: Player) {

  }

  async link(discord: GuildMember, minecraft: Player) {
    
  }

  async unlink(discord: GuildMember) {

  }

}
