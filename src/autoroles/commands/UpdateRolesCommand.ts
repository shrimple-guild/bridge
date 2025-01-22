import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../discord/commands/SlashCommand";
import { AutoRoles } from "../AutoRoles";
import { simpleEmbed, statusEmbed } from "../../utils/discordUtils";

export class UpdateRolesCommand implements SlashCommand {
    name = "updateroles"

    static data = new SlashCommandBuilder()
		.setName("updateroles")
		.setDescription("Update your achievement roles.")

    constructor(private manager: AutoRoles) {}

    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        let newAchievementRoles: string[]
        try {
            newAchievementRoles = await this.manager.updateRoles(interaction.member)
        } catch (e) {
            if (e instanceof Error) {
                await interaction.reply({
                    embeds: [statusEmbed("failure", `Couldn't update roles. Error: ${e.message}`)],
                    ephemeral: true
                })
            }
            return
        }
        const roleData = newAchievementRoles.map(role => `<@&${role}>`).join(", ")
        const roleMessage = `Successfully updated! You now have the following achievement roles: ${roleData}`
        await interaction.reply({
            embeds: [simpleEmbed("Updated roles", roleMessage)],
            ephemeral: true
        })
    }
}