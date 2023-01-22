import { readFileSync } from "fs"
import jaroDistance from "jaro-winkler"
import fetch from "node-fetch"

let cachedBazaarData: any = {}

let bazaarNames = JSON.parse(readFileSync("./data/bazaar.json", "utf-8"))
let expandedNames: any = []
bazaarNames.forEach((product: { name: any; aliases: any; id: any }) => {
  expandedNames.push(...([product.name, ...product.aliases].map(alias => { return { id: product.id, name: product.name, alias: alias.toUpperCase() } })))
})

export class BazaarCommand implements Command {
    aliases = ["bazaar", "bz"]
    
    closestBazaarProduct(phrase: string) {
        let uppercase = phrase.toUpperCase()
        let perfectMatches = expandedNames.filter((product: { alias: string | string[] }) => product.alias.includes(uppercase))
        let bestMatch = (perfectMatches.length == 1)
        ? perfectMatches[0]
        : expandedNames.sort((a: { alias: string }, b: { alias: string }) => jaroDistance(uppercase, b.alias) - jaroDistance(uppercase, a.alias))[0]
        return { id: bestMatch.id, name: bestMatch.name }
    }
    
    async execute(args: string[]) {
        let formatter = Intl.NumberFormat("en", { notation: "compact" })
        let name = args.join(" ")
        let { id: bestId, name: bestName } = this.closestBazaarProduct(name)
        let bazaarData = cachedBazaarData[bestId]
        return `Bazaar data for ${bestName}: ${formatter.format(bazaarData.sellPrice)} sell, ${formatter.format(bazaarData.buyPrice)} buy`
    }
}

(async function updateBazaarCache() {
    let lastBazaarUpdate = 0
    // const lastBazaarUpdate = Date.now()
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
    setTimeout(updateBazaarCache, Math.max(0, lastBazaarUpdate + 68500 - Date.now()))
  })();