import { Command } from "./Command.js"
import { jaroDistance } from "../../utils/Utils.js"
import bazaarNames from "../../data/bazaar.json" assert { type: "json" }
let cachedBazaarData: any = {}

let expandedNames: {id: string, name: string, alias: string}[] = []
bazaarNames.forEach((product) => {
  expandedNames.push({ id: product.id, name: product.name, alias: product.name.replaceAll(/[^a-zA-Z0-9 ]/g, '').toUpperCase() })
  product.aliases.forEach(alias => {
  expandedNames.push({ id: product.id, name: product.name, alias: alias.replaceAll(/[^a-zA-Z0-9 ]/g, '').toUpperCase() })
  })
})

export class BazaarCommand implements Command {
  aliases = ["bazaar", "bz"]

  usage = "<item name>"
  
  closestBazaarProduct(phrase: string[]) {
    let uppercase = phrase.map(phrase => phrase.replaceAll(/[^a-zA-Z0-9 ,]/g, '').trim().toUpperCase())
    let joined = uppercase.join(" ")
    let perfectMatches: { id: string, name: string, alias: string }[] = []
    perfectMatches = expandedNames.filter((product) => {
      return uppercase.some((phrase) => product.alias.toUpperCase().includes(phrase))
    })
    let bestMatch
    if (perfectMatches.length > 1) {
      bestMatch = perfectMatches.sort((a, b) => {
      return uppercase.filter(phrase => b.alias.toUpperCase().includes(phrase)).length - uppercase.filter(phrase => a.alias.toUpperCase().includes(phrase)).length
      })[0]
    } else if (perfectMatches.length === 1) {
      bestMatch = perfectMatches[0]
    } else {
      bestMatch = expandedNames.sort((a, b) => jaroDistance(joined, b.alias) - jaroDistance(joined, a.alias))[0]
    }
    return { id: bestMatch.id, name: bestMatch.name }
  }

  execute(args: string[]) {
    let formatter = Intl.NumberFormat("en", { notation: "compact" })
    let { id: bestId, name: bestName } = this.closestBazaarProduct(args)
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