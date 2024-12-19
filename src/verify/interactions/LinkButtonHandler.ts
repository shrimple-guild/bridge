import { ButtonInteraction, CacheType, GuildMember, TextInputBuilder, TextInputStyle } from "discord.js";
import { IInteractionHandler } from "../../discord/interactions/IInteractionHandler";
import { ActionRowBuilder, ModalBuilder } from "@discordjs/builders";
import { statusEmbed } from "../../utils/discordUtils";
import { Verification } from "../Verification";
import { HypixelAPI } from "../../api/HypixelAPI";

export class LinkButtonHandler implements IInteractionHandler<ButtonInteraction> {


  getCustomId(): string {
    return "button:link-mc-discord"
  }

  // TODO: merge shared logic with verify command
  async handle(interaction: ButtonInteraction<CacheType>): Promise<void> {
    const minecraftIgnInput = new TextInputBuilder()
      .setCustomId("text:mc-ign")
      .setLabel("What's your Minecraft IGN?")
      .setStyle(TextInputStyle.Short);

    const modal = new ModalBuilder()
      .setCustomId("modal:link-mc-discord")
      .setTitle("Link your Minecraft account!")
      .addComponents(new ActionRowBuilder<TextInputBuilder>().setComponents(minecraftIgnInput))
    
    await interaction.showModal(modal);
  }
}