import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { HypixelAPI } from "../../api/HypixelAPI.js";
import { statusEmbed } from "../../utils/discordUtils.js";
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
      const uuid = await this.hypixelAPI.mojang.fetchUuid(username)
      const player = await this.hypixelAPI.fetchPlayer(uuid)
      const discordTag = (interaction.user.discriminator == "0" ? interaction.user.username : interaction.user.tag).toLowerCase()
      if (player.discordTag == null) throw new Error("This Hypixel account isn't linked to any Discord account.")
      if (player.discordTag.toLowerCase() != discordTag) {
        let errorString = `${username} is linked to \`${player.discordTag}\`.`
        if (interaction.user.discriminator == "0") errorString += `**Due to the Discord username update, you may need to update your linked Discord username in-game.**`
        throw new Error(errorString)
      }
      await this.verification.link(interaction.member, uuid)
      await interaction.followUp({ embeds: [statusEmbed("success", `Verified as \`${username}\`.`)] })
    } catch (e) {
      if (e instanceof Error) {
        await interaction.followUp({ embeds: [statusEmbed("failure", `${e.message}`)] })
      }
    }
  }
}