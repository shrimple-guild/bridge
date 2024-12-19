import { ButtonInteraction, CacheType, GuildMember, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js";
import { IInteractionHandler } from "../../discord/interactions/IInteractionHandler";
import { ActionRowBuilder, ModalBuilder } from "@discordjs/builders";
import { statusEmbed } from "../../utils/discordUtils";
import { Verification } from "../Verification";
import { HypixelAPI } from "../../api/HypixelAPI";

export class LinkModalHandler implements IInteractionHandler<ModalSubmitInteraction> {

  constructor(private verification?: Verification, private hypixelAPI?: HypixelAPI) { }

  getCustomId(): string {
    return "modal:link-mc-discord"
  }

  // TODO: merge shared logic with verify command
  async handle(interaction: ModalSubmitInteraction<CacheType>): Promise<void> {
    await interaction.deferReply({ephemeral: true})
    if (!this.verification || !this.hypixelAPI) throw new Error("Improper configuration! Please report this to staff.")

    const username = interaction.fields.getTextInputValue("text:mc-ign")
    const uuid = await this.hypixelAPI.mojang.fetchUuid(username)
    const player = await this.hypixelAPI.fetchPlayer(uuid)
    const discordTag = (interaction.user.discriminator == "0" ? interaction.user.username : interaction.user.tag).toLowerCase()
    if (player.discordTag == null) throw new Error("This Hypixel account isn't linked to any Discord account.")
    if (player.discordTag.toLowerCase() != discordTag) {
      let errorString = `${username} is linked to \`${player.discordTag}\`.`
      if (interaction.user.discriminator == "0") errorString += `**Due to the Discord username update, you may need to update your linked Discord username in-game.**`
      throw new Error(errorString)
    }
    if (interaction.member instanceof GuildMember) {
      await this.verification.link(interaction.member, uuid)
      await interaction.followUp({ ephemeral: true, embeds: [statusEmbed("success", `Verified as \`${username}\`.`)] })
    } else {
      await interaction.followUp({ ephemeral: true, embeds: [statusEmbed("failure", `Not a guild member? Weird (please report this)!`)] })
    }
  }
}