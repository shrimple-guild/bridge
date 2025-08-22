import { Pattern } from "./Pattern"
import { config } from "../../utils/config.js"
import { MessageSource } from "../../utils/utils"

export const guildPromoteDemote: Pattern = {
	name: "guildPromoteDemote",
	pattern:
		/^\[(?<rank>[\w+]+)\] (?<name>\w{2,16}) was (?<action>promoted|demoted) from (?<initial>[\w ]+) to (?<final>[\w ]+)$/,
	execute: async (bot, groups) => {
		const promoted = groups.action == "promoted"
		await bot.sendToBridge(
			MessageSource.Guild,
			config.minecraft.username,
			`**${groups.name} was ${groups.action} to ${groups.final}!**`,
			promoted ? "JOINED" : "LEFT"
		)
	}
}
