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
import { SetVerificationRolesCommand } from "./commands/SetVerificationRolesCommand.js"

export class Verification {
  private linkService: LinkService;
  private verificationService: VerificationService;

  constructor(
    client: Client<true>,
    db: Database,
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
      new SetLinkChannelCommand(this),
      new SetVerificationRolesCommand(this)
    )

    interactionRegistry.register(
      new LinkButtonHandler(),
      new LinkModalHandler(this, hypixelAPI),
    )

    client.on(Events.GuildMemberAdd, member => this.sync(member))
  }

  getMinecraft(guild: Guild, discordId: string): string | null {
    return this.linkService.getMinecraftUuid(discordId)
  }

  getDiscord(guild: Guild, minecraftId: string): string | null {
    return this.linkService.getDiscordId(minecraftId)
  }

  isVerified(member: GuildMember): boolean {
    return this.linkService.isLinked(member.user.id) || this.verificationService.isVerified(member.guild.id, member.user.id)
  }

  setVerificationRoles(guildId: string, unverified: string, verified: string ) {
    this.verificationService.setVerificationRoles(guildId, unverified, verified)
  }

  async sync(member: GuildMember) {
    await this.verificationService.sync(member)
  }

  async verify(member: GuildMember): Promise<boolean> {
    const didVerify = this.verificationService.verifyMember(member.guild.id, member.user.id)
    await this.verificationService.setVerifiedRole(member, "manual")
    return didVerify
  }

  async unlink(member: GuildMember): Promise<boolean> {
    const didUnlink = this.linkService.unlinkMember(member.user.id);
    await this.verificationService.sync(member)
    return didUnlink
  }

  async link(member: GuildMember, uuid: string): Promise<boolean> {
    const currentlyLinkedTo = this.linkService.getMinecraftUuid(member.user.id)

    if (currentlyLinkedTo == uuid || this.linkService.linkMember(member.user.id, uuid)) {
      await this.verificationService.setVerifiedRole(member)
      return true;
    } else {
      throw new Error("This Minecraft account is already linked to another Discord account. Please unlink the other account.")
    }
  }

  async unverify(guild: Guild, member: GuildMember | string): Promise<boolean> {
    const memberId = (member instanceof GuildMember) ? member.user.id : member
    const didUnverify = this.verificationService.unverifyMember(guild.id, memberId)
    this.linkService.unlinkMember(memberId)
    if (member instanceof GuildMember) {
      await this.verificationService.setUnverifiedRole(member)
    }
    return didUnverify
  }
}


