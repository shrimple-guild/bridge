import { formatNumber } from "../utils/utils.js"
import { Collection, UnlockedTierEntry } from "./CollectionTypes.js"
import { HypixelAPI } from "./HypixelAPI.js"

export class Collections {
	private collections: Collection[] = []
	constructor(member: any, api: HypixelAPI, allCollectionTiers: UnlockedTierEntry) {
		const unlockedTiers = member.player_data?.unlocked_coll_tiers as string[]
		if (!unlockedTiers) return

		const collections = member.collection as { [key: string]: number }
		if (!collections) return
		api.collections!.forEach((category) => {
			category.items.forEach((item) => {
				const maxTier = allCollectionTiers[item.id] ?? 0
				const isMaxed = maxTier === item.maxTier
				const amount = collections[item.id] ?? 0
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
