import { Pattern } from "./Pattern"
import { config } from "../../utils/config.js"

export const guildRankGift: Pattern = {
	name: "guildRankGift",
	pattern:
		/\?\?\? (?<gifter>\[MVP\+\+\] \w+) gifted 30 Days of MVP\+\+ to (?<giftee>\w+)! \?\?\?/,
	execute: async (bot, groups) => {
		await bot.sendToBridge(
			config.minecraft.username,
			`**${groups.giftee} was gifted MVP++ by ${groups.gifter}!**`
		)
	}
}
