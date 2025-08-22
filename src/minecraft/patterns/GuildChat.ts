import { MessageSource } from "../../utils/utils"
import { Pattern } from "./Pattern"

export const guildChat: Pattern = {
	name: "guildChat",
	pattern:
		/^(?<source>Guild|Officer) > (?:\[(?<hypixelRank>[\w+]+)\] )?(?<username>\w{2,16})(?: \[(?<guildRank>[\w+]+)\])?: (?<content>.+)$/,
	execute: async (bot, groups) => {
		if (groups.username === bot.username) {
			if (!groups.content.startsWith("Pong!")) return
		}
		const messageSource = groups.source === "Guild" ? MessageSource.Guild : MessageSource.Staff
		await bot.sendToBridge(
			messageSource,
			groups.username,
			groups.content,
			groups.hypixelRank,
			groups.guildRank
		)
	}
}
