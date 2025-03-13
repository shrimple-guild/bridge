const fishNameMap = {
	sulphur_skitter: "Sulphur Skitter",
	obfuscated_fish_1: "Obfuscated 1",
	steaming_hot_flounder: "Steaming-Hot Flounder",
	obfuscated_fish_2: "Obfuscated 2",
	gusher: "Gusher",
	blobfish: "Blobfish",
	slugfish: "Slugfish",
	obfuscated_fish_3: "Obfuscated 3",
	flyfish: "Flyfish",
	lava_horse: "Lavahorse",
	mana_ray: "Mana Ray",
	volcanic_stonefish: "Volcanic Stonefish",
	vanille: "Vanille",
	skeleton_fish: "Skeleton Fish",
	moldfin: "Moldfin",
	soul_fish: "Soul Fish",
	karate_fish: "Karate Fish",
	golden_fish: "Golden Fish"
} as const

export const trophyFishNames = Object.values(fishNameMap)

type TrophyFishName = (typeof fishNameMap)[keyof typeof fishNameMap]

export type TrophyFishTier = "bronze" | "silver" | "gold" | "diamond"

export class TrophyFish {
	readonly fish: Record<TrophyFishName, Fish>

	constructor(member: any) {
		const trophyData = member.trophy_fish
		this.fish = Object.fromEntries(
			Object.entries(fishNameMap).map(([apiName, fishName]) => [
				fishName,
				new Fish(apiName, trophyData)
			])
		) as Record<TrophyFishName, Fish>
	}

	get(fish: TrophyFishName) {
		return this.fish[fish]
	}

	tierCount(tier: TrophyFishTier) {
		return Object.values(this.fish).reduce((prev, cur) => prev + cur[tier], 0)
	}

	unlocked(tier: TrophyFishTier) {
		return Object.values(this.fish).reduce((prev, cur) => prev + (cur[tier] > 0 ? 1 : 0), 0)
	}

	get tier(): TrophyFishTier | undefined {
		return Object.values(this.fish)
			.map((fish) => fish.tier)
			.reduce((prev, cur) => (tierValue(prev) < tierValue(cur) ? prev : cur))
	}

	get total() {
		return Object.values(this.fish).reduce((prev, cur) => prev + cur.total, 0)
	}

	get totalNoObf() {
		return this.total - this.fish["Obfuscated 1"].total
	}
}

class Fish {
	readonly bronze: number
	readonly silver: number
	readonly gold: number
	readonly diamond: number

	constructor(apiName: string, trophyData: any) {
		this.bronze = trophyData?.[`${apiName}_bronze`] ?? 0
		this.silver = trophyData?.[`${apiName}_silver`] ?? 0
		this.gold = trophyData?.[`${apiName}_gold`] ?? 0
		this.diamond = trophyData?.[`${apiName}_diamond`] ?? 0
	}

	get total() {
		return this.bronze + this.silver + this.gold + this.diamond
	}

	get tier(): TrophyFishTier | undefined {
		if (this.diamond > 0) return "diamond"
		if (this.gold > 0) return "gold"
		if (this.silver > 0) return "silver"
		if (this.bronze > 0) return "bronze"
	}
}

function tierValue(tier: TrophyFishTier | undefined) {
	const tiers = { bronze: 1, silver: 2, gold: 3, diamond: 4 }
	return tier != null ? tiers[tier] : 0
}
