import { SimpleCommand } from "./Command.js"
import { MarketApi } from "../../../api/MarketApi.js"
import { BulkBazaarCommandHelper } from "./BulkBazaarCommandHelper.js"

export class InstasellPriceCalcCommand extends SimpleCommand {
	aliases = ["is", "bzis", "instasell"]

	constructor(private marketApi: MarketApi) {
		super()
	}

	usage = "[amount][k|m|b|s] <item name>"

	execute(args: string[]): Promise<string | void> {
		if (args.length == 0) this.throwUsageError()
		return BulkBazaarCommandHelper.calculate(this.marketApi, "instaSell", args)
	}
}
