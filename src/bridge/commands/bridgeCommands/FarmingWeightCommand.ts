import { SimpleCommand } from "./Command.js"
import { HypixelAPI } from "../../../api/HypixelAPI.js"
import { formatNumber } from "../../../utils/utils.js"

export class FarmingWeightCommand extends SimpleCommand {
  aliases = ["fw", "fweight", "elite"]
  usage = "<player:[profile|bingo|main]>"

  constructor(private hypixelAPI: HypixelAPI) {
    super()
  }

  async execute(args: string[]) {
    if (args.length < 1) this.throwUsageError()
    const playerArg = args.shift()!.split(":")
    const playerName = playerArg[0]
    const profileArg = playerArg[1]?.toLowerCase()
    
    const uuid = await this.hypixelAPI.mojang.fetchUuid(playerName)
    const profiles = await this.hypixelAPI.fetchProfiles(uuid)
    const profile = profiles.getByQuery(profileArg)

    const weight = profile.farmingWeight
    if (!weight) this.error(`The profile ${profile.cuteName} has collections disabled!`)
    
    const totalWeight = formatNumber(weight.total, 2, false)
    const collectionWeight = formatNumber(weight.collection, 2, false)
    const bestCollections = Object.entries(weight.collections).sort(([crop1, collection1], [crop2, collection2]) => (
      collection2 - collection1)
    ).slice(0, 2).map(([crop, weight]) => `${crop} (${formatNumber(weight, 2, false)})`).join(", ")
    return `Farming weight for ${playerName} (${profile.cuteName}): ${totalWeight}. Collections (${collectionWeight}): ${bestCollections}.`
  }
} 

