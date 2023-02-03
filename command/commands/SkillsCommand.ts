import { Command } from "./Command.js"
import { formatNumber, titleCase } from "../../utils/Utils.js"
import { fetchProfiles } from "../../utils/apiUtils.js"
import { isSkill, skillLevel } from "../../utils/skillUtils.js"
import { fetchUuid } from "../../utils/playerUtils.js"

export class SkillsCommand implements Command {
  aliases = ["skill"]
  usage = "<player:[profile|bingo]> <skill>"

  async execute(args: string[]) {
    if (args.length < 2) return `Syntax: skill ${this.usage}`
    const playerArg = args.shift()!.split(":")
    const playerName = playerArg[0]
    const profileArg = playerArg[1]?.toLowerCase()
    const skillName = args.shift()!
    let message
    try {
      if (!isSkill(skillName)) return `"${titleCase(skillName)}" is not a skill!`
      const uuid = await fetchUuid(playerName)
      const profiles = await fetchProfiles(uuid)

      // Fetch correct profile
      let profile
      if (!profileArg) {
        profile = profiles.find(p => p.selected)
      } else if (profileArg === "bingo") {
        profile = profiles.find(p => p.game_mode == "bingo")
      } else {
        profile = profiles.find(p => p.cute_name?.toLowerCase() === profileArg)
      }
      if (!profile) {
        return "Profile could not be found."
      }

      const cuteName = profile.cute_name
      const skillExp = profile?.members?.[uuid]?.[`experience_skill_${skillName}`]
      if (!skillExp) {
        return `No data found for ${cuteName} profile; is your skills API on?`
      }
      const skillData = skillLevel(skillName, skillExp)
      message = `${titleCase(skillName)} level for ${playerName} (${cuteName}): `
      message += `${formatNumber(skillData.level, 2, false)} | `
      message += `Total XP: ${formatNumber(skillData.totalXp, 2, true)} | `
      if (skillData.level == skillData.maxLevel) {
        message += `Overflow XP: ${formatNumber(skillData.overflow, 2, true)}`
      } else {
        message += `XP for level ${Math.ceil(skillData.level)}: ${formatNumber(skillData.xpToNext, 2, true)}`
      }
    } catch (e) {
      message = "Something went wrong, API might be down!"
      console.error(e)
    }
    return message
  }
} 