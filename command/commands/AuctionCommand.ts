import { Command } from "./Command.js"
import fetch from "node-fetch"
import { jaro as jaroDistance } from "jaro-winkler-typescript"
import { titleCase } from "../../utils/Utils.js"
import { readFileSync } from "fs"

let cachedLowestBins: { [id: string]: number } = {}

// get full names from api data + additional data
const auctionAliases = JSON.parse(readFileSync("./data/auctionAliases.json", "utf-8")) as { [id: string]: string }
const itemResponse = await fetch(`https://api.hypixel.net/resources/skyblock/items`)
const itemResults = await itemResponse.json() as { success: boolean, lastUpdated: number, items: { id: string, name: string }[] }

let itemApiNames = Object.fromEntries(itemResults.items.map(itemData => {
  let aliases: string[] = []
  return [itemData.id, { id: itemData.id, name: itemData.name, aliases: aliases }]
}))

let itemRemappings = Object.fromEntries(Object.entries(auctionAliases).map(([id, aliases]) => {
  let aliasArray = aliases.split(",")
  return [id, {
    id: id,
    name: titleCase(aliasArray[0]),
    aliases: aliasArray.slice(1)?.map(alias => titleCase(alias))
  }]
}))

const remapped = Object.values({ ...itemApiNames, ...itemRemappings })
const fullExpandedNames: { id: string, name: string, alias: string }[] = []
remapped.forEach((product) => {
  fullExpandedNames.push(...([product.name, ...product.aliases].map(alias => { return { id: product.id, name: product.name, alias: alias.toUpperCase() } })))
})

// names that are actually in lbin, rather than items that can't actually be sold
let expandedNames = fullExpandedNames

export class AuctionCommand implements Command {
  aliases = ["ah", "lowestbin", "lbin", "lb"]

  usage = "<item name>"
  
  closestAuctionProduct(phrase: string) {
    let uppercase = phrase.toUpperCase()
    let perfectMatches = expandedNames.filter(product => product.alias.includes(uppercase))
    let bestMatch = (perfectMatches.length == 1)
      ? perfectMatches[0]
      : expandedNames.sort((a, b) => jaroDistance(uppercase, b.alias) - jaroDistance(uppercase, a.alias))[0]
    return { id: bestMatch.id, name: bestMatch.name }
  }

  async execute(args: string[]) {
    let formatter = Intl.NumberFormat("en", { notation: "compact" })
    let name = args.join(" ")
    let { id: bestId, name: bestName } = this.closestAuctionProduct(name)
    let lowestBin = cachedLowestBins[bestId]
    return `Lowest BIN for ${bestName} is ${formatter.format(lowestBin)}`
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