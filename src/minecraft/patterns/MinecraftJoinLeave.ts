import { MessageSource } from "../../utils/utils"
import { Pattern } from "./Pattern"

export const minecraftJoinLeave: Pattern = {
	name: "minecraftJoinLeave",
	pattern: /^Guild > (?<username>\w{2,16}) (?<action>joined|left).$/,
	execute: async (bot, groups) => {
		const online = groups.action === "joined"
		await bot.sendToBridge(
			MessageSource.Guild,
			groups.username,
			online ? "**joined.**" : "**left.**",
			online ? "JOINED" : "LEFT"
		)
	}
}
