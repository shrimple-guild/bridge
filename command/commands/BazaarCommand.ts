import { Command } from "./Command.js"
import { readFileSync } from "fs"
import { jaro as jaroDistance } from "jaro-winkler-typescript"
import fetch from "node-fetch"

let cachedBazaarData: any = {}

let bazaarNames = JSON.parse(readFileSync("./data/bazaar.json", "utf-8")) as [{ name: string, id: string, aliases: string[] }]
let expandedNames: {id: string, name: string, alias: string}[] = []
bazaarNames.forEach((product) => {
  product.aliases.forEach(alias => {
    expandedNames.push({ id: product.id, name: product.name, alias: alias.toUpperCase() })
  })
})

export class BazaarCommand implements Command {
  aliases = ["bazaar", "bz"]

  closestBazaarProduct(phrase: string) {
    let uppercase = phrase.toUpperCase()
    let perfectMatches = expandedNames.filter((product) => product.alias.includes(uppercase))
    let bestMatch = (perfectMatches.length == 1)
      ? perfectMatches[0]
      : expandedNames.sort((a, b) => jaroDistance(uppercase, b.alias) - jaroDistance(uppercase, a.alias))[0]
    return { id: bestMatch.id, name: bestMatch.name }
  }

  async execute(args: string[]) {
    let formatter = Intl.NumberFormat("en", { notation: "compact" })
    let name = args.join(" ")
    let { id: bestId, name: bestName } = this.closestBazaarProduct(name)
    let bazaarData = cachedBazaarData[bestId].quick_status
    return `Bazaar data for ${bestName}: insta-buy: ${formatter.format(+bazaarData.buyPrice)}, insta-sell: ${formatter.format(+bazaarData.sellPrice)}`
  }
}

(async function updateBazaarCache() {
  let lastBazaarUpdate = 0
  try {
    const bazaarResponse = await fetch(`https://api.hypixel.net/skyblock/bazaar`)
    if (bazaarResponse.status === 200) {
      const bazaarJson = await bazaarResponse.json() as any
      lastBazaarUpdate = bazaarJson["lastUpdated"]
      cachedBazaarData = bazaarJson["products"]
    }
  } catch (e) {
    console.error("Error fetching bazaar data.")
    console.error(e)
  }
  setTimeout(updateBazaarCache, Math.max(0, lastBazaarUpdate + 78500 - Date.now()))
})();