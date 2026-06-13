import { MessageSource } from "../../utils/utils.js"
import { Pattern } from "./Pattern"

export const guildJoin: Pattern = {
	name: "guildJoin",
	pattern: /^\[(?<rank>[\w+]+)\] (?<name>\w{2,16}) joined the guild!$/,
	execute: async (bot, groups) => {
		await bot.sendToBridge(MessageSource.Guild, groups.name, `**joined the guild!**`, "JOINED")
	}
}
