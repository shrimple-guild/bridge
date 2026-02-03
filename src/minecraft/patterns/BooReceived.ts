import { antiSpamProtString, MessageSource } from "../../utils/utils.js"
import { Pattern } from "./Pattern"

export const booReceived: Pattern = {
	name: "booReceived",
	pattern: /^From (?:\[(?<hypixelRank>[\w+]+)\] )?(?<name>\w{2,16}): Boo!$/,
	execute: async (bot, groups) => {
		const content = `AAH! You scared me, ${groups.name}!`
		bot.chat(MessageSource.Guild, `${content} ${antiSpamProtString()}`)
		bot.sendToBridge(MessageSource.Guild, bot.username, content)
	}
}
