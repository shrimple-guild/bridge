import { Client, Events, Guild, GuildMember, PermissionFlagsBits } from "discord.js"
import { HypixelAPI } from "../api/HypixelAPI.js"
import { Database } from "../database/database.js"
import { SlashCommandManager } from "../discord/commands/SlashCommandManager.js"
import { ManualVerifyCommand } from "./commands/ManualVerifyCommand.js"
import { SyncCommand } from "./commands/SyncCommand.js"
import { UnlinkCommand } from "./commands/UnlinkCommand.js"
import { LinkCommand } from "./commands/LinkCommand.js"
import { SetLinkChannelCommand } from "./commands/SetLinkChannelCommand.js"
import { LinkService } from "./LinkService.js"
import { VerificationService } from "./VerificationService.js"
import { InteractionRegistry } from "../discord/interactions/InteractionRegistry.js"
import { LinkButtonHandler } from "./interactions/LinkButtonHandler.js"
import { LinkModalHandler } from "./interactions/LinkModalHandler.js"

type VerificationConfig = {
  unverifiedRole: string,
  verifiedRole: string,
}

export class Verification {
  private linkService: LinkService;
  private verificationService: VerificationService;

  constructor(
    client: Client<true>,
    db: Database,
    private config: VerificationConfig,
    hypixelAPI: HypixelAPI,
    slashCommandManager: SlashCommandManager,
    interactionRegistry: InteractionRegistry
  ) {

    this.verificationService = new VerificationService(db);
    this.linkService = new LinkService(db);

    slashCommandManager.register(
      new ManualVerifyCommand(this, hypixelAPI),
      new UnlinkCommand(this),
      new SyncCommand(this),
      new LinkCommand(this, hypixelAPI),
      new SetLinkChannelCommand(this)
    )

    interactionRegistry.register(
      new LinkButtonHandler(),
      new LinkModalHandler(this, hypixelAPI),
    )

    client.on(Events.GuildMemberAdd, member => this.sync(member))
  }

  getMinecraft(guild: Guild, discordId: string) {
    return this.linkService.getMinecraftUuid(discordId)
  }

  getDiscord(guild: Guild, minecraftId: string) {
    return this.linkService.getDiscordId(minecraftId)
  }

  isVerified(member: GuildMember) {
    return this.linkService.isLinked(member.user.id) || this.verificationService.isVerified(member.guild.id, member.user.id)
  }

  async sync(member: GuildMember) {
    if (member.user.bot) {
      await member.roles.set(this.nonVerificationRoles(member))
    } else if (this.isVerified(member)) {
      await this.setVerifiedRole(member)
    } else {
      await this.setUnverifiedRole(member)
    }
  }

  async verify(member: GuildMember) {
    const didVerify = this.verificationService.verifyMember(member.guild.id, member.user.id)
    return didVerify
  }

  async unlink(member: GuildMember) {
    return this.linkService.unlinkMember(member.user.id);
  }

  async link(member: GuildMember, uuid: string) {
    const currentlyLinkedTo = this.linkService.getMinecraftUuid(member.user.id)

    if (currentlyLinkedTo == uuid || this.linkService.linkMember(member.user.id, uuid)) {
      await this.setVerifiedRole(member)
      return true;
    } else {
      throw new Error("This Minecraft account is already linked to another Discord account. Please unlink the other account.")
    }
  }

  async unverify(guild: Guild, member: GuildMember | string) {
    const memberId = (member instanceof GuildMember) ? member.user.id : member
    this.verificationService.unverifyMember(guild.id, memberId)
    this.linkService.unlinkMember(memberId)
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


