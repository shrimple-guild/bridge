import { ChatInputCommandInteraction } from "discord.js";
import { SlashCommand } from "../../discord/commands/SlashCommand";
import { AutoRoles } from "../AutoRoles";

export class UpdateRolesCommand implements SlashCommand {
    name = "updateroles"

    constructor(private manager: AutoRoles) {}

    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        
    }
}