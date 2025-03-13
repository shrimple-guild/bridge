import { toCamelCase } from "../utils/utils.js"

export class Mobs {
	private data: Record<string, { kills: number; deaths: number }>

	constructor(member: any) {
		this.data = {}
		const stats: Record<string, number> = member.stats ?? {}
		Object.entries(stats).forEach(([key, value]) => {
			const isKillStat = key.startsWith("kills_")
			const isDeathStat = key.startsWith("deaths_")
			if (isKillStat || isDeathStat) {
				const mob = toCamelCase(key.slice(isKillStat ? 6 : 7))
				this.data[mob] = this.data[mob] ?? { kills: 0, deaths: 0 }
				this.data[mob][isKillStat ? "kills" : "deaths"] = value
			}
		})
	}

	get(mob: string) {
		return this.data[mob] ?? { kills: 0, deaths: 0 }
	}
}
