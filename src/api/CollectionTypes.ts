export type UnlockedTierEntry = {
	[key: string]: number
}

export type CollectionItemTier = {
	tier: number
	amountRequired: number
}

export type CollectionItem = {
	id: string
	name: string
	maxTier: number
	tiers: CollectionItemTier[]
}

export type CollectionCategory = {
	id: string
	items: CollectionItem[]
}

export type Collection = {
	id: string
	name: string
	category: string
	maxTier: number
	unlockedTier: number
	isMaxed: boolean
	amtString: string
	amount: number
}
