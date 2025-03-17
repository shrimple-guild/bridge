import { MarketApi } from "../../../api/MarketApi.js"
import { formatNumber } from "../../../utils/utils.js"

async function calculate(marketApi: MarketApi, mode: "instaBuy" | "instaSell", args: string[]) {
	let requestedQuantity = parseNumber(args[0]) ?? Infinity
	let query = (requestedQuantity == Infinity ? args : args.slice(1)).join(" ")

	if (!query) {
		throw new Error("No item specified.")
	}

	let info, market

	const isBuying = mode === "instaBuy"

	if (requestedQuantity == Infinity) {
		info = await marketApi.getBazaarInfo(query)
		// wording looks weird, but buy market is what you insta-sell into and vice versa
		market = isBuying ? info.sellMarketValue : info.buyMarketValue
	} else if (requestedQuantity > 0) {
		info = await marketApi.getBulkBazaarPrice(query, requestedQuantity)
		market = isBuying ? info.instaBuy : info.instaSell
	} else {
		throw new Error(`Invalid quantity "${query[0]}".`)
	}

	const { quantity, value } = market
	const average = value / quantity
	const action = isBuying ? "spent from buying" : "earned from selling"
	let output = `Total ${action} ${quantity} ${info.name}: ${format(value)} coins, average price per unit: ${format(average)} coins`
	if (Number.isFinite(requestedQuantity) && quantity < requestedQuantity) {
		output += `, could not sell ${requestedQuantity - quantity} items`
	}
	return output
}

function format(num?: number) {
	if (!num) return "Not available"
	return formatNumber(num, 2, true)
}

function parseNumber(quantity: string): number | null {
	if (!/^\d+[kmbs]?$/.test(quantity)) return null
	const amount = parseFloat(quantity)
	const multiplier = amountMult(quantity)
	return amount * multiplier
}

function amountMult(amount: string) {
	switch (amount[amount.length - 1]) {
		case "k":
			return 1000
		case "m":
			return 1000000
		case "b":
			return 1000000000
		case "s":
			return 64
		default:
			return 1
	}
}

export const BulkBazaarCommandHelper = {
	calculate
}
