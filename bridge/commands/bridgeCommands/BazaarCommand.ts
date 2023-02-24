import { SimpleCommand } from "./Command.js"
import { HypixelAPI } from "../../../api/HypixelAPI.js"


export class BazaarCommand implements SimpleCommand {
  aliases = ["bazaar", "bz"]

  constructor(private hypixelAPI: HypixelAPI) {}

  usage = "<item name>"

  async execute(args: string[]) {
    let formatter = Intl.NumberFormat("en", { notation: "compact" })
    const bazaar = this.hypixelAPI.bazaar
    if (bazaar == null) return `Bazaar isn't instantiated! Please report this!`
    let product = await bazaar.getClosestProduct(args.join(" "))
    if (product == null) return `No product found!`
    return `Bazaar data for ${product.name}: insta-buy: ${formatter.format(product.instabuy ?? NaN)}, insta-sell: ${formatter.format(product.instasell ?? NaN)}`
  }
}
