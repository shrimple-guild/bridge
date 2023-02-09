import { Command } from "./Command.js"
import { apiKey, formatNumber, titleCase } from "../../utils/Utils.js"
import { fetchUuid } from "../../utils/playerUtils.js"
import { HypixelAPI } from "../../api/HypixelAPI.js"
import { isSlayer } from "../../api/Slayers.js"

export class SlayerCommand implements Command {
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
    try {
      if (!slayerName) return "A slayer name must be specified!"
      const uuid = await fetchUuid(playerName)
      const profiles = await this.hypixelAPI.fetchProfiles(uuid)
      const profile = profiles.getByQuery(profileArg)
      if (!isSlayer(slayerName)) return `${titleCase(slayerName)} is not a valid slayer name!`
      const slayer = profile.slayers[slayerName]
      message = `${titleCase(slayerName)} slayer data for ${playerName} (${profile.cuteName}): `
      message += `Total XP: ${formatNumber(slayer.level.xp, 2, true)} | Tier kills: `
      message += `(${slayer.kills.join(" | ")})`
    } catch (e: any) {
      if (e?.message) {
        message = e.message
      } else {
        message = `Something went wrong, API might be down?`
      }
      console.error(e)
    }
  }
} 

async function testSlayerCommand() {
  const testAPI = new HypixelAPI(apiKey)
  const command = new SlayerCommand(testAPI)
  console.log(await command.execute(["appable:orange", "blaze"]))
}
