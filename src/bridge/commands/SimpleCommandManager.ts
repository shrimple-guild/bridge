import { config } from "../../utils/config.js";
import { SimpleCommand } from "./bridgeCommands/Command.js"
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
import { HypixelAPI } from "../../api/HypixelAPI.js"
import { Bridge } from "../Bridge.js"
import { LoggerCategory } from "../../utils/Logger.js"
import { ContestCommand } from "./bridgeCommands/ContestCommand.js"
import { FarmingWeightCommand } from "./bridgeCommands/FarmingWeightCommand.js"
import { FortuneCookieCommand } from "./bridgeCommands/FortuneCookieCommand.js"
import { UpdateRoleCommand } from "./bridgeCommands/UpdateRoleCommand.js"
import { InstasellPriceCalcCommand } from "./bridgeCommands/InstasellPriceCalcCommand.js"
import { InstabuyPriceCalcCommand } from "./bridgeCommands/InstabuyPriceCalcCommand.js";

export class SimpleCommandManager {
  commands: SimpleCommand[]

  constructor(private hypixelAPI: HypixelAPI, private logger?: LoggerCategory, public prefix?: string) {
    this.commands = [
      new AuctionCommand(),
      new BazaarCommand(hypixelAPI),
      new CataCommand(hypixelAPI),
      new EightballCommand(),
      new ElectionCommand(),
      new HelpCommand(this),
      new PickCommand(),
      new PingCommand(),
      // new RainTimerCommand(),
      new SkillsCommand(hypixelAPI),
      new SlayerCommand(hypixelAPI),
      new TrophyFishCommand(hypixelAPI),
      new ContestCommand(hypixelAPI),
      new FarmingWeightCommand(hypixelAPI),
      new FortuneCookieCommand(),
      new InstasellPriceCalcCommand(hypixelAPI),
      new InstabuyPriceCalcCommand(hypixelAPI)
    ]
  }

  addBridgeCommands(bridge: Bridge) {
    this.commands.push(
      new RawCommand(bridge), 
      new ReloadCommand(bridge),
    )
    if (config.guildRoles && config.guildRoles.length > 0) {
      this.commands.push(new UpdateRoleCommand(bridge, this.hypixelAPI))
    }
  }

  async execute(message: string, isStaff: boolean, username?: string) {
    const prefix = this.prefix ?? config.bridge.prefix
    if (!message.startsWith(prefix)) return
    const commStr = message.substring(prefix.length)
    const args = commStr.trim().split(" ")
    const commandName = args.shift()?.toLowerCase()

    const command = this.commands.find(comm => comm.aliases.includes(commandName))

    if (!command) return `Command ${commandName} not found, try ${prefix}help`

    this.logger?.info(`Command processing (staff: ${isStaff}): ${message}`)
    let response
    try {
      response = await command.execute(args, isStaff, username)
    } catch (e: any) {
      this.logger?.error("Command error!", e)
      response = e.toString()
    }
    this.logger?.info(`Response: ${response}`)
    if (response) {
      response += ` <@${Math.random().toString(36).substring(2)}>`
    }
    return response
  }
}