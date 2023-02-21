import { SimpleCommand } from "./Command.js"
import { Bridge } from "../../Bridge.js"
import { Bazaar } from "../../../api/Bazaar.js"


export class BazaarCommand implements SimpleCommand {
  aliases = ["bazaar", "bz"]

  constructor(private bazaar: Bazaar) {}

  usage = "<item name>"

  async execute(args: string[]) {
    let formatter = Intl.NumberFormat("en", { notation: "compact" })
    let product = this.bazaar.getClosestProduct(args.join(" "))
    if (product == null) return `No product found!`
    return `Bazaar data for ${product.name}: insta-buy: ${formatter.format(product.instabuy ?? NaN)}, insta-sell: ${formatter.format(product.instasell ?? NaN)}`
  }
}
