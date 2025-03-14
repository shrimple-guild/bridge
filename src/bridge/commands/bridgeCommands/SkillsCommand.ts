import { SimpleCommand } from "./Command.js"
import { formatNumber, titleCase } from "../../../utils/utils.js"
import { HypixelAPI } from "../../../api/HypixelAPI.js"
import { resolveSkill } from "../../../api/Skills.js"
import { Level } from "../../../utils/Level.js"

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
		const skillQuery = args.shift()!.toLowerCase()

		const skillName = resolveSkill(skillQuery)
		if (!skillName) this.error(`"${titleCase(skillQuery)}" is not a skill!`)

		const uuid = await this.hypixelAPI.mojang.fetchUuid(playerName)
		const profiles = await this.hypixelAPI.fetchProfiles(uuid)
		const profile = profiles.getByQuery(profileArg)
		const cuteName = profile.cuteName

		const skills = profile.skills

		if (!skills.isApiEnabled()) {
			this.error(`No data found for ${cuteName} profile; is your skills API on?`)
		}

		const level = profile.skills[skillName]
		const hasOverflowCurve = !(level instanceof Level)
		const normal = hasOverflowCurve ? level.normal : level
		const overflow = hasOverflowCurve ? level.overflow : level

		let messageHeader = `${titleCase(skillName)} level for ${playerName} (${cuteName}): `
		let messageComponents: string[] = []

		messageComponents.push(`${formatNumber(overflow.getFractionalLevel(), 2, false)}`)
		messageComponents.push(`Total XP: ${formatNumber(overflow.getTotalXp(), 3, true)}`)
		if (
			!normal.reachedUserCap() &&
			(hasOverflowCurve || normal.getMaxLevel() != normal.getLevel())
		) {
			messageComponents.push(
				`XP for ${overflow.getLevel() + 1}: ${formatNumber(overflow.getXpToNextLevel() ?? Infinity, 2, true)}`
			)
		}
		messageComponents.push(
			`XP past ${normal.getUserMaxLevel()}: ${formatNumber(normal.getCurrentXp(), 3, true)}`
		)

		return `${messageHeader} ${messageComponents.join(" | ")}`
	}
}
