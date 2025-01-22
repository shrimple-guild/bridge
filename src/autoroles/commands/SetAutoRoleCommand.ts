import { ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../discord/commands/SlashCommand";
import { AutoRoles } from "../AutoRoles";

export class SetAutoRoleCommand implements SlashCommand {
    name = "setautorolecommand"

    static data = new SlashCommandBuilder()
		.setName("setautorole")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
		.setDescription("Set a role to be granted automatically when a requirement is met.")
        .addRoleOption((option) => 
            option
                .setRequired(true)
                .setName("role")
                .setDescription("The role to grant when the specified requirement is met.")
        )
		.addStringOption((option) =>
			option
				.setRequired(true)
				.setName("requirement")
				.setDescription("The requirement to grant this role.")
                .setChoices(
                    { name: "Max Fishing Bestiary", value: "max_fishing_bestiary" },
                    { name: "1B Fishing XP ", value: "fishing_xp_1" },
                    { name: "2.5B Fishing XP ", value: "fishing_xp_2" }
                )
		);

    constructor(private manager: AutoRoles) {}

    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        const guildId = interaction.guild.id
        const requirementType = interaction.options.getString("requirement", true)
        const roleId = interaction.options.getRole("role", true).id
        this.manager.setRole(guildId, roleId, requirementType)
    }
}