import { antiSpamProtString, MessageSource } from "../../utils/utils.js"
import { Pattern } from "./Pattern"

export const boopReceived: Pattern = {
	name: "boopReceived",
	pattern: /^From (?:\[(?<hypixelRank>[\w+]+)\] )?(?<name>\w{2,16}): Boop!$/,
	execute: async (bot, groups) => {
		const content = `Thanks for the boop, ${groups.name}!`
		bot.chat(MessageSource.Guild, `${content} ${antiSpamProtString()}`)
		bot.sendToBridge(MessageSource.Guild, bot.username, content)
	}
}
