import { antiSpamProtString, MessageSource } from "../../utils/utils.js"
import { Pattern } from "./Pattern"

export const boopSent: Pattern = {
	name: "boopSent",
	pattern: /^To (?:\[(?<hypixelRank>[\w+]+)\] )?(?<name>\w{2,16}): Boop!/,
	execute: async (bot, groups) => {
		const content = `Booped ${groups.name}!`
		bot.chat(MessageSource.Guild, `${content} ${antiSpamProtString()}`)
		bot.sendToBridge(MessageSource.Guild, bot.username, content)
	}
}
