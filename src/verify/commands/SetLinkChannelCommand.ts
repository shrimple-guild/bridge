import { ButtonStyle, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { statusEmbed } from "../../utils/discordUtils.js";
import { Verification } from "../Verification.js";
import { SlashCommand } from "../../discord/commands/SlashCommand.js";
import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";

export class SetLinkChannelCommand implements SlashCommand {
  data = new SlashCommandBuilder()
    .setName("setlinkchannel")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .setDescription("Sets this channel to a link channel, creating a link embed.")

  constructor(private verification?: Verification) { }

  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    try {
      await interaction.deferReply({ ephemeral: true })
      if (!this.verification) throw new Error("Improper configuration! Please report this to staff.")
      const embed = new EmbedBuilder()
        .setTitle("Link to Hypixel")
        .setDescription(`
Welcome! To gain access to all channels, please click the button below and enter your Minecraft IGN after linking your Minecraft account on Hypixel.

If your account is not linked on Hypixel:
1. Join the Hypixel minecraft server.
2. Run "/profile" in a lobby.
3. Click the "Social Media" button in the GUI.
4. Click "Discord"
5. Type in your discord tag (small text in your profile).

Alternatively, you can use the "/discord" command on the Hypixel server and link through their website.

If you are having issues **and** have attempted the steps listed above, please contact staff and we can manually verify you. Thanks!

*Remember, we will never require you to link your Microsoft account or request your Minecraft account information. Do not enter this kind of information anywhere!*
`)
        .setColor("DarkBlue")
        
      const linkButton = new ButtonBuilder().setCustomId("button:link-mc-discord").setLabel("Link").setStyle(ButtonStyle.Primary)
      const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(linkButton)
        
      await interaction.channel?.send({ embeds: [embed], components: [buttonRow]})?.catch(e => console.error(e))
      await interaction.followUp({ embeds: [statusEmbed("success", "Sent embed!")] }).catch(e => console.error(e))
    } catch (e) {
      if (e instanceof Error) {
        await interaction.followUp({ embeds: [statusEmbed("failure", `${e.message}`)] })
      }
    }
  }
}