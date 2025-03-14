import { Level, OverflowLevel } from "../utils/Level.js"
import { neuLevelingData } from "../utils/NeuLevelingData.js"

import fuzzy from "fuzzysort"

const skillNames = [
	"taming",
	"farming",
	"mining",
	"combat",
	"foraging",
	"fishing",
	"enchanting",
	"alchemy",
	"carpentry",
	"runecrafting",
	"social"
] as const

export function resolveSkill(str: string): (typeof skillNames)[number] | undefined {
	const result = fuzzy.go(str, skillNames, { limit: 1 }).at(0)?.target
	// @ts-expect-error
	return result
}

export class Skills {
	private apiEnabled: boolean

	readonly taming: OverflowLevel
	readonly farming: OverflowLevel
	readonly mining: OverflowLevel
	readonly combat: OverflowLevel
	readonly foraging: OverflowLevel
	readonly fishing: OverflowLevel
	readonly enchanting: OverflowLevel
	readonly alchemy: OverflowLevel
	readonly carpentry: OverflowLevel
	readonly runecrafting: Level
	readonly social: Level

	constructor(member: any) {
		const skills = member.player_data?.experience
		this.apiEnabled = skills != null

		const farmingLevelCap = 50 + (member.jacobs_contest?.perks?.farming_level_cap ?? 0)
		const tamingLevelCap = 50 + (member.pets_data?.pet_care?.pet_types_sacrificed?.length ?? 0)

		this.taming = neuLevelingData.tamingCurve.at(skills?.SKILL_TAMING ?? 0, tamingLevelCap)
		this.farming = neuLevelingData.farmingCurve.at(skills?.SKILL_FARMING ?? 0, farmingLevelCap)
		this.mining = neuLevelingData.miningCurve.at(skills?.SKILL_MINING ?? 0)
		this.combat = neuLevelingData.combatCurve.at(skills?.SKILL_COMBAT ?? 0)
		this.foraging = neuLevelingData.foragingCurve.at(skills?.SKILL_FORAGING ?? 0)
		this.fishing = neuLevelingData.fishingCurve.at(skills?.SKILL_FISHING ?? 0)
		this.enchanting = neuLevelingData.enchantingCurve.at(skills?.SKILL_ENCHANTING ?? 0)
		this.alchemy = neuLevelingData.alchemyCurve.at(skills?.SKILL_ALCHEMY ?? 0)
		this.carpentry = neuLevelingData.carpentryCurve.at(skills?.SKILL_CARPENTRY ?? 0)
		this.runecrafting = neuLevelingData.runecraftingCurve.at(skills?.SKILL_RUNECRAFTING ?? 0)
		this.social = neuLevelingData.socialCurve.at(skills?.SKILL_SOCIAL ?? 0)
	}

	isApiEnabled() {
		return this.apiEnabled
	}

	get average() {
		const skills = [
			this.taming,
			this.farming,
			this.mining,
			this.combat,
			this.foraging,
			this.fishing,
			this.enchanting,
			this.alchemy
		]
		return skills.reduce((prev, cur) => prev + (cur?.normal.getLevel() ?? 0), 0) / skills.length
	}
}
