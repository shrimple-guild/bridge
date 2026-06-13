import { SimpleCommand } from "./Command.js"
import { BulkBazaarCommandHelper } from "./BulkBazaarCommandHelper.js"
import { MarketApi } from "../../../api/MarketApi.js"

export class InstabuyPriceCalcCommand extends SimpleCommand {
	aliases = ["ib", "bzib", "instabuy"]

	constructor(private marketApi: MarketApi) {
		super()
	}

	usage = "<amount>[k|m|b|s] <item name>"

	execute(args: string[]): Promise<string | void> {
		if (args.length == 0) this.throwUsageError()
		return BulkBazaarCommandHelper.calculate(this.marketApi, "instaBuy", args)
	}
}
