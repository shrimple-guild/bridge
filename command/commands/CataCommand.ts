import { Command } from "./Command.js"
import { secsToTime, formatNumber, titleCase } from "../../utils/Utils.js"
import { fetchProfiles } from "../../utils/apiUtils.js"
import { cataLevel } from "../../utils/skillUtils.js"
import { fetchUuid } from "../../utils/playerUtils.js"
import { resolveProfile } from "../../utils/profileUtils.js"

export class CataCommand implements Command {
  aliases = ["cata"]
  usage = "<player:[profile|bingo|main]> <level | classLevel [class] | floor [f[0-7]|m[1-7]]>"

  floorArgRegex = /^(f[0-7]|m[1-7])$/
  async execute(args: string[]) {
    if (args.length < 2) return `Syntax: cata ${this.usage}`
    const playerArg = args.shift()!.split(":")
    const playerName = playerArg[0]
    const profileArg = playerArg[1]?.toLowerCase()
    const commandArg = args.shift()!
    const optionalArg = args.shift()
    if (commandArg === "floor" && !optionalArg?.match(this.floorArgRegex)) return `Incorrect floor. Syntax: cata ${this.usage}`
    else if (commandArg === "classLevel" && !optionalArg) return `Incorrect class. Syntax: cata ${this.usage}`
    let message
    try {
      const uuid = await fetchUuid(playerName)
      const profiles = await fetchProfiles(uuid)
      const profile = resolveProfile(profileArg, uuid, profiles)
      const cuteName = profile.cute_name
      const dungeonData = profile?.members?.[uuid]?.dungeons
      if (!dungeonData) {
          return `No data found for ${cuteName} profile; is your skills API on?`
      }
      switch (commandArg) {
        case "level":
        case "classLevel":
          let xp
          if (commandArg === "level") {
              xp = dungeonData.dungeon_types?.catacombs.experience
          } else {
              xp = dungeonData.player_classes?.[optionalArg!].experience
          }
          if (!xp) return `No data found for ${cuteName} profile`
          const cataData = cataLevel(xp)
          message = `${titleCase(commandArg === "classLevel" ? optionalArg! : "Catacombs")} level for ${playerName} (${cuteName}): `
          message += `${formatNumber(cataData.level, 2, false)} | `
          message += `Total XP: ${formatNumber(cataData.totalXp, 2, true)} | `
          if (cataData.level == cataData.maxLevel) {
              message += `Overflow XP: ${formatNumber(cataData.overflow, 2, true)}`
          } else {
              message += `XP for level ${Math.ceil(cataData.level)}: ${formatNumber(cataData.xpToNext, 2, true)}`
          }
          break
        case "floor":
          const floor = optionalArg!.charAt(1)
          const type = optionalArg!.charAt(0) === "f" ? "catacombs" : "master_catacombs"
          const comps = dungeonData.dungeon_types?.[type]?.tier_completions?.[floor]
          if (!comps) return "No data found for this floor."
          const fastestRun = secsToTime(dungeonData.dungeon_types?.[type]?.fastest_time?.[floor] / 1000)
          const fastestRunS = secsToTime(dungeonData.dungeon_types?.[type]?.fastest_time_s?.[floor] / 1000)
          const fastestRunSPlus = secsToTime(dungeonData.dungeon_types?.[type]?.fastest_time_s_plus?.[floor] / 1000)
          message = `${titleCase(type).replace("_", " ")} floor ${floor} for ${playerName} (${cuteName}): `
          message += `Completions: ${comps} | `
          message += `Fastest time: ${fastestRun} | `
          message += `Fastest time (S): ${fastestRunS} | `
          message += `Fastest time (S+): ${fastestRunSPlus}`
          break
        default:
          return `Syntax: cata ${this.usage}`
      }
    } catch (e) {
      message = "Something went wrong, API might be down!"
      console.error(e)
    }
    return message
  }
} 
