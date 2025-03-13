import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder
} from "discord.js"

export interface SlashCommand {
	name: string
	execute: (interaction: ChatInputCommandInteraction<"cached">) => Promise<void>
}
