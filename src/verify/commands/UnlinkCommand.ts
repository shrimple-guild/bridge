import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { HypixelAPI } from "../../api/HypixelAPI.js";
import { statusEmbed } from "../../utils/discordUtils.js";
import { Verification } from "../Verification.js";
import { SlashCommand } from "../../discord/commands/SlashCommand.js";

export class UnlinkCommand implements SlashCommand {
  data = new SlashCommandBuilder()
    .setName("unlink")
    .setDescription("Remove the linked Minecraft account in this server.")

  constructor(private verification?: Verification) {}
  
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    try {
      await interaction.deferReply({ ephemeral: true })
      if (!this.verification) throw new Error("Improper configuration! Please report this to staff.")
      await this.verification.unlink(interaction.member)
      await interaction.followUp({ embeds: [statusEmbed("success", `Unverified.`)] })
    } catch (e) {
      if (e instanceof Error) {
        await interaction.followUp({ embeds: [statusEmbed("failure", `${e.message}`)] })
      }
    }
  }
}