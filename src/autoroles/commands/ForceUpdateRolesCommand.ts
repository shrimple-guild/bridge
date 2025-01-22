import { ChatInputCommandInteraction } from "discord.js";
import { SlashCommand } from "../../discord/commands/SlashCommand";

export class ForceUpdateRolesCommand implements SlashCommand {
    name = "forceupdateroles"

    async execute(interaction: ChatInputCommandInteraction<"cached">) {

    }
}