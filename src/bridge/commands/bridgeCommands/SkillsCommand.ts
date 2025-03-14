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

		let messageHeader = `${titleCase(skillName)} level for ${playerName} (${cuteName}): `
		let messageComponents: string[] = []

		messageComponents.push(`${formatNumber(level.getOverflowFractionalLevel(), 2, false)}`)
		messageComponents.push(`Total XP: ${formatNumber(level.getTotalXp(), 3, true)}`)

		const xpToNext = level.getOverflowXpToNextLevel()
		if (xpToNext != null && xpToNext > 0) {
			messageComponents.push(
				`XP for ${level.getOverflowLevel() + 1}: ${formatNumber(xpToNext, 2, true)}`
			)
		}

		messageComponents.push(
			`XP past ${level.getLevel()}: ${formatNumber(level.getCurrentXp(), 3, true)}`
		)

		return `${messageHeader} ${messageComponents.join(" | ")}`
	}
}
