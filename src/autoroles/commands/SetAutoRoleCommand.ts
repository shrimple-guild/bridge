import { ChatInputCommandInteraction } from "discord.js";
import { SlashCommand } from "../../discord/commands/SlashCommand";

export class SetAutoRoleCommand implements SlashCommand {
    name = "setautorolecommand"

    async execute(interaction: ChatInputCommandInteraction<"cached">) {

    }
}