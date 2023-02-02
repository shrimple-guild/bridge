import { Command } from "./Command.js"
import { readFileSync } from "fs"
import fetch from "node-fetch"
import fuzzysort from "fuzzysort"

let cachedBazaarData: any = {}

const bazaarNames = JSON.parse(readFileSync("./data/bazaar.json", "utf-8")) as [{ name: string, id: string, aliases: string[] }]
let expandedNames: {id: string, name: string, alias: Fuzzysort.Prepared}[] = []
bazaarNames.forEach((product) => {
  [...product.aliases, product.name].forEach(alias => {
    expandedNames.push({ id: product.id, name: product.name, alias: fuzzysort.prepare(alias.toUpperCase()) })
  })
})

export class BazaarCommand implements Command {
  aliases = ["bazaar", "bz"]

  usage = "<item name>"
  
  closestBazaarProduct(phrase: string) {
    let uppercase = phrase.toUpperCase()
    let bestMatch = fuzzysort.go(uppercase, expandedNames, { limit: 1, key: "alias"})?.[0]?.obj
    if (bestMatch != null) {
      return { id: bestMatch.id, name: bestMatch.name }
    }
  }

  execute(args: string[]) {
    let formatter = Intl.NumberFormat("en", { notation: "compact" })
    let name = args.join(" ")
    let closestProduct = this.closestBazaarProduct(name)
    if (closestProduct == null) return `No matching item found!`
    let { id: bestId, name: bestName } = closestProduct
    let bazaarData = cachedBazaarData[bestId].quick_status
    return `Bazaar data for ${bestName}: insta-buy: ${formatter.format(+bazaarData.buyPrice)}, insta-sell: ${formatter.format(+bazaarData.sellPrice)}`
  }
}

(async function updateBazaarCache() {
  try {
    const bazaarResponse = await fetch(`https://api.hypixel.net/skyblock/bazaar`)
    if (bazaarResponse.status === 200) {
      const bazaarJson = await bazaarResponse.json() as any
      cachedBazaarData = bazaarJson["products"]
    }
  } catch (e) {
    console.error("Error fetching bazaar data.")
    console.error(e)
  }
  setTimeout(updateBazaarCache, 100000)
})();
