import { Pattern } from "./Pattern"
import { config } from "../../utils/config.js"
import { MessageSource } from "../../utils/utils"

export const questTierCompleted: Pattern = {
	name: "questTierCompleted",
	pattern: /^GUILD QUEST TIER (?<tier>\d+) COMPLETED!$/,
	execute: async (bot, groups) => {
		await bot.sendToBridge(
			MessageSource.Guild,
			config.minecraft.username,
			`:tada: **GUILD QUEST TIER ${groups.tier} COMPLETED!** :tada:`,
			"JOINED"
		)
	}
}
