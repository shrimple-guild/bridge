import { BridgeCommand } from "./Command.js"
import { jaroWinkler as jaroDistance } from "jaro-winkler-typescript"
import { titleCase } from "../../utils/Utils.js"
import auctionAliases from "../../data/auctionAliases.json" assert { type: "json" }

let cachedLowestBins: { [id: string]: number } = {}

// get full names from api data + additional data
const itemResults = (await (await fetch(`https://api.hypixel.net/resources/skyblock/items`)).json() as { items: { id: string, name: string }[] }).items

let itemApiNames = Object.fromEntries(itemResults.map(itemData => {
  let aliases: string[] = []
  return [itemData.id, { id: itemData.id, name: itemData.name, aliases: aliases }]
}))

let itemRemappings = Object.fromEntries(Object.entries(auctionAliases).map(([id, aliases]) => {
  let aliasArray = aliases.replace("_", " ").split(",")
  return [id, {
    id: id,
    name: titleCase(aliasArray[0]),
    aliases: aliasArray.map(alias => titleCase(alias))
  }]
}))

const remapped = Object.values({ ...itemApiNames, ...itemRemappings })
let fullExpandedNames: { id: string, name: string, alias: string }[] = []
remapped.forEach(product => {
  fullExpandedNames.push({ id: product.id, name: product.name, alias: product.name.trim().toUpperCase() })
  product.aliases.forEach(alias => {
    fullExpandedNames.push({ id: product.id, name: product.name, alias: alias.trim().toUpperCase() })
  })
})

// names that are actually in lbin, rather than items that can't actually be sold
let expandedNames = fullExpandedNames

export class AuctionCommand implements BridgeCommand {
  aliases = ["ah", "lowestbin", "lbin", "lb"]

  usage = "<item name>"
  
  closestAuctionProduct(phrase: string[]) {
    let uppercase = phrase.map(phrase => phrase.trim().toUpperCase())
    let joined = uppercase.join(" ")
    let perfectMatches: { id: string, name: string, alias: string }[] = []

    perfectMatches = expandedNames.filter((product) => {
      return uppercase.some((phrase) => product.alias.includes(phrase))
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

  async execute(args: string[]) {
    let formatter = Intl.NumberFormat("en", { notation: "compact" })
    let { id, name } = this.closestAuctionProduct(args)
    let lowestBin = cachedLowestBins[id]
    return `Lowest BIN for ${name} is ${formatter.format(lowestBin)}`
  }
}

(async function updateBinCache() {
  try {
    const auctionResponse = await fetch(`https://moulberry.codes/lowestbin.json`)
    if (auctionResponse.status === 200) {
      cachedLowestBins = await auctionResponse.json() as { [id: string]: number }
      let binNames = Object.keys(cachedLowestBins)
      expandedNames = fullExpandedNames.filter(nameData => binNames.includes(nameData.id))
    }
  } catch (e) {
    console.error("Error fetching auction data.")
    console.error(e)
  }

  // hypixel updates the api site a bit later than the actual auction data, ~8s is what I've seen
  setTimeout(updateBinCache, 100000)
})();