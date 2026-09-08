export class MarketApi {
	private readonly url: URL
	constructor(url: string) {
		this.url = new URL(url)
	}

	async getLowestBinInfo(query: string): Promise<MarketApiLowestBinResponse> {
		return this.fetchApi<MarketApiLowestBinResponse>(
			`lowestbin/${encodeURIComponent(query)}`,
			query
		)
	}

	async getBazaarInfo(query: string): Promise<MarketApiBazaarProductResponse> {
		return this.fetchApi<MarketApiBazaarProductResponse>(
			`bazaar/${encodeURIComponent(query)}`,
			query
		)
	}

	async getBulkBazaarPrice(
		query: string,
		quantity: number
	): Promise<MarketApiBazaarBulkResponse> {
		return this.fetchApi<MarketApiBazaarBulkResponse>(
			`bazaar/${encodeURIComponent(query)}/bulk/${quantity}`,
			query
		)
	}

	async getHarvestFeast(): Promise<MarketApiHarvestFeastResponse> {
		const response = await fetch("https://api.elitebot.dev/harvest-feast/current")
		if (!response.ok) {
			throw new Error(`Harvest Feast API threw ${response.status}.`)
		}
		const raw = await response.json() as FeastApiResponse
		
		const knownTimestamps = Object.values(raw.next).filter((t): t is number => t !== null)
		const soonest = knownTimestamps.length > 0 ? Math.min(...knownTimestamps) : null
		const nextCrops = soonest !== null
			? Object.entries(raw.next).filter(([, t]) => t === soonest).map(([crop]) => crop)
			: Object.keys(raw.next)

		return {
			currentCrops: raw.current,
			nextCrops,
			nextStartTime: soonest,
			isGrandFeast: raw.isGrandFeast,
		}
	}

	private async fetchApi<T>(path: string, query: string): Promise<T> {
		this.url.pathname = path
		let response
		try {
			response = await fetch(this.url)
		} catch (e: any) {
			throw new Error(`Market API fetch failed! Is it offline?`)
		}
		if (response.status == 200) {
			return response.json()
		} else if (response.status == 404) {
			throw new Error(`No item found for query \"${query}\".`)
		} else {
			throw new Error(`Market API threw ${response.status}.`)
		}
	}
}

type FeastApiResponse = {
	year: number
	month: number
	complete: boolean
	current: string[]
	next: Record<string, number | null>
	isGrandFeast: boolean
}

export type MarketApiHarvestFeastResponse = {
	currentCrops: string[]
	nextCrops: string[]
	nextStartTime: number | null 
	isGrandFeast: boolean
}

export type MarketApiLowestBinResponse = {
	name: string
	internalName: string
	seenAt: string
	current: boolean
	lowestBin: number
}

export type MarketApiBazaarBulkResponse = {
	name: string
	internalName: string
	instaBuy: MarketApiBazaarBulkQuantity
	instaSell: MarketApiBazaarBulkQuantity
}

export type MarketApiBazaarProductResponse = {
	name: string
	internalName: string
	sellMarketValue: MarketApiBazaarBulkQuantity
	buyMarketValue: MarketApiBazaarBulkQuantity
	current: MarketApiBazaarBuySell
	oneDayAverage: MarketApiBazaarBuySell
	oneWeekAverage: MarketApiBazaarBuySell
}

type MarketApiBazaarBulkQuantity = {
	quantity: number
	value: number
}

type MarketApiBazaarBuySell = {
	instaBuy: number | null
	instaSell: number | null
}
