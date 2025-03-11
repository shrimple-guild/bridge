export class MarketApi {
    private readonly url: URL

    constructor(url: string) {
        this.url = new URL(url)
    }

    async getLowestBinInfo(query: string): Promise<MarketApiLowestBinResponse> {
        return this.fetchApi<MarketApiLowestBinResponse>(`lowestbin/${encodeURIComponent(query)}`, query)
    }

    async getBazaarInfo(query: string): Promise<MarketApiBazaarProductResponse> {
        return this.fetchApi<MarketApiBazaarProductResponse>(`bazaar/${encodeURIComponent(query)}`, query)
    }

    async getBulkBazaarPrice(query: string, quantity: number): Promise<MarketApiBazaarBulkResponse> {
        return this.fetchApi<MarketApiBazaarBulkResponse>(`bazaar/${encodeURIComponent(query)}/bulk/${quantity}`, query)
    }

    private async fetchApi<T>(path: string, query: string): Promise<T> {
        this.url.pathname = path
        let response;
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

export type MarketApiLowestBinResponse = {
    name: string,
    internalName: string,
    seenAt: string,
    current: boolean,
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
    quantity: number,
    value: number
}

type MarketApiBazaarBuySell = {
    instaBuy: number | null
    instaSell: number | null
}