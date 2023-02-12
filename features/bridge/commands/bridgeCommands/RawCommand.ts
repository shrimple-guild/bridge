import { Bridge } from "../../Bridge.js"
import { BridgeCommand } from "./Command.js"
//import { minecraftBot } from "../../minecraft/MinecraftBot.js"
//import { discordBot } from "../../../../discord/DiscordBot.js"

export class RawCommand implements BridgeCommand {
    aliases = ["raw"]
    usage = "<data>"

    async execute(bridge: Bridge, args: string[], isStaff?: boolean) {
      if (args.length === 0) return "You need to give me some data to parse."
      if (!isStaff) return "No permission"
      const message = args.join(" ")
      bridge.chatAsBot(message)
    }
} 