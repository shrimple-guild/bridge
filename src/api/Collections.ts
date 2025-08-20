import { formatNumber } from "../utils/utils.js"
import { Collection, UnlockedTierEntry } from "./CollectionTypes.js"
import { HypixelAPI } from "./HypixelAPI.js"

export class Collections {
	private collections: Collection[] = []
	private tierRegex = /^(.*?)(-?\d+)$/
	constructor(member: any, api: HypixelAPI) {
		const unlockedTiers = member.player_data?.unlocked_coll_tiers as string[]
		if (!unlockedTiers) return
		const unlockedTiersParsed: UnlockedTierEntry = this.getMaxUnlockedTiers(unlockedTiers)

		const collections = member.collection as { [key: string]: number }
		if (!collections) return
		api.collections!.forEach((category) => {
			category.items.forEach((item) => {
				console.log("Item ID: ", item.id)
				const maxTier = unlockedTiersParsed[item.id] ?? 0
				console.log("Max tier:", maxTier)
				const isMaxed = maxTier === item.maxTier
				console.log("Is maxed:", isMaxed)
				const amount = collections[item.id] ?? 0
				console.log("Amount:", amount)
				const formattedAmt = formatNumber(amount, 0, false)
				const amtString = isMaxed
					? formattedAmt
					: `${formattedAmt}/${formatNumber(item.tiers.find((tier) => tier.tier == maxTier + 1)?.amountRequired ?? 0, 0, false)}`
				this.collections.push({
					id: item.id,
					name: item.name,
					category: category.id,
					maxTier: item.maxTier,
					unlockedTier: maxTier,
					isMaxed: isMaxed,
					amtString: amtString,
					amount: amount
				})
			})
		})
	}

	getMaxUnlockedTiers(unlockedTiers: string[]): UnlockedTierEntry {
		const maxUnlockedTiers: UnlockedTierEntry = {}
		unlockedTiers.forEach((tierStr) => {
			const match = tierStr.match(this.tierRegex)!
			const collection = match[1].slice(0, match[1].length - 1).trim()
			const tier = parseInt(match[2])
			if (tier === -1) return
			if (!maxUnlockedTiers[collection] || maxUnlockedTiers[collection] < tier) {
				maxUnlockedTiers[collection] = tier
			}
		})
		return maxUnlockedTiers
	}

	getByCategory(category: string) {
		return this.collections.filter((collection) => {
			return collection.category.toLowerCase() == category.toLowerCase()
		})
	}

	getByItem(item: string) {
		return this.collections.find(
			(collection) =>
				collection.name.toLowerCase() == item.toLowerCase() ||
				collection.name.toLowerCase().includes(item.toLowerCase())
		)
	}

	get all() {
		return this.collections
	}
}
