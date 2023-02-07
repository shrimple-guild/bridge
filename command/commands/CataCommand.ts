import { Command } from "./Command.js"
import { secsToTime, formatNumber, titleCase } from "../../utils/Utils.js"
import { fetchProfiles } from "../../utils/apiUtils.js"
import { cataLevel } from "../../utils/skillUtils.js"
import { fetchUuid } from "../../utils/playerUtils.js"
import { resolveProfile } from "../../utils/profileUtils.js"

export class CataCommand implements Command {
  aliases = ["cata"]
  usage = "<player:[profile|bingo|main]> [class|f[0-7]|m[1-7]]"

  private floorArgRegex = /^(f[0-7]|m[1-7])$/
  private classes = ["healer", "tank", "berserk", "mage", "archer"]

  async execute(args: string[]) {
    if (args.length < 1) return `Syntax: cata ${this.usage}`
    const playerArg = args.shift()!.split(":")
    const playerName = playerArg[0]
    const profileArg = playerArg[1]?.toLowerCase()
    const commandArg = args.join("").toLowerCase()
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
      const floor = commandArg?.match(this.floorArgRegex)
      if (floor != null) {
        const floor = commandArg!.charAt(1)
        const type = commandArg!.charAt(0) === "f" ? "catacombs" : "master_catacombs"
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
      } else {
        let xp
        if (commandArg == null) {
          xp = dungeonData.dungeon_types?.catacombs.experience
        } else if (this.classes.includes(commandArg)) {
          xp = dungeonData.player_classes?.[commandArg!].experience
        } else {
          return "Must specify a floor (f1-7 or m1-7) or a class (archer, tank, berserk, mage, or healer)."
        }
        if (!xp) return `No data found for ${cuteName} profile`
        const cataData = cataLevel(xp)
        message = `${titleCase(commandArg != null ? commandArg! : "Catacombs")} level for ${playerName} (${cuteName}): `
        message += `${formatNumber(cataData.level, 2, false)} | `
        message += `Total XP: ${formatNumber(cataData.totalXp, 2, true)} | `
        if (cataData.level == cataData.maxLevel) {
          message += `Overflow XP: ${formatNumber(cataData.overflow, 2, true)}`
        } else {
          message += `XP for level ${Math.ceil(cataData.level)}: ${formatNumber(cataData.xpToNext, 2, true)}`
        }
      }
    } catch (e) {
      message = "Something went wrong, API might be down!"
      console.error(e)
    }
    return message
  }
} 
