import { antiSpamProtString, MessageSource } from "../../utils/utils.js"
import { Pattern } from "./Pattern"

export const boopSent: Pattern = {
	name: "boopSent",
	pattern: /^To (?:\[(?<hypixelRank>[\w+]+)\] )?(?<name>\w{2,16}): Boop!/,
	execute: async (bot, groups) => {
		if (!bot.lastSource) return
		const content = `Booped ${groups.name}!`
		bot.chat(bot.lastSource, `${content} ${antiSpamProtString()}`)
		bot.sendToBridge(bot.lastSource, bot.username, content)
	}
}
