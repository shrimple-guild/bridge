import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../discord/commands/SlashCommand";
import { Achievements } from "../Achievements";
import { simpleEmbed, statusEmbed } from "../../utils/discordUtils";

export class AchievementsCommand implements SlashCommand {
    name = "achievements"

    static data = new SlashCommandBuilder()
		.setName("achievements")
		.setDescription("View or update achievement roles.")
        .addSubcommand(builder => (
            builder
                .setName("info")
                .setDescription("View the available achievement roles on this server.")
        ))
        .addSubcommand(builder => (
            builder
                .setName("update")
                .setDescription("Update your achievement roles using your linked Minecraft account.")
        ))

    constructor(private manager: Achievements) {}

    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        const subcommand = interaction.options.getSubcommand()
        if (subcommand == "info") {
            await this.doInfo(interaction)
        } else if (subcommand == "update") {
            await this.doUpdate(interaction)
        }
    }

    private async doInfo(interaction: ChatInputCommandInteraction<"cached">) {
        const activeRoles = this.manager.getAchievements(interaction.guildId)
        const roleData = activeRoles.map(role => {
            return `- **${role.name}** - <@&${role.roleId}>`
        }).join("\n")
        const roleInfo = `Achievement roles available:\n\n${roleData}`
        await interaction.reply({
            embeds: [simpleEmbed("Achievement roles", roleInfo)],
            ephemeral: true
        })
    }

    private async doUpdate(interaction: ChatInputCommandInteraction<"cached">) {
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
            console.error(e)
            return
        }
        const roleData = newAchievementRoles.map(role => `<@&${role}>`).join(", ")
        let roleMessage = roleData.length > 0 
            ? `Successfully updated! You now have the following achievement roles: ${roleData}` 
            : "Updated, but no roles to give. Check **/roleinfo** for available roles."
        await interaction.reply({
            embeds: [simpleEmbed("Updated roles", roleMessage)],
            ephemeral: true
        })
    }
}