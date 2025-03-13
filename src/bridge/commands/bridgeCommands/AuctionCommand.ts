import { HumanizeDuration, HumanizeDurationLanguage } from "humanize-duration-ts"
import { MarketApi } from "../../../api/MarketApi.js"
import { SimpleCommand } from "./Command.js"

export class AuctionCommand extends SimpleCommand {
	aliases = ["lbin", "lowestbin", "ah", "lb"]

	usage = "<item name>"

	langService = new HumanizeDurationLanguage()
	humanizer = new HumanizeDuration(this.langService)

	constructor(private marketAPI: MarketApi) {
		super()
	}

	async execute(args: string[]) {
		if (!args.length) this.throwUsageError()
		let formatter = Intl.NumberFormat("en", { notation: "compact" })
		const info = await this.marketAPI.getLowestBinInfo(args.join(" "))
		const formattedPrice = formatter.format(info.lowestBin)
		let output = `Lowest BIN for ${info.name} is ${formattedPrice} `
		if (info.current) {
			output += "(currently on auction)."
		} else {
			const timeSinceLastSeen = Date.now() - new Date(info.seenAt).getTime()
			const formattedTime = this.humanizer.humanize(timeSinceLastSeen, {
				largest: 1,
				delimiter: " "
			})
			output += `(last seen ${formattedTime} ago).`
		}
		return output
	}
}
