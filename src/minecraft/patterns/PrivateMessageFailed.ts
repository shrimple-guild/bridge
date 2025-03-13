import { antiSpamProtString } from "../../utils/utils.js"
import { Pattern } from "./Pattern"

export const privateMessageFailed: Pattern = {
	name: "privateMessageFailed",
	pattern: /^You cannot message this player./,
	execute: async (bot, groups) => {
		const content = `⚠ Could not send a private message to that player.`
		bot.chat(`${content} ${antiSpamProtString()}`)
		bot.sendToBridge(bot.username, content)
	}
}

export const privateMessageFailedOffline: Pattern = {
	name: "privateMessageFailedOffline",
	pattern: /^That player is not online!/,
	execute: async (bot, groups) => {
		const content = `⚠ Can't message an offline player.`
		bot.chat(`${content} ${antiSpamProtString()}`)
		bot.sendToBridge(bot.username, content)
	}
}

export const privateMessageFailedBlocked: Pattern = {
	name: "privateMessageFailedBlocked",
	pattern: /^That player blocked you!/,
	execute: async (bot, groups) => {
		const content = `⚠ This player has blocked me :(`
		bot.chat(`${content} ${antiSpamProtString()}`)
		bot.sendToBridge(bot.username, content)
	}
}
