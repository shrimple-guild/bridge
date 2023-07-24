import { SimpleCommand } from "./Command.js"
import { formatNumber, titleCase } from "../../../utils/utils.js"
import { HypixelAPI } from "../../../api/HypixelAPI.js"
import { resolveSlayer } from "../../../api/Slayers.js"

export class SlayerCommand implements SimpleCommand {
  aliases = ["slayer"]
  usage = "<player:[profile|bingo|main]> <slayer>"

  constructor(private hypixelAPI: HypixelAPI) {}

  async execute(args: string[]) {
    if (args.length < 2) return `Syntax: slayer ${this.usage}`
    const playerArg = args.shift()!.split(":")
    const playerName = playerArg[0]
    const profileArg = playerArg[1]?.toLowerCase()
    const slayerName = args.shift()?.toLowerCase()
    let message
    if (!slayerName) return "A slayer name must be specified!"
    const uuid = await this.hypixelAPI.mojang.fetchUserData(playerName)
    const profiles = await this.hypixelAPI.fetchProfiles(uuid.id)
    const profile = profiles.getByQuery(profileArg)
    const resolvedSlayer = resolveSlayer(slayerName)
    if (!resolvedSlayer) return `${titleCase(slayerName)} is not a valid slayer name!`
    const slayer = profile.slayers[resolvedSlayer]
    message = `${titleCase(resolvedSlayer)} slayer data for ${playerName} (${profile.cuteName}): `
    message += `Total XP: ${formatNumber(slayer.level.xp, 2, true)} | Tier kills: `
    message += `(${slayer.kills.join(" | ")})`
    return message
  }
} 

