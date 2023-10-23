import { SimpleCommand } from "./Command.js"
import { HypixelAPI } from "../../../api/HypixelAPI.js"
import { formatNumber } from "../../../utils/utils.js"


export class BazaarCommand implements SimpleCommand {
  aliases = ["bazaar", "bz"]

  constructor(private hypixelAPI: HypixelAPI) {}

  usage = "<item name>"

  async execute(args: string[]) {
    const bazaar = this.hypixelAPI.bazaar
    if (bazaar == null) return `Bazaar isn't instantiated! Please report this!`
    let product = await bazaar.getClosestProduct(args.join(" "))
    if (product == null) return `No product found!`
    return `Bazaar data for ${product.name}: insta-buy: ${this.format(product.instabuy)}, insta-sell: ${this.format(product.instasell)}`
  }

  format(num?: number) {
    if (!num) return "Not available"
    return formatNumber(num, 2, true)
  }
}
