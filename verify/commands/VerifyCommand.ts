import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { HypixelAPI } from "../../api/HypixelAPI.js";
import { statusEmbed } from "../../utils/discordUtils.js";
import { fetchUuid } from "../../utils/playerUtils.js";
import { Verification } from "../Verification.js";
import { SlashCommand } from "../../discord/commands/SlashCommand.js";

export class VerifyCommand implements SlashCommand {
  data = new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Verify in this server using a linked Hypixel account.")
    .addStringOption(option => 
      option
        .setRequired(true)
        .setName("username")
        .setDescription("Your Minecraft username")) 

  constructor(private verification?: Verification, private hypixelAPI?: HypixelAPI) {}
  
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    try {
      await interaction.deferReply({ ephemeral: true })
      if (!this.verification || !this.hypixelAPI) throw new Error("Improper configuration! Please report this to staff.")
      const username = interaction.options.getString("username", true)
      const uuid = await fetchUuid(username)
      const player = await this.hypixelAPI.fetchPlayer(uuid)
      if (player.discordTag == null) throw new Error("This Hypixel account isn't linked to any Discord account.")
      if (player.discordTag != interaction.user.tag) throw new Error(`${username} is linked to \`${player.discordTag}\`.`)
      await this.verification.verify(interaction.member, uuid)
      await interaction.followUp({ embeds: [statusEmbed("success", `Verified as \`${username}\`.`)] })
    } catch (e) {
      if (e instanceof Error) {
        await interaction.followUp({ embeds: [statusEmbed("failure", `${e.message}`)] })
      }
    }
  }
}