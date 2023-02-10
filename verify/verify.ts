import { Database, Statement } from "better-sqlite3"

export class Verification {
  private insertUser: Statement
  private deleteUser: Statement
  private selectDiscordId: Statement
  private selectMinecraftId: Statement

  constructor(readonly db: Database) {
    this.insertUser = db.prepare(`
      INSERT INTO Users (discordId, minecraftId) VALUES (:discordId, :minecraftId)
      ON CONFLICT (discordId) DO UPDATE SET minecraftId = excluded.minecraftId
    `)
    this.deleteUser = db.prepare(`DELETE FROM Users WHERE discordId = ?`)
    this.selectDiscordId = db.prepare(`SELECT discordId FROM Users WHERE minecraftId = ?`)
    this.selectMinecraftId = db.prepare(`SELECT minecraftId FROM Users WHERE discordId = ?`)
  }

  getMinecraft(discordId: string) {
    return this.selectMinecraftId.get(discordId)?.minecraftId as string | undefined
  }

  getDiscord(minecraftId: string) {
    return this.selectDiscordId.get(minecraftId)?.discordId as string | undefined
  }

  verify(discordId: string, uuid?: string) {
    try {
      this.insertUser.run({ discordId: discordId, minecraftId: uuid})
    } catch (e) {
      throw new Error("This Minecraft account is already linked to another Discord account. Please unlink the other account.")
    }
  }

  unverify(discordId: string) {
    this.deleteUser.run({ discordId: discordId })
  }
}
  