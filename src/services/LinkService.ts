import PostgresPool from "../database/Pool.js"
import SQL from "sql-template-strings"

type VerificationConfig = {
  unverifiedRole: string,
  verifiedRole: string,
  channelId: string
}

type Status = {
  verified: boolean,
  linked: boolean
}

export class LinkService { 

  constructor(private pool: PostgresPool) {}

  async getMinecraft(guildId: string, discordId: string): Promise<string | undefined> {
    const result = await this.pool.query<{ minecraft_id: string }>(SQL`
      SELECT minecraft_id FROM linked_members 
      WHERE discord_id = ${discordId} AND guild_id = ${guildId} 
      AND minecraft_id IS NOT NULL
    `)
    return result.rows.at(0)?.minecraft_id
  }

  async getDiscord(guildId: string, minecraftId: string): Promise<string | undefined> {
    const result = await this.pool.query<{ discord_id: string }>(SQL`
      SELECT discord_id FROM linked_members 
      WHERE minecraft_id = ${minecraftId} AND guild_id = ${guildId}
    `)
    return result.rows.at(0)?.discord_id
  }

  async getStatus(guildId: string, discordId: string): Promise<Status> {
    const result = await this.pool.query<{ linked: boolean }>(SQL`
      SELECT minecraft_id IS NOT NULL AS linked FROM linked_members
      WHERE discord_id = ${discordId} AND guild_id = ${guildId}
    `).then(result => result.rows.at(0))
    return result
      ? { verified: true, linked: result.linked } 
      : { verified: false, linked: false }
  }

  async link(guildId: string, discordId: string, minecraftId?: string) {
    await this.pool.transaction(async client => {
      if (minecraftId) {
        const linkedDiscordId = await client.query<{ discord_id: string }>(SQL`
          SELECT discord_id FROM linked_members 
          WHERE minecraft_id = ${minecraftId} AND guild_id = ${guildId}
        `).then(result => result.rows.at(0)?.discord_id)
        if (linkedDiscordId) {
          if (discordId != linkedDiscordId) {
            throw new Error(`Already linked to ${linkedDiscordId}!`)
          } else {
            throw new Error(`Already linked.`)
          }
        }
      }
      await client.query(SQL`
        INSERT INTO linked_members (guild_id, discord_id, minecraft_id) 
        VALUES (${guildId}, ${discordId}, ${minecraftId})
        ON CONFLICT ON CONSTRAINT unique_discord
        DO UPDATE SET minecraft_id = excluded.minecraft_id
      `)
    })    
  }

  async unlink(guildId: string, discordId: string) {
    await this.pool.query(SQL`
      DELETE FROM linked_members WHERE guild_id = ${guildId} AND discord_id = ${discordId}
    `)
  }
}
