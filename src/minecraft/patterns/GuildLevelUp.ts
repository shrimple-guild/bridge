import { Pattern } from "./Pattern"
import { config } from "../../utils/config.js"
import { MessageSource } from "../../utils/utils.js"

export const guildLevelUp: Pattern = {
	name: "guildLevelUp",
	pattern: /^The Guild has reached Level (?<level>\d+)!$/,
	execute: async (bot, groups) => {
		await bot.sendToBridge(
			MessageSource.Guild,
			config.minecraft.username,
			`:tada: **The Guild has reached Level ${groups.level}!** :tada:`,
			"JOINED"
		)
	}
}
