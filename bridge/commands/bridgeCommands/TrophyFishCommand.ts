import { SimpleCommand } from "./Command.js"
import { titleCase } from "../../../utils/Utils.js"
import { fetchUuid } from "../../../utils/playerUtils.js"
import { HypixelAPI } from "../../../api/HypixelAPI.js"
import { trophyFishNames } from "../../../api/TrophyFish.js"
import { Bridge } from "../../Bridge.js"

export class TrophyFishCommand implements SimpleCommand {
    aliases = ["trophy", "trophyfish", "tfish"]
    usage = "<player:[profile|bingo|main]> <total | tiers | [fish]>"

    constructor(private hypixelAPI: HypixelAPI) {}

    async execute(args: string[]) {
      if (args.length < 2) return `Syntax: trophy ${this.usage}`
      const playerArg = args.shift()!.split(":")
      const playerName = playerArg[0]
      const profileArg = playerArg[1]?.toLowerCase()
      const arg = args.shift()!
      let fish = args?.join(" ")
      if (arg !== "total" && arg !== "tiers") fish = [arg, fish].join(" ")
      let message
      const uuid = await fetchUuid(playerName)
      const profiles = await this.hypixelAPI.fetchProfiles(uuid)
      const profile = profiles.getByQuery(profileArg)
      const cuteName = profile.cuteName
      const trophyFish = profile.trophyFish
      message = `${titleCase(arg)} data for ${playerName} (${cuteName}): `
      switch (arg) {
        case "total":
          message += `Total trophy fish caught: ${trophyFish.total}`
          break
        case "tiers":
          message = `Trophy fish tiers unlocked for ${playerName} (${cuteName}): `
          message += `Bronze: ${trophyFish.unlocked("bronze")}/18 | Silver: ${trophyFish.unlocked("silver")}/18 | Gold: ${trophyFish.unlocked("gold")}/18 | Diamond: ${trophyFish.unlocked("diamond")}/18`
          break
        default:
          const fishMatch = this.guessFish(fish)
          if (!fishMatch) return "Invalid fish."
          const name = fishMatch
          const fishData = trophyFish.get(name)
          message = `${name} caught for ${playerName} (${cuteName}): `
          message += `Total ${titleCase(name)}: ${fishData.total} | Bronze: ${fishData.bronze} | Silver: ${fishData.silver} | Gold: ${fishData.gold} | Diamond: ${fishData.diamond}`
          break
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
