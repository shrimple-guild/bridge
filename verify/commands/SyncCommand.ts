import { ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { statusEmbed } from "../../utils/discordUtils.js";
import { Verification } from "../Verification.js";
import { SlashCommand } from "../../discord/commands/SlashCommand.js";
import { sleep } from "../../utils/utils.js";

export class SyncCommand implements SlashCommand {
  data = new SlashCommandBuilder()
  .setName("sync")
  .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
  .setDescription("Synchronize verifications in the server.")

  constructor(private verification?: Verification) {}
  
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    try {
      await interaction.reply({ ephemeral: true, content: "Synchronization started."})
      const members = await interaction.guild.members.fetch()
      for (const [_, member] of members) {
        await this.verification?.sync(member)
      }
      await interaction.followUp({ embeds: [statusEmbed("success", `Synchronized \`${members.size}\` members.`)] })
    } catch (e) {
      if (e instanceof Error) {
        await interaction.followUp({ embeds: [statusEmbed("failure", `${e.message}`)] })
      }
      console.error(e)
    }
  }
}