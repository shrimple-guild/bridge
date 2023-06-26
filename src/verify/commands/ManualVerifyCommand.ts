import { ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { statusEmbed } from "../../utils/discordUtils.js";
import { Verification } from "../Verification.js";
import { SlashCommand } from "../../discord/commands/SlashCommand.js";
import { HypixelAPI } from "../../api/HypixelAPI.js";

export class ManualVerifyCommand implements SlashCommand {
  data = new SlashCommandBuilder()
  .setName("manualverify")
  .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
  .setDescription("Manually verify someone in the server.")
  .addUserOption(option => 
    option
      .setRequired(true)
      .setName("user")
      .setDescription("The Discord user to verify."))
  .addStringOption(option => 
    option
      .setRequired(false)
      .setName("username")
      .setDescription("The Minecraft username of the user"))

  constructor(private verification?: Verification, private hypixelAPI?: HypixelAPI) {}
  
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    try {
      await interaction.deferReply({ ephemeral: true })
      if (!this.verification || !this.hypixelAPI) throw new Error("Improper configuration! Please report this to staff.")
      const member = interaction.options.getMember("user")
      const username = interaction.options.getString("username", false)
      if (!member) throw new Error("Couldn't find this member! Weird!")
      if (username == null) {
        await this.verification.verify(member, undefined)
        await interaction.followUp({ embeds: [statusEmbed("success", `Verified \`${member.user.tag}\` without a Minecraft account.`)] })
        return
      }
      const uuid = await this.hypixelAPI.mojang.fetchUuid(username)
      
      // Check for previous verification on a different account and remove if it exists
      const previousDiscordId = this.verification.getDiscord(interaction.guild, uuid)
      if (previousDiscordId != null) {
        const member = await interaction.guild.members.fetch(previousDiscordId).catch(e => undefined)
        await this.verification.unverify(interaction.guild, member ?? previousDiscordId)
      }
      
      await this.verification.verify(member, uuid)
      await interaction.followUp({ embeds: [statusEmbed("success", `Verified \`${member.user.tag}\` as \`${username}\`.`)] })
    } catch (e) {
      if (e instanceof Error) {
        await interaction.followUp({ embeds: [statusEmbed("failure", `${e.message}`)] })
      }
      console.error(e)
    }
  }
}