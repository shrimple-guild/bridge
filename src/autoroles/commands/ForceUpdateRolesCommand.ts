import { ChatInputCommandInteraction } from "discord.js";
import { SlashCommand } from "../../discord/commands/SlashCommand";
import { AutoRoles } from "../AutoRoles";

export class ForceUpdateRolesCommand implements SlashCommand {
    name = "forceupdateroles"

    constructor(private manager: AutoRoles) {}
    
    async execute(interaction: ChatInputCommandInteraction<"cached">) {

    }
}