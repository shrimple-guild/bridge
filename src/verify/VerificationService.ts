import Database from "better-sqlite3";
import { IDatabase } from "../database/IDatabase.js";

export class VerificationService {

  private db: IDatabase;
  
  constructor(db: IDatabase) {
    this.db = db
  }

  verifyMember(guildId: string, discordId: string): boolean {
    const stmt = this.db.prepare(`INSERT OR IGNORE INTO verified_members (guild_id, discord_id) VALUES (?, ?)`);
    const result = stmt.run(guildId, discordId);
    return result.changes > 0;
  }

  unverifyMember(guildId: string, discordId: string): boolean {
    const stmt = this.db.prepare(`DELETE FROM verified_members WHERE guild_id = ? AND discord_id = ?`);
    const result = stmt.run(guildId, discordId);
    return result.changes > 0;
  }

  isVerified(guildId: string, discordId: string): boolean {
    const stmt = this.db.prepare(`SELECT 1 FROM verified_members WHERE guild_id = ? AND discord_id = ?`);
    const result = stmt.get(guildId, discordId);
    return result != null;
  }
}