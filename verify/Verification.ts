import { Database, Statement } from "better-sqlite3"
import { Client, Events, Guild, GuildMember, PermissionFlagsBits } from "discord.js"
import { HypixelAPI } from "../api/HypixelAPI.js"
import { SlashCommandManager } from "../discord/commands/SlashCommandManager.js"
import { ManualVerifyCommand } from "./commands/ManualVerifyCommand.js"
import { SyncCommand } from "./commands/SyncCommand.js"
import { UnverifyCommand } from "./commands/UnverifyCommand.js"
import { VerifyCommand } from "./commands/VerifyCommand.js"
import { VerifyEmbedCommand } from "./commands/VerifyEmbedCommand.js"

type VerificationConfig = {
  unverifiedRole: string,
  verifiedRole: string,
  channelId: string
}

export class Verification {
  private insertUser: Statement
  private deleteUser: Statement
  private selectDiscordId: Statement
  private selectMinecraftId: Statement  

  constructor(
    client: Client<true>,
    db: Database, 
    private config: VerificationConfig,
    hypixelAPI: HypixelAPI,
    slashCommandManager: SlashCommandManager
  ) {
    this.insertUser = db.prepare(`
      INSERT INTO DiscordMembers (guildId, discordId, minecraftId) VALUES (:guildId, :discordId, :minecraftId)
      ON CONFLICT (guildId, discordId) DO UPDATE SET minecraftId = excluded.minecraftId
    `)
    this.deleteUser = db.prepare(`DELETE FROM DiscordMembers WHERE discordId = :discordId AND guildId = :guildId`)
    this.selectDiscordId = db.prepare(`SELECT discordId FROM DiscordMembers WHERE minecraftId = :minecraftId AND guildId = :guildId`)
    this.selectMinecraftId = db.prepare(`SELECT minecraftId FROM DiscordMembers WHERE discordId = :discordId AND guildId = :guildId`)

    slashCommandManager.register( 
      new ManualVerifyCommand(this), 
      new UnverifyCommand(this), 
      new SyncCommand(this),
      new VerifyCommand(this, hypixelAPI),
      new VerifyEmbedCommand(this)
    )

    client.on(Events.GuildMemberAdd, member => this.sync(member))
    client.on(Events.MessageCreate, message => {
      if (message.channelId != this.config.channelId) return
      if (message.member?.permissions?.has(PermissionFlagsBits.Administrator)) return
      message.delete()
    })
  }

  getMinecraft(guild: Guild, discordId: string) {
    return this.selectMinecraftId.get({ guildId: guild.id, discordId: discordId })?.minecraftId as string | undefined
  }

  getDiscord(guild: Guild, minecraftId: string) {
    return this.selectDiscordId.get({ guildId: guild.id, minecraftId: minecraftId })?.discordId as string | undefined
  }

  isVerified(member: GuildMember) {
    return this.getMinecraft(member.guild, member.id) != null
  }

  sync(member: GuildMember) {
    if (member.user.bot) {
      member.roles.set(this.nonVerificationRoles(member))
    } else if (this.isVerified(member)) {
      this.setVerifiedRole(member)
    } else {
      this.setUnverifiedRole(member)
    }
  }

  async verify(member: GuildMember, uuid?: string) {
    try {
      this.insertUser.run({ guildId: member.guild.id, discordId: member.id, minecraftId: uuid})
      await this.setVerifiedRole(member)
    } catch (e) {
      throw new Error("This Minecraft account is already linked to another Discord account. Please unlink the other account.")
    }
  }

  async unverify(guild: Guild, member: GuildMember | string) {
    const memberId = (member instanceof GuildMember) ? member.id : member
    this.deleteUser.run({ guildId: guild.id, discordId: memberId })
    if (member instanceof GuildMember) {
      await this.setUnverifiedRole(member)
    }
  }

  private nonVerificationRoles(guildMember: GuildMember) {
    const roles = guildMember.roles.cache.map(role => role.id)
    return roles.filter(role => ![this.config.unverifiedRole, this.config.verifiedRole].includes(role))
  }

  private async setVerifiedRole(guildMember: GuildMember, reason?: string) {
    const otherRoles = this.nonVerificationRoles(guildMember)
    await guildMember.roles.set([this.config.verifiedRole, ...otherRoles], reason)
  }
  
  private async setUnverifiedRole(guildMember: GuildMember, reason?: string) {
    const otherRoles = this.nonVerificationRoles(guildMember)
    await guildMember.roles.set([this.config.unverifiedRole, ...otherRoles], reason)
  }

  
}
  
