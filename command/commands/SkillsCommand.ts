import { Command } from "./Command.js"
import { formatNumber, titleCase } from "../../utils/Utils.js"
import { fetchProfiles, fetchUuid } from "../../utils/apiUtils.js"
import { isSkill, skillLevel } from "../../utils/skillUtils.js"

export class SkillsCommand implements Command {
    aliases = ["skill"]
    usage = "<player> <skill> [profileName | \"bingo\"]"

    async execute(args: string[]) {
        if (args.length < 2) return `Syntax: skills ${this.usage}`
        const playerName = args[0]
        const skillName = args[1]?.toLowerCase()
        const profileArgument = args[2]?.toLowerCase()
        let message

        try {
          if (!isSkill(skillName)) throw new Error(`"${titleCase(skillName)}" is not a skill!`)
          const uuid = await fetchUuid(playerName)
          const profiles = await fetchProfiles(uuid)

          // Fetch correct profile
          let profile
          if (profileArgument == null) {
            profile = profiles.find(p => p.selected) 
          } else if (profileArgument == "bingo") {
            profile = profiles.find(p => p.game_mode == "bingo") 
          } else {
            profile = profiles.find(p => p.cute_name?.toLowerCase() == profileArgument)
          }
          if (profile == null) throw new Error("Profile could not be found.")

          const cuteName = profile.cute_name
          const skillExp = profile?.members?.[uuid]?.[`experience_skill_${skillName}`]
          if (skillExp == null) {
            throw new Error(`No data found for ${cuteName} profile; is your skills API on?`)
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
          message = e!.toString()
        }
        return message
    }
} 