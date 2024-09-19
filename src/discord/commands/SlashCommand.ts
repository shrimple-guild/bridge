import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "discord.js";

export interface SlashCommand {
  data: Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand"> | SlashCommandOptionsOnlyBuilder,
  execute: (interaction: ChatInputCommandInteraction<"cached">) => Promise<void>
}
