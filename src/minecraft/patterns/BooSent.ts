import { antiSpamProtString } from "../../utils/utils.js"
import { Pattern } from "./Pattern"

export const booSent: Pattern = {
	name: "booSent",
	pattern: /^To (?:\[(?<hypixelRank>[\w+]+)\] )?(?<name>\w{2,16}): Boo!/,
	execute: async (bot, groups) => {
		const content = `Spooked ${groups.name}! >:)`
		bot.chat(`${content} ${antiSpamProtString()}`)
		bot.sendToBridge(bot.username, content)
	}
}
