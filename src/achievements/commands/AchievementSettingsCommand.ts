import { ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../discord/commands/SlashCommand";
import { statusEmbed } from "../../utils/discordUtils";
import { AchievementsData } from "../AutoRoleData";
import { Achievements } from "../Achievements";

export class AchievementSettingsCommand implements SlashCommand {
    name = "achievementsettings"

    static data = new SlashCommandBuilder()
		.setName("achievementsettings")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
		.setDescription("Set a role to be granted automatically when a requirement is met.")
        .addSubcommand(builder => (
            builder
                .setName("set")
                .setDescription("Update or add an achievement role")
                .addRoleOption((option) => 
                    option
                        .setRequired(true)
                        .setName("role")
                        .setDescription("The role to grant when the specified requirement is met.")
                )
                .addStringOption((option) =>
                    option
                        .setRequired(true)
                        .setName("requirement")
                        .setDescription("The requirement to grant this role.")
                        .setChoices(AchievementsData.achievementNames)
                )
        )).addSubcommand(builder => (
            builder
                .setName("delete")
                .setDescription("Delete an achievement role.")
                .addStringOption((option) =>
                    option
                        .setRequired(true)
                        .setName("requirement")
                        .setDescription("The requirement to grant this role.")
                        .setChoices(AchievementsData.achievementNames)
                )
        ))

    constructor(private manager: Achievements) {}

    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        const subcommand = interaction.options.getSubcommand()
        if (subcommand == "set") {
            await this.doSet(interaction)
        } else if (subcommand == "delete") {
            await this.doDelete(interaction)
        }
    }

    private async doSet(interaction: ChatInputCommandInteraction<"cached">) {
        const guildId = interaction.guild.id
        const requirementType = interaction.options.getString("requirement", true)
        const roleId = interaction.options.getRole("role", true).id
        this.manager.addOrUpdateAchievement(guildId, roleId, requirementType)
        const requirementName = Achievements.getAchievementName(requirementType)
        await interaction.reply({
            embeds: [statusEmbed("success", `Set role <@&${roleId}> with requirement **${requirementName}**.`)],
            ephemeral: true
        })
    }

    private async doDelete(interaction: ChatInputCommandInteraction<"cached">) {
        const guildId = interaction.guild.id
        const requirementType = interaction.options.getString("requirement", true)
        this.manager.deleteAchievement(guildId, requirementType)
        const requirementName = Achievements.getAchievementName(requirementType)
        await interaction.reply({
            embeds: [statusEmbed("success", `Removed achievement **${requirementName}**.`)],
            ephemeral: true
        })
    }
}