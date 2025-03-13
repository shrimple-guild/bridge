import { ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from "discord.js"
import { Verification } from "../Verification.js"
import { SlashCommand } from "../../discord/commands/SlashCommand.js"
import { statusEmbed } from "../../utils/discordUtils.js"

export class SetVerificationRolesCommand implements SlashCommand {
	name = "setverificationroles"

	static data = new SlashCommandBuilder()
		.setName("setverificationroles")
		.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
		.setDescription("Manually verify and optionally link someone in the server.")
		.addRoleOption((option) =>
			option
				.setRequired(true)
				.setName("unverified")
				.setDescription("The unverified member role.")
		)
		.addRoleOption((option) =>
			option.setRequired(true).setName("verified").setDescription("The verified member role.")
		)

	constructor(private verification: Verification) {}

	async execute(interaction: ChatInputCommandInteraction<"cached">) {
		const unverifiedRole = interaction.options.getRole("unverified", true)
		const verifiedRole = interaction.options.getRole("verified", true)
		this.verification.setVerificationRoles(
			interaction.guild.id,
			unverifiedRole.id,
			verifiedRole.id
		)
		await interaction.reply({
			embeds: [statusEmbed("success", "Set verification roles successfully.")]
		})
	}
}
