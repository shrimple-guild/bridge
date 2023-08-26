import { SimpleCommand } from "./Command.js"
import { titleCase } from "../../../utils/utils.js"
import { HypixelAPI } from "../../../api/HypixelAPI.js"
import { trophyFishNames } from "../../../api/TrophyFish.js"

export class TrophyFishCommand implements SimpleCommand {
    aliases = ["trophy", "trophyfish", "tfish"]
    usage = "<player:[profile|bingo|main]> [fish]"

    constructor(private hypixelAPI: HypixelAPI) {}

    async execute(args: string[]) {
      if (args.length < 1) return `Syntax: trophy ${this.usage}`
      const playerArg = args.shift()!.split(":")
      const playerName = playerArg[0]
      const profileArg = playerArg[1]?.toLowerCase()
      let fish = args?.join(" ")
      let message
      const uuid = await this.hypixelAPI.mojang.fetchUuid(playerName)
      const profiles = await this.hypixelAPI.fetchProfiles(uuid)
      const profile = profiles.getByQuery(profileArg)
      const cuteName = profile.cuteName
      const trophyFish = profile.trophyFish
      if (fish) {
        const fishMatch = this.guessFish(fish)
        if (!fishMatch) return "Invalid fish."
        const name = fishMatch
        const fishData = trophyFish.get(name)
        message = `${name} caught for ${playerName} (${cuteName}): `
        message += `Total ${titleCase(name)}: ${fishData.total} | Bronze: ${fishData.bronze} | Silver: ${fishData.silver} | Gold: ${fishData.gold} | Diamond: ${fishData.diamond}`
      } else {
        message = `Trophy fish for ${playerName} (${cuteName}): `
        message += `Total: ${trophyFish.total} | `
        message += `Bronze: ${trophyFish.unlocked("bronze")}/18 | Silver: ${trophyFish.unlocked("silver")}/18 | Gold: ${trophyFish.unlocked("gold")}/18 | Diamond: ${trophyFish.unlocked("diamond")}/18`
      }
      return message
    }

    guessFish(input: string) {
      let phrase = input.toLowerCase().trim().split(" ")
      let bestMatches = trophyFishNames.filter(name => {
        return phrase.some((phrase) => name.toLowerCase().includes(phrase))
      })
      let bestMatch
      if (bestMatches.length > 1) {
        bestMatch = bestMatches.sort((a, b) => {
          return phrase.filter(phrase => b.toLowerCase().includes(phrase)).length - phrase.filter(phrase => a.toLowerCase().includes(phrase)).length
        })[0]
      } else if (bestMatches.length === 1) {
        bestMatch = bestMatches[0]
      }
      return bestMatch
    }
} 
