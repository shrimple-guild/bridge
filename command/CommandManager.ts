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

export class CommandManager {
    commands: Command[] = []
    constructor(public prefix: string) {
        this.registerCommands([
            new AuctionCommand(),
            new BazaarCommand(),
            new CataCommand(),
            new EightballCommand(),
            new ElectionCommand(),
            new HelpCommand(this),
            new PickCommand(),
            new PingCommand(),
            new RainTimerCommand(),
            new RawCommand(),
            new ReloadCommand(),
            new SkillsCommand(),
            new SlayerCommand(),
            new TrophyFishCommand()
        ])
    }

    registerCommand(command: Command) {
        this.commands.push(command)
    }

    registerCommands(commandList: Command[]) {
        commandList.forEach(comm => {
            this.registerCommand(comm)
        })
    }

    async onChatMessage(message: string, isStaff: boolean) {
        if (!message.startsWith(this.prefix)) return
        const commStr = message.substring(this.prefix.length)
        const args = commStr.trim().split(" ")
        const commandName = args.shift()

        const command = this.commands.find(comm => comm.aliases.includes(commandName))

        if (!command) return `Command ${commandName} not found, try ${this.prefix}help`
        const response = await command.execute(args, isStaff)
        return response
    }
}