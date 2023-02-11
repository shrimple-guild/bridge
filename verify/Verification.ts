import { Database, Statement } from "better-sqlite3"
import { GuildMember } from "discord.js"

export class Verification {
  private insertUser: Statement
  private deleteUser: Statement
  private selectDiscordId: Statement
  private selectMinecraftId: Statement  

  constructor(private db: Database, private roles: { unverified: string, verified: string }) {
    this.insertUser = db.prepare(`
      INSERT INTO DiscordMembers (discordId, minecraftId) VALUES (:discordId, :minecraftId)
      ON CONFLICT (discordId) DO UPDATE SET minecraftId = excluded.minecraftId
    `)
    this.deleteUser = db.prepare(`DELETE FROM DiscordMembers WHERE discordId = ?`)
    this.selectDiscordId = db.prepare(`SELECT discordId FROM DiscordMembers WHERE minecraftId = ?`)
    this.selectMinecraftId = db.prepare(`SELECT minecraftId FROM DiscordMembers WHERE discordId = ?`)
  }

  getMinecraft(discordId: string) {
    return this.selectMinecraftId.get(discordId)?.minecraftId as string | undefined
  }

  getDiscord(minecraftId: string) {
    return this.selectDiscordId.get(minecraftId)?.discordId as string | undefined
  }

  async verify(member: GuildMember, uuid?: string) {
    try {
      this.insertUser.run({ discordId: member.id, minecraftId: uuid})
      await this.setVerifiedRole(member)
    } catch (e) {
      throw new Error("This Minecraft account is already linked to another Discord account. Please unlink the other account.")
    }
  }

  async unverify(member: GuildMember | string) {
    const memberId = (member instanceof GuildMember) ? member.id : member
    this.deleteUser.run({ discordId: memberId })
    if (member instanceof GuildMember) {
      await this.setUnverifiedRole(member)
    }
  }

  private nonVerificationRoles(guildMember: GuildMember) {
    const roles = guildMember.roles.cache.map(role => role.id)
    return roles.filter(role => ![this.roles.unverified, this.roles.verified].includes(role))
  }

  private async setVerifiedRole(guildMember: GuildMember, reason?: string) {
    const otherRoles = this.nonVerificationRoles(guildMember)
    await guildMember.roles.set([this.roles.verified, ...otherRoles], reason)
  }
  
  private async setUnverifiedRole(guildMember: GuildMember, reason?: string) {
    const otherRoles = this.nonVerificationRoles(guildMember)
    await guildMember.roles.set([this.roles.unverified, ...otherRoles], reason)
  }
}
  
