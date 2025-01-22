import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../discord/commands/SlashCommand";
import { simpleEmbed } from "../../utils/discordUtils";
import { AutoRoles } from "../AutoRoles";

export class RoleInfoCommand implements SlashCommand {
    name = "roleinfo"

    static data = new SlashCommandBuilder()
		.setName("roleinfo")
		.setDescription("View the available achievement roles on this server.")

    constructor(private manager: AutoRoles) {}

    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        const activeRoles = this.manager.getRoles(interaction.guildId)
        const roleData = activeRoles.map(role => {
            return `- **${role.name}** - <@&${role.name}>`
        }).join("\n")
        const roleInfo = `Achievement roles available:\n\n${roleData}`
        await interaction.reply({
            embeds: [simpleEmbed("Achievement roles", roleInfo)],
            ephemeral: true
        })
    }
}