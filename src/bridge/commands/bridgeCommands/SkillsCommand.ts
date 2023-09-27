import { SimpleCommand } from "./Command.js"
import { formatNumber, titleCase } from "../../../utils/utils.js"
import { HypixelAPI } from "../../../api/HypixelAPI.js"
import { isSkill } from "../../../api/Skills.js"

export class SkillsCommand implements SimpleCommand {
  aliases = ["skill"]
  usage = "<player:[profile|bingo|main]> <skill>"

  constructor(private hypixelAPI: HypixelAPI) {}

  async execute(args: string[]) {
    if (args.length < 2) return `Syntax: skill ${this.usage}`
    const playerArg = args.shift()!.split(":")
    const playerName = playerArg[0]
    const profileArg = playerArg[1]?.toLowerCase()
    const skillName = args.shift()?.toLowerCase()
    let message
    if (skillName == null) return "A skill must be specified!"
    const uuid = await this.hypixelAPI.mojang.fetchUuid(playerName)
    const profiles = await this.hypixelAPI.fetchProfiles(uuid)
    const profile = profiles.getByQuery(profileArg)
    const cuteName = profile.cuteName
    if (!isSkill(skillName)) return `"${titleCase(skillName)}" is not a skill!`
    const skillLevel = profile.skills[skillName]
    if (!skillLevel) return `No data found for ${cuteName} profile; is your skills API on?`
    message = `${titleCase(skillName)} level for ${playerName} (${cuteName}): `
    message += `${formatNumber(skillLevel.fractionalLevel, 2, false)} | `
    message += `Total XP: ${formatNumber(skillLevel.xp, 3, true)} | `
    if (skillLevel.level == skillLevel.maxLevel) {
      message += `Overflow XP: ${formatNumber(skillLevel.overflow, 3, true)}`
    } else {
      message += `XP for level ${skillLevel.level + 1}: ${formatNumber(skillLevel.xpToNext, 2, true)}`
    }
    return message
  }
} 
