import { Command } from "./commands/Command.js"
import { AuctionCommand } from "./commands/AuctionCommand.js"
import { BazaarCommand } from "./commands/BazaarCommand.js"
import { EightballCommand } from "./commands/EightBallCommand.js"
import { ElectionCommand } from "./commands/ElectionCommand.js"
import { HelpCommand } from "./commands/HelpCommand.js"
import { PickCommand } from "./commands/PickCommand.js"
import { PingCommand } from "./commands/PingCommand.js"
import { RainTimerCommand } from "./commands/RainTimerCommand.js"
import { RawCommand } from "./commands/RawCommand.js"
import { ReloadCommand } from "./commands/ReloadCommand.js"
import { SkillsCommand } from "./commands/SkillsCommand.js"
import { SlayerCommand } from "./commands/SlayerCommand.js"
import { TrophyFishCommand } from "./commands/TrophyFishCommand.js"
import { CataCommand } from "./commands/CataCommand.js"
import { HypixelAPI } from "../api/HypixelAPI.js"

export class CommandManager {
  commands: Command[]

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