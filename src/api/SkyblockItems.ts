import { titleCase } from "../utils/utils.js"
import { HypixelAPI } from "./HypixelAPI.js"

export type SpecifiedNames = {
	[key: string]: {
		name: string
		aliases?: string[]
	}
}

export class SkyblockItems {
	private idToName: { [key: string]: string } = {}

	private constructor(
		private hypixelAPI: HypixelAPI,
		private specifiedNames?: SpecifiedNames
	) {}

	static async create(hypixelAPI: HypixelAPI, specifiedNames?: SpecifiedNames) {
		const sbItems = new SkyblockItems(hypixelAPI, specifiedNames)
		await sbItems.update()
		return sbItems
	}

	async update() {
		const { data } = await this.hypixelAPI.fetchHypixel("/resources/skyblock/items")
		const itemList = data.items as any[]
		this.idToName = Object.fromEntries(itemList.map((item) => [item.id, item.name]))
	}

	itemName(id: string) {
		return this.specifiedNames?.[id]?.name ?? this.idToName[id] ?? titleCase(id)
	}
}
