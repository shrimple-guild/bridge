import { Pattern } from "./Pattern"
import { config } from "../../utils/config.js"

export const questTierCompleted: Pattern = {
	name: "questTierCompleted",
	pattern: /^GUILD QUEST TIER (?<tier>\d+) COMPLETED!$/,
	execute: async (bot, groups) => {
		await bot.sendToBridge(
			config.minecraft.username,
			`:tada: **GUILD QUEST TIER ${groups.tier} COMPLETED!** :tada:`,
			"JOINED"
		)
	}
}
