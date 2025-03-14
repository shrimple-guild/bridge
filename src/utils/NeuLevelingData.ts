import leveling from "../data/leveling.json" assert { type: "json" }
import { GeneratorLevelFunction, LevelCurve, OverflowLevelCurve } from "./Level.js"

const skillLevelFunction = new GeneratorLevelFunction(skillLevelGenerator())
const skillLevelCurve = LevelCurve.create(skillLevelFunction)

interface NeuLevelingJson {
	runecrafting_xp: number[]
	social: number[]
	catacombs: number[]
	slayer_xp: {
		zombie: number[]
		spider: number[]
		wolf: number[]
		enderman: number[]
		blaze: number[]
		vampire: number[]
	}
	leveling_caps: {
		taming: number
		mining: number
		foraging: number
		enchanting: number
		carpentry: number
		farming: number
		combat: number
		fishing: number
		alchemy: number
		runecrafting: number
		catacombs: number
		HOTM: number
		social: number
	}
}

class NeuLevelingData {
	readonly dungeonCurve: OverflowLevelCurve

	readonly tamingCurve: OverflowLevelCurve
	readonly miningCurve: OverflowLevelCurve
	readonly foragingCurve: OverflowLevelCurve
	readonly enchantingCurve: OverflowLevelCurve
	readonly carpentryCurve: OverflowLevelCurve
	readonly farmingCurve: OverflowLevelCurve
	readonly combatCurve: OverflowLevelCurve
	readonly fishingCurve: OverflowLevelCurve
	readonly alchemyCurve: OverflowLevelCurve
	readonly runecraftingCurve: OverflowLevelCurve
	readonly socialCurve: OverflowLevelCurve

	readonly zombieCurve: LevelCurve
	readonly spiderCurve: LevelCurve
	readonly wolfCurve: LevelCurve
	readonly endermanCurve: LevelCurve
	readonly blazeCurve: LevelCurve
	readonly vampireCurve: LevelCurve

	constructor(data: NeuLevelingJson) {
		this.dungeonCurve = LevelCurve.fromLevelXp(data.catacombs)
			.withMaxLevel(data.leveling_caps.catacombs)
			.allowOverflow()

		this.tamingCurve = skillLevelCurve.withMaxLevel(60).allowOverflow()
		this.miningCurve = skillLevelCurve.withMaxLevel(data.leveling_caps.mining).allowOverflow()
		this.foragingCurve = skillLevelCurve
			.withMaxLevel(data.leveling_caps.foraging)
			.allowOverflow()
		this.enchantingCurve = skillLevelCurve
			.withMaxLevel(data.leveling_caps.enchanting)
			.allowOverflow()
		this.carpentryCurve = skillLevelCurve
			.withMaxLevel(data.leveling_caps.carpentry)
			.allowOverflow()
		this.farmingCurve = skillLevelCurve.withMaxLevel(60).allowOverflow()
		this.combatCurve = skillLevelCurve.withMaxLevel(data.leveling_caps.combat).allowOverflow()
		this.fishingCurve = skillLevelCurve.withMaxLevel(data.leveling_caps.fishing).allowOverflow()
		this.alchemyCurve = skillLevelCurve.withMaxLevel(data.leveling_caps.alchemy).allowOverflow()

		this.runecraftingCurve = LevelCurve.fromLevelXp(data.runecrafting_xp)
			.withMaxLevel(data.leveling_caps.runecrafting)
			.allowOverflow()

		this.socialCurve = LevelCurve.fromLevelXp(data.social)
			.withMaxLevel(data.leveling_caps.runecrafting)
			.allowOverflow()

		this.zombieCurve = LevelCurve.fromCumulativeXp(data.slayer_xp.zombie)
		this.spiderCurve = LevelCurve.fromCumulativeXp(data.slayer_xp.spider)
		this.wolfCurve = LevelCurve.fromCumulativeXp(data.slayer_xp.wolf)
		this.endermanCurve = LevelCurve.fromCumulativeXp(data.slayer_xp.enderman)
		this.blazeCurve = LevelCurve.fromCumulativeXp(data.slayer_xp.blaze)
		this.vampireCurve = LevelCurve.fromCumulativeXp(data.slayer_xp.vampire)
	}
}

// todo: make this update from NEU repo every so often
export const neuLevelingData = new NeuLevelingData(leveling)

// todo: make this not hardcoded? though that might break badly if skills ever change
function* skillLevelGenerator(): Generator<number, never, never> {
	const levelXp = [
		50, 125, 200, 300, 500, 750, 1000, 1500, 2000, 3500, 5000, 7500, 10000, 15000, 20000, 30000,
		50000, 75000, 100000, 200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000,
		1000000, 1100000, 1200000, 1300000, 1400000, 1500000, 1600000, 1700000, 1800000, 1900000,
		2000000, 2100000, 2200000, 2300000, 2400000, 2500000, 2600000, 2750000, 2900000, 3100000,
		3400000, 3700000, 4000000, 4300000, 4600000, 4900000, 5200000, 5500000, 5800000, 6100000,
		6400000, 6700000, 7000000
	]

	let totalXp = 0

	for (let i = 0; i < levelXp.length; i++) {
		totalXp += levelXp[i]
		yield totalXp
	}

	let currentLevel = levelXp.length
	let nextLevelXp = 7000000 + 600000
	let slope = 600000

	while (true) {
		totalXp += nextLevelXp
		nextLevelXp += slope
		currentLevel++
		if (currentLevel % 10 == 0) {
			slope *= 2
		}
		yield totalXp
	}
}
