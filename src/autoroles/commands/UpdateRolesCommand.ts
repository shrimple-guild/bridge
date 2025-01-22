import { ChatInputCommandInteraction } from "discord.js";
import { SlashCommand } from "../../discord/commands/SlashCommand";

export class UpdateRolesCommand implements SlashCommand {
    name = "updateroles"

    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        
    }
}