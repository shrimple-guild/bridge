import { ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from "discord.js"
import { HypixelAPI } from "../../api/HypixelAPI.js"
import { statusEmbed } from "../../utils/discordUtils.js"
import { Verification } from "../Verification.js"
import { SlashCommand } from "../../discord/commands/SlashCommand.js"

export class PlayerLookupCommand implements SlashCommand {
	name = "lookup"

	static data = new SlashCommandBuilder()
		.setName("lookup")
		.setDescription("Look up a linked account.")
		.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("minecraft")
				.setDescription("Look up by Minecraft username")
				.addStringOption((option) =>
					option
						.setName("username")
						.setDescription("Minecraft username")
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("discord")
				.setDescription("Look up by Discord user")
				.addUserOption((option) =>
					option
						.setName("user")
						.setDescription("Discord user")
						.setRequired(true)
				)
		);

	constructor(
		private verification: Verification,
		private hypixelAPI: HypixelAPI
	) {}

	async execute(interaction: ChatInputCommandInteraction<"cached">) {
		try {
			await interaction.deferReply({ ephemeral: true })

			switch (interaction.options.getSubcommand()) {
				case "minecraft":
					await this.lookupMinecraft(interaction)
					break

				case "discord":
					await this.lookupDiscord(interaction)
					break
			}

		} catch (e) {
			if (e instanceof Error) {
				await interaction.followUp({
					embeds: [statusEmbed("failure", e.message)]
				})
			}
		}
	}

	private async lookupMinecraft(interaction: ChatInputCommandInteraction<"cached">) {
		const username = interaction.options.getString("username", true)
		const uuid = await this.hypixelAPI.mojang.fetchUuid(username)
		const discordId = await this.verification.getDiscord(interaction.guild, uuid)
		if (discordId == null) throw new Error(`\`${username}\` is not linked to a Discord account.`)

		await interaction.followUp({
			embeds: [
				statusEmbed(
					"success",
					`Minecraft: \`${username}\`(\'${uuid}\')\nDiscord: <@${discordId}>`
				)
			]
		})
	}

	private async lookupDiscord(interaction: ChatInputCommandInteraction<"cached">) {
		const member = interaction.options.getMember("user")
		if (member == null) throw new Error("Failed to resolve Discord member.")
		const uuid = this.verification.getMinecraft(interaction.guild, member.id)
		if (uuid == null) throw new Error(`${member} is not linked to a Minecraft account.`)

		const username = this.hypixelAPI.mojang.fetchUsername(uuid);
		await interaction.followUp({
			embeds: [
				statusEmbed(
					"success",
					`Minecraft: \`${username}\`(\'${uuid}\')\nDiscord: <@${member.id}>`
				)
			]
		})
	}
}