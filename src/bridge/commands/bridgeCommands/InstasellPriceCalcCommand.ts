import { SimpleCommand } from "./Command.js"
import { HypixelAPI } from "../../../api/HypixelAPI.js"


export class InstasellPriceCalcCommand implements SimpleCommand {
  aliases = ["is", "bzis", "instasell"]

  constructor(private hypixelAPI: HypixelAPI) {}

  usage = "<item name>, <amount>"

  async execute(args: string[]) {
    const args2 = args.join(" ").split(",")
    if (args2.length != 2) return `Syntax: ${this.usage}`
    const bazaar = this.hypixelAPI.bazaar
    if (!bazaar) return `Bazaar isn't instantiated! Please report this!`
    let amount = parseInt(args2.pop() || "0")
    const startingAmount = amount
    if (isNaN(amount) || amount <= 0) return `Invalid amount!`
    let product = await bazaar.getClosestProduct(args2.join(" "))
    if (!product) return `No product found!`
    
    const summary = product.sellSummary
    if (!summary.length) return `Could not sell any ${product.name}`
    let money = 0
    while (amount > 0) {
        let buySummary = summary.shift()
        if (!buySummary) break
        let buyAmount = Math.min(amount, buySummary.amount)
        money += buyAmount * buySummary.pricePerUnit
        amount -= buyAmount
    }
    let returnString = `Total earned from selling ${startingAmount - amount} ${product.name}: ${this.format(money)} coins`
    if (amount > 0) returnString += `, could not sell ${amount} items`
    return returnString
  }

  format(num?: number) {
    if (!num) return "Not available"
    let formatter = Intl.NumberFormat("en", { notation: "compact" })
    return formatter.format(num)
  }
}
