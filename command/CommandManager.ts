import { HelpCommand } from "./commands/HelpCommand"
import { ElectionCommand } from "./commands/ElectionCommand"
import { RainTimerCommand } from "./commands/RainTimerCommand"
import { AuctionCommand } from "./commands/AuctionCommand"
import { BazaarCommand } from "./commands/BazaarCommand"
import { ReloadCommand } from "./commands/ReloadCommand"

export class CommandManager {
    commands: Command[] = []
    prefix: string

    mcController: any
    discordBot: any
    constructor(prefix: string, mcController: any, discordBot: any) {
        this.prefix = prefix
        this.mcController = mcController
        this.discordBot = discordBot
        this.registerCommands([
            new HelpCommand(this),
            new ReloadCommand(this),
            new PingCommand(),
            new ElectionCommand(),
            new RainTimerCommand(),
            new AuctionCommand(),
            new BazaarCommand()
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

    async onChatMessage(message: string) {
        if (!message.startsWith(this.prefix)) return

        const command = message.substring(this.prefix.length)
        const args = command.split(" ")
        const commandName = args.shift()

        const commandObject = this.commands.find(comm => comm.aliases.includes(commandName))

        if (!commandObject) return `Command ${commandName} not found`

        return await commandObject.execute(args)
    }
}