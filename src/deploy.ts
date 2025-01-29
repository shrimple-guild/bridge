import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import { config } from "./utils/config.js"
import { ManualVerifyCommand } from "./verify/commands/ManualVerifyCommand.js";
import { SyncCommand } from "./verify/commands/SyncCommand.js";
import { UnlinkCommand } from "./verify/commands/UnlinkCommand.js";
import { LinkCommand } from "./verify/commands/LinkCommand.js";
import { SetLinkChannelCommand } from "./verify/commands/SetLinkChannelCommand.js";
import { GuildReqsCommand } from "./discord/commands/GuildReqsCommand.js";
import { SetVerificationRolesCommand } from "./verify/commands/SetVerificationRolesCommand.js";
import { AchievementSettingsCommand } from "./achievements/commands/AchievementSettingsCommand.js";
import { AchievementsCommand } from "./achievements/commands/AchievementsCommand.js";

type Command = {
	toJSON: () => RESTPostAPIChatInputApplicationCommandsJSONBody
}

const slashCommands: Command[] = [
	ManualVerifyCommand.data,
	LinkCommand.data,
	UnlinkCommand.data,
	SyncCommand.data,
	SetLinkChannelCommand.data,
	GuildReqsCommand.data,
  	SetVerificationRolesCommand.data,
];

if (config.achievementRoles) {
	slashCommands.push(AchievementSettingsCommand.data, AchievementsCommand.data,)
}

await loadCommands(
	slashCommands,
	config.discord.token,
	config.discord.client,
	config.discord.guild
);

async function loadCommands(
	commands: Command[],
	token: string,
	clientId: string,
	guildId: string
) {
	const commandJsonData = commands.map((command) => command.toJSON());
	const rest = new REST({ version: "10" }).setToken(token);
	try {
		console.log(
			`Started refreshing ${commandJsonData.length} application (/) commands.`
		);
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commandJsonData }
		);
		console.log(
			`Successfully reloaded ${(data as any).length} application (/) commands.`
		);
	} catch (error) {
		console.error(error);
	}
}
