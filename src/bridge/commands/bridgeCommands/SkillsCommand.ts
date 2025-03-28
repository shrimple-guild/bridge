import { SimpleCommand } from "./Command.js"
import { formatNumber, titleCase } from "../../../utils/utils.js"
import { HypixelAPI } from "../../../api/HypixelAPI.js"
import { isSkill } from "../../../api/Skills.js"

export class SkillsCommand extends SimpleCommand {
	aliases = ["skill"]
	usage = "<player:[profile|bingo|main]> <skill>"

	constructor(private hypixelAPI: HypixelAPI) {
		super()
	}

	async execute(args: string[]) {
		if (args.length < 2) this.throwUsageError()
		const playerArg = args.shift()!.split(":")
		const playerName = playerArg[0]
		const profileArg = playerArg[1]?.toLowerCase()
		const skillName = args.shift()!.toLowerCase()
		const uuid = await this.hypixelAPI.mojang.fetchUuid(playerName)
		const profiles = await this.hypixelAPI.fetchProfiles(uuid)
		const profile = profiles.getByQuery(profileArg)
		const cuteName = profile.cuteName
		if (!isSkill(skillName)) this.error(`"${titleCase(skillName)}" is not a skill!`)
		const skillLevel = profile.skills[skillName]
		if (!skillLevel) this.error(`No data found for ${cuteName} profile; is your skills API on?`)

		let message = `${titleCase(skillName)} level for ${playerName} (${cuteName}): `
		message += `${formatNumber(skillLevel.fractionalLevel, 2, false)} | `
		message += `Total XP: ${formatNumber(skillLevel.xp, 3, true)} | `
		if (skillLevel.level == skillLevel.maxLevel) {
			message += `Overflow XP: ${formatNumber(skillLevel.overflow, 3, true)}`
		} else {
			message += `XP for level ${skillLevel.level + 1}: ${formatNumber(skillLevel.xpToNext, 2, true)}`
		}
		return message
	}
}
