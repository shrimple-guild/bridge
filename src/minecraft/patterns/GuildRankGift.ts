import { Pattern } from "./Pattern"
import { config } from "../../utils/config.js"
import { MessageSource } from "../../utils/utils"

export const guildRankGift: Pattern = {
	name: "guildRankGift",
	pattern:
		/\?\?\? (?<gifter>\[MVP\+\+\] \w+) gifted 30 Days of MVP\+\+ to (?<giftee>\w+)! \?\?\?/,
	execute: async (bot, groups) => {
		await bot.sendToBridge(
			MessageSource.Guild,
			config.minecraft.username,
			`**${groups.giftee} was gifted MVP++ by ${groups.gifter}!**`
		)
	}
}
