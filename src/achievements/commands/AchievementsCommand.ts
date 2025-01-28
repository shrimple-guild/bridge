import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../discord/commands/SlashCommand.js";
import { Achievements, RoleChanges } from "../Achievements.js";
import { simpleEmbed, statusEmbed } from "../../utils/discordUtils.js";

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
            ephemeral: false
        })
    }

    private async doUpdate(interaction: ChatInputCommandInteraction<"cached">) {
        let roleData: RoleChanges
        try {
            roleData = await this.manager.updateRoles(interaction.member)
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

        if (!roleData.changed) {
            await interaction.reply({
                embeds: [simpleEmbed("Updated roles", "No changes were made. Use **/achievements info** to view all achievement roles.")],
                ephemeral: true
            })
        } 

        let roleMessage = "Successfully updated your roles!"
        if (roleData.added.length > 0) {
            roleMessage += "\n\n**Added:**\n"
            roleMessage += roleData.added.map(role => `* <@&${role}>`).join("\n")
        }
        if (roleData.removed.length > 0) {
            roleMessage += "\n\n**Removed:**\n"
            roleMessage += roleData.removed.map(role => `* <@&${role}>`).join("\n")
        }

        await interaction.reply({
            embeds: [simpleEmbed("Updated roles", roleMessage)],
            ephemeral: false
        })
    }
}