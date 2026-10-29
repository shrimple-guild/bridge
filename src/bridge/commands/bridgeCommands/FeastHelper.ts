import { SimpleCommand } from "./Command.js"
import { MarketApi } from "../../../api/MarketApi.js"

export class FeastHelper extends SimpleCommand {
	aliases = ["feast"]
	description = "Shows the current Harvest Feast crops"

	constructor(private readonly marketApi: MarketApi) {
		super()
	}

	async execute(): Promise<string> {
		let data
		try {
			data = await this.marketApi.getHarvestFeast()
		} catch {
			return "Feast schedule unavailable."
		}

		const { currentCrops, nextCrops, nextStartTime, isGrandFeast } = data

		if (!currentCrops || currentCrops.length === 0) {
			return "Feast schedule unavailable."
		}

		let summary = `Current: ${currentCrops.join(", ")}`
		if (isGrandFeast) {
			summary += " (Grand Feast)"
		}

		if (nextCrops.length > 0) {
			summary += `. Next: ${nextCrops.join(", ")}`
			if (nextStartTime !== null) {
				const hours = Math.floor((nextStartTime * 1000 - Date.now()) / (1000 * 60 * 60))
				summary += ` in ${hours}h`
			} else {
				summary += ` (time unknown)`
			}
		}

		summary += ` (Feast Data via https://eliteskyblock.com/harvest-feast/upcoming)`
		return summary
	}
}
