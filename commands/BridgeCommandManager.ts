import { BridgeCommand } from "./bridgeCommands/Command.js"
import { AuctionCommand } from "./bridgeCommands/AuctionCommand.js"
import { BazaarCommand } from "./bridgeCommands/BazaarCommand.js"
import { EightballCommand } from "./bridgeCommands/EightBallCommand.js"
import { ElectionCommand } from "./bridgeCommands/ElectionCommand.js"
import { HelpCommand } from "./bridgeCommands/HelpCommand.js"
import { PickCommand } from "./bridgeCommands/PickCommand.js"
import { PingCommand } from "./bridgeCommands/PingCommand.js"
import { RainTimerCommand } from "./bridgeCommands/RainTimerCommand.js"
import { RawCommand } from "./bridgeCommands/RawCommand.js"
import { ReloadCommand } from "./bridgeCommands/ReloadCommand.js"
import { SkillsCommand } from "./bridgeCommands/SkillsCommand.js"
import { SlayerCommand } from "./bridgeCommands/SlayerCommand.js"
import { TrophyFishCommand } from "./bridgeCommands/TrophyFishCommand.js"
import { CataCommand } from "./bridgeCommands/CataCommand.js"
import { HypixelAPI } from "../api/HypixelAPI.js"

export class BridgeCommandManager {
  commands: BridgeCommand[]

  constructor(public prefix: string, public botUsername: string, hypixelAPI: HypixelAPI) {
    this.commands = [
      new AuctionCommand(),
      new BazaarCommand(),
      new CataCommand(hypixelAPI),
      new EightballCommand(),
      new ElectionCommand(),
      new HelpCommand(this),
      new PickCommand(),
      new PingCommand(),
      new RainTimerCommand(),
      new RawCommand(botUsername),
      new ReloadCommand(),
      new SkillsCommand(hypixelAPI),
      new SlayerCommand(hypixelAPI),
      new TrophyFishCommand(hypixelAPI)
    ]
  }

  async onChatMessage(message: string, isStaff: boolean) {
    if (!message.startsWith(this.prefix)) return
    const commStr = message.substring(this.prefix.length)
    const args = commStr.trim().split(" ")
    const commandName = args.shift()

    const command = this.commands.find(comm => comm.aliases.includes(commandName))

    if (!command) return `Command ${commandName} not found, try ${this.prefix}help`
    try {
      return await command.execute(args, isStaff)
    } catch (e: any) {
      console.error(e)
      if (e?.message) {
        return e.message
      } else {
        return `Something went wrong, API might be down?`
      }
    }
  }
}