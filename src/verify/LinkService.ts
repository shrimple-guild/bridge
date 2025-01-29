import Database from "better-sqlite3";
import { IDatabase } from "../database/IDatabase.js";

export class LinkService {

  private db: IDatabase

  constructor(db: IDatabase) {
    this.db = db
  }

  /**
   * Links a Discord member to a Minecraft account.
   * 
   * If a member is already linked to the provided Minecraft ID or Discord ID, the operation will not be successful.
   * 
   * @param {string} discordId - The Discord ID of the member to be linked
   * @param {string} minecraftId - The Minecraft ID (UUID) to be linked to the Discord member
   * @returns `true` if the member was successfully linked
   */
  linkMember(discordId: string, minecraftId: string): boolean {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO linked_members (discord_id, minecraft_id) VALUES (?, ?)
    `);
    const result = stmt.run(discordId, minecraftId);
    return result.changes > 0;
  }

  /**
   * Unlinks a Discord member from a Minecraft account.
   * 
   * @param {string} discordId - the Discord ID of the member to be unlinke
   * @returns `true` if the member was successfully unlinked, `false` if no such link exists.
   */
  unlinkMember(discordId: string): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM linked_members WHERE discord_id = ? 
    `);
    const result = stmt.run(discordId);
    return result.changes > 0;
  }

  /**
   * Retrieves the Minecraft UUID associated with a Discord member.
   * 
   * @param {string} discordId - the Discord ID of the member
   * @returns the Minecraft UUID associated with the provided Discord ID, or `null` if no link exists
   */
  getMinecraftUuid(discordId: string): string | null {
    const stmt = this.db.prepare <[string], LinkedMemberRow>(`
      SELECT discord_id, minecraft_id FROM linked_members WHERE discord_id = ?
    `);

    const row = stmt.get(discordId);
    return row ? row.minecraft_id : null;
  }

  /**
   * Returns if the Discord member represented by the specified ID is linked to a Minecraft account.
   * 
   * @param {string} discordId - the Discord ID of the member
   * @returns true if the discordId is linked to a member
   */
  isLinked(discordId: string): boolean {
    return this.getMinecraftUuid(discordId) != null
  }

  /**
   * Retrieves the Discord ID associated with a Minecraft account.
   * 
   * @param {string} minecraftId - The Minecraft UUID of the player
   * @returns the Discord ID associated with the provided Minecraft UUID, or `null` if no link exists
   */
  getDiscordId(minecraftId: string): string | null {
    const stmt = this.db.prepare<[string], LinkedMemberRow>(`
      SELECT discord_id, minecraft_id FROM linked_members
      WHERE minecraft_id = ?
    `);

    const row = stmt.get(minecraftId);
    return row ? row.discord_id : null;

  }
  
}

type LinkedMemberRow = {
  discord_id: string
  minecraft_id: string
}