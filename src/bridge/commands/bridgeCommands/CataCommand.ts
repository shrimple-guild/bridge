import { SimpleCommand } from "./Command.js"
import { msToTime, formatNumber, titleCase } from "../../../utils/utils.js"
import { isDungeonClass } from "../../../api/Dungeons.js"
import { HypixelAPI } from "../../../api/HypixelAPI.js"

const floorArgRegex = /^(f[0-7]|m[1-7])$/

export class CataCommand extends SimpleCommand {
  aliases = ["cata"]
  usage = "<player:[profile|bingo|main]> [class|f[0-7]|m[1-7]]"

  constructor(private hypixelAPI: HypixelAPI) {
    super()
  }

  async execute(args: string[]) {
    if (args.length < 1) this.throwUsageError()
    const playerArg = args.shift()!.split(":")
    const playerName = playerArg[0]
    const profileArg = playerArg[1]?.toLowerCase()
    const commandArg = args[0]?.toLowerCase()
    let message
    const uuid = await this.hypixelAPI.mojang.fetchUuid(playerName)
    const profiles = await this.hypixelAPI.fetchProfiles(uuid)
    const profile = profiles.getByQuery(profileArg)
    const floorMatch = commandArg?.match(floorArgRegex)
    if (floorMatch != null) {
      const floor = parseInt(commandArg.charAt(1))
      const type = commandArg.charAt(0) === "f" ? "normal" : "master"
      const dungeonFloor = profile.dungeons.floor(type, floor)
      const comps = dungeonFloor?.completions
      if (!comps) this.error("No data found for this floor.")
      const fastestRun = msToTime(dungeonFloor?.pb)
      const fastestRunS = msToTime(dungeonFloor?.sPb)
      const fastestRunSPlus = msToTime(dungeonFloor?.sPlusPb)
      message = `${commandArg.toUpperCase()} data for ${playerName} (${profile.cuteName}): `
      message += `Completions: ${comps} | `
      message += `Fastest time: ${fastestRun} | `
      message += `Fastest time (S): ${fastestRunS ?? "None"} | `
      message += `Fastest time (S+): ${fastestRunSPlus ?? "None"}`
    } else {
      let level
      if (isDungeonClass(commandArg)) {
        level = profile.dungeons.classes[commandArg]
        message = `${titleCase(commandArg)} `
      } else {
        message = "Catacombs "
        level = profile.dungeons.level
      }
      message += `level for ${playerName} (${profile.cuteName}): `
      message += `${formatNumber(level.fractionalLevel, 2, false)} | `
      message += `Total XP: ${formatNumber(level.xp, 2, true)} | `
      if (level.level == level.maxLevel) {
        message += `Overflow XP: ${formatNumber(level.overflow, 2, true)}`
      } else {
        message += `XP for level ${level.level + 1}: ${formatNumber(level.xpToNext, 2, true)}`
      }
    }
    return message
  }
} 

