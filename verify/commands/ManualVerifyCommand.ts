import { ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { HypixelAPI } from "../../api/HypixelAPI.js";
import { statusEmbed } from "../../utils/discordUtils.js";
import { fetchUuid } from "../../utils/playerUtils.js";
import { Verification } from "../Verification.js";
import { SlashCommand } from "../../discord/commands/SlashCommand.js";

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
      await interaction.deferReply()
      if (!this.verification || !this.hypixelAPI) throw new Error("Improper configuration! Please report this to staff.")
      const member = interaction.options.getMember("user")
      const username = interaction.options.getString("username", true)
      if (!member) throw new Error("Couldn't find this member! Weird!")
      const uuid = await fetchUuid(username)

      // Check for previous verification on a different account and remove if it exists
      const previousDiscordId = this.verification.getDiscord(interaction.guild, uuid)
      if (previousDiscordId != null) {
        const member = await interaction.guild.members.fetch(previousDiscordId).catch(e => undefined)
        await this.verification.unverify(interaction.guild, member ?? previousDiscordId)
      }
      
      await this.verification.verify(member, uuid)
      await interaction.followUp({ ephemeral: true, embeds: [statusEmbed("success", `Verified \`${member.user.tag}\` as \`${username}\`.`)] })
    } catch (e) {
      if (e instanceof Error) {
        await interaction.followUp({ ephemeral: true, embeds: [statusEmbed("failure", `${e.message}`)] })
      }
      console.error(e)
    }
  }
}