import { SimpleCommand } from "./Command.js"
import { formatNumber, titleCase } from "../../../utils/utils.js"
import { HypixelAPI } from "../../../api/HypixelAPI.js"
import { resolveSlayer } from "../../../api/Slayers.js"

export class SlayerCommand extends SimpleCommand {
	aliases = ["slayer"]
	usage = "<player:[profile|bingo|main]> <slayer>"

	constructor(private hypixelAPI: HypixelAPI) {
		super()
	}

	async execute(args: string[]) {
		if (args.length < 2) this.throwUsageError()
		const playerArg = args.shift()!.split(":")
		const playerName = playerArg[0]
		const profileArg = playerArg[1]?.toLowerCase()
		const slayerName = args.shift()?.toLowerCase()
		let message
		if (!slayerName) this.error("A slayer name must be specified!")
		const uuid = await this.hypixelAPI.mojang.fetchUuid(playerName)
		const profiles = await this.hypixelAPI.fetchProfiles(uuid)
		const profile = profiles.getByQuery(profileArg)
		const resolvedSlayer = resolveSlayer(slayerName)
		if (!resolvedSlayer) this.error(`${titleCase(slayerName)} is not a valid slayer name!`)
		const slayer = profile.slayers[resolvedSlayer]
		message = `${titleCase(resolvedSlayer)} slayer data for ${playerName} (${profile.cuteName}): `
		message += `Total XP: ${formatNumber(slayer.level.getTotalXp(), 2, true)} | Tier kills: `
		message += `(${slayer.kills.join(" | ")})`
		return message
	}
}
