import fuzzy from "fuzzysort"
import { neuLevelingData } from "../utils/NeuLevelingData.js"
import { Level, LevelCurve } from "../utils/Level.js"

const slayerMapping: { name: string; slayer: SlayerName }[] = [
	{ name: "revenant horror", slayer: "zombie" },
	{ name: "tarantula broodfather", slayer: "spider" },
	{ name: "sven packmaster", slayer: "wolf" },
	{ name: "voidgloom seraph", slayer: "enderman" },
	{ name: "inferno demonlord", slayer: "blaze" },
	{ name: "riftstalker bloodfiend", slayer: "vampire" },
	{ name: "zombie", slayer: "zombie" },
	{ name: "spider", slayer: "spider" },
	{ name: "wolf", slayer: "wolf" },
	{ name: "enderman", slayer: "enderman" },
	{ name: "blaze", slayer: "blaze" },
	{ name: "vampire", slayer: "vampire" },
	{ name: "woof", slayer: "wolf" }
]

const slayers = ["zombie", "spider", "wolf", "enderman", "blaze", "vampire"] as const

type SlayerName = (typeof slayers)[number]

export function resolveSlayer(str: string): SlayerName | undefined {
	const result = fuzzy.go(str, slayerMapping, { key: "name", limit: 1 })[0]?.obj
	return result?.slayer
}

export class Slayers {
	readonly zombie: Slayer
	readonly spider: Slayer
	readonly wolf: Slayer
	readonly enderman: Slayer
	readonly blaze: Slayer
	readonly vampire: Slayer

	constructor(member: any) {
		const bosses = member.slayer?.slayer_bosses
		this.zombie = new Slayer("zombie", neuLevelingData.zombieCurve, bosses)
		this.spider = new Slayer("spider", neuLevelingData.spiderCurve, bosses)
		this.wolf = new Slayer("wolf", neuLevelingData.wolfCurve, bosses)
		this.enderman = new Slayer("enderman", neuLevelingData.endermanCurve, bosses)
		this.blaze = new Slayer("blaze", neuLevelingData.blazeCurve, bosses)
		this.vampire = new Slayer("vampire", neuLevelingData.vampireCurve, bosses)
	}
}

export class Slayer {
	readonly level: Level
	readonly kills: number[]

	constructor(slayer: string, levelCurve: LevelCurve, bosses: any) {
		const slayerData = bosses?.[slayer]
		this.level = levelCurve.at(slayerData?.xp ?? 0)
		this.kills = [0, 1, 2, 3, 4].map(
			(i) => (slayerData?.[`boss_kills_tier_${i}`] ?? 0) as number
		)
	}
}
