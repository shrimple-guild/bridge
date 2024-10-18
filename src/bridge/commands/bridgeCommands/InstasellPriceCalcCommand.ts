import { SimpleCommand } from "./Command.js"
import { HypixelAPI } from "../../../api/HypixelAPI.js"
import { formatNumber } from "../../../utils/utils.js"


export class InstasellPriceCalcCommand extends SimpleCommand {
  aliases = ["is", "bzis", "instasell"]

  constructor(private hypixelAPI: HypixelAPI) {
    super()
  }

  usage = "<amount>[k|m|b|s] <item name>"

  async execute(args: string[]) {
    if (args.length < 2) this.throwUsageError()
    const bazaar = this.hypixelAPI.bazaar
    if (!bazaar) this.error(`Bazaar isn't instantiated! Please report this!`)
    const amtString = args.shift() || "0"
    const amtMult = this.amountMult(amtString)
    let amount = Math.round(parseFloat(amtString) * amtMult)
    const startingAmount = amount
    if (isNaN(amount) || amount <= 0) this.error(`Invalid amount, '${amtString}'!`)
    let product = await bazaar.getClosestProduct(args.join(" "))
    if (!product) this.error(`No product found!`)
    
    const sellSummary = product.sellSummary
    if (!sellSummary.length) return `Could not sell any ${product.name}`
    let money = 0
    let avg = 0
    let summaries = 0
    while (amount > 0) {
        let summary = sellSummary.shift()
        if (!summary) break
        let buyAmount = Math.min(amount, summary.amount)
        money += buyAmount * summary.pricePerUnit
        amount -= buyAmount
        avg += summary.pricePerUnit
        summaries++
    }
    avg /= summaries || 1
    let returnString = `Total earned from selling ${startingAmount - amount} ${product.name}: ${this.format(money)} coins, average price per unit: ${this.format(avg)} coins`
    if (amount > 0) returnString += `, could not sell ${amount} items`
    return returnString
  }

  format(num?: number) {
    if (!num) return "Not available"
    return formatNumber(num, 2, true)
  }

  amountMult(amount: string) {
    switch(amount[amount.length - 1]) {
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
}
