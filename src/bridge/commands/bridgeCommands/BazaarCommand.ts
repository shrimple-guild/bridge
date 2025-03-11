import { SimpleCommand } from "./Command.js"
import { formatNumber } from "../../../utils/utils.js"
import { MarketApi, MarketApiBazaarProductResponse } from "../../../api/MarketApi.js"


export class BazaarCommand extends SimpleCommand {
  aliases = ["bz", "bazaar"]

  constructor(private marketApi: MarketApi) {
    super()
  }

  usage = "<item name>"

  async execute(args: string[]) {
    if (!args.length) this.throwUsageError()

    const info = await this.marketApi.getBazaarInfo(args.join(" "))
    const instaBuy = this.formatMetric(info, "instaBuy")
    const instaSell = this.formatMetric(info, "instaSell")

    return `Bazaar data for ${info.name}: insta-buy: ${instaBuy}, insta-sell: ${instaSell}`
  }

  formatMetric(info: MarketApiBazaarProductResponse, metric: "instaBuy" | "instaSell") {
    const current = info.current[metric] ?? NaN
    const formattedCurrent = this.format(current)
    if (formattedCurrent == null) return "Not available"

    const previous = info.oneDayAverage[metric] ?? NaN
    const percent = (current - previous) / previous * 100
    if (!Number.isFinite(percent)) return formattedCurrent
    const formattedPercent = `${percent >= 0 ? "+" : ""}${percent.toFixed(1)}%`
    return `${formattedCurrent} (${formattedPercent})`
  }

  format(num: number) {
    if (Number.isNaN(num)) return null
    return formatNumber(num, 2, true)
  }
}
