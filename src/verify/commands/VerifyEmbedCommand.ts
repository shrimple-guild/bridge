import { AttachmentBuilder, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { statusEmbed } from "../../utils/discordUtils.js";
import { Verification } from "../Verification.js";
import { SlashCommand } from "../../discord/commands/SlashCommand.js";

export class VerifyEmbedCommand implements SlashCommand {
  data = new SlashCommandBuilder()
    .setName("verifyembed")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .setDescription("Create an informational embed for a verification channel.")

  constructor(private verification?: Verification) { }

  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    try {
      await interaction.deferReply({ ephemeral: true })
      if (!this.verification) throw new Error("Improper configuration! Please report this to staff.")
      const file = new AttachmentBuilder("./assets/verificationTutorial.mp4", { name: "attachment.mp4" })
      const embed = new EmbedBuilder()
        .setTitle("Verification")
        .setDescription(`
Welcome! To gain access to all channels, please use **/verify [IGN]** in this channel after linking your Minecraft account on Hypixel.

If your account is not linked on Hypixel:
1. Join the Hypixel minecraft server.
2. Run "/profile" in a lobby.
3. Click the "Social Media" button in the GUI.
4. Click "Discord"
5. Type in your discord tag (small text in your profile).

Alternatively, you can use the "/discord" command on the Hypixel server and link through their website.

If you are having issues with **/verify [IGN]** and have attempted to link your account on Hypixel, feel free to contact staff and we can manually verify you. Thanks!

*Remember, this server will never require you to link your Microsoft account or request your Minecraft account information. Do not enter your information if you see this!*
`)
        .setColor("DarkBlue")
      await interaction.channel?.send({ embeds: [embed] })?.catch(e => console.error(e))
      await interaction.followUp({ embeds: [statusEmbed("success", "Sent embed!")] }).catch(e => console.error(e))
    } catch (e) {
      if (e instanceof Error) {
        await interaction.followUp({ embeds: [statusEmbed("failure", `${e.message}`)] })
      }
    }
  }
}