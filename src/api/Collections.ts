import { formatNumber } from "../utils/utils.js";
import { Collection, UnlockedTierEntry } from "./CollectionTypes.js";
import { HypixelAPI } from "./HypixelAPI.js";

export class Collections {
    private collections: Collection[] = []
    private tierRegex = /^(.*?)(-?\d+)$/
    constructor(member: any, api: HypixelAPI) {
        const unlockedTiers = member.player_data?.unlocked_coll_tiers as string[]
        if (!unlockedTiers) return;
        const unlockedTiersParsed: UnlockedTierEntry = {}
        unlockedTiers.forEach(tierStr => {
            const match = tierStr.match(this.tierRegex)!
            const collection = match[1].slice(0, match[1].length - 1).trim()
            const tier = parseInt(match[2])
            if (tier === -1) return
            if (!unlockedTiersParsed[collection]) unlockedTiersParsed[collection] = []
            unlockedTiersParsed[collection].push(tier)
        })
        for (const collection in unlockedTiersParsed) {
            unlockedTiersParsed[collection].sort((a, b) => a - b)
        }

        const collections = member.collection as { [key: string]: number }
        if (!collections) return;
        api.collections!.forEach(category => {
            category.items.forEach(item => {
                const unlockedTiers = unlockedTiersParsed[item.id] ?? []
                const highestUnlocked = unlockedTiers[unlockedTiers.length - 1] ?? 0
                const isMaxed = highestUnlocked === item.maxTier
                const amount = collections[item.id] ?? 0
                const formattedAmt = formatNumber(amount, 0, false)
                const amtString = isMaxed ? formattedAmt : `${formattedAmt}/${formatNumber(item.tiers.find(tier => tier.tier == highestUnlocked + 1)?.amountRequired ?? 0, 0, false)}`
                this.collections.push({
                    id: item.id,
                    name: item.name,
                    category: category.id,
                    maxTier: item.maxTier,
                    unlockedTier: highestUnlocked,
                    isMaxed: isMaxed,
                    amtString: amtString,
                    amount: amount
                })
            })
        })
    }

    getByCategory(category: string) {
        return this.collections.filter(collection => {
            return collection.category.toLowerCase() == category.toLowerCase()
        })
    }

    getByItem(item: string) {
        return this.collections.find(collection => collection.name.toLowerCase() == item.toLowerCase() || collection.name.toLowerCase().includes(item.toLowerCase()))
    }

    get all() {
        return this.collections
    }
}