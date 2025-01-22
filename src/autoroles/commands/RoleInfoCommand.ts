import { ChatInputCommandInteraction } from "discord.js";
import { SlashCommand } from "../../discord/commands/SlashCommand";

export class RoleInfoCommand implements SlashCommand {
    name = "roleinfo"

    async execute(interaction: ChatInputCommandInteraction<"cached">) {

    }
}