import { SimpleCommand } from "./Command.js"
import { SimpleCommandManager } from "../SimpleCommandManager"
import { config } from "../../../utils/config.js"

export class HelpCommand extends SimpleCommand {
    aliases = ["help"]

    constructor(private commandManager: SimpleCommandManager) {
        super()
    }

    async execute(args: string[]) {
        let helpMessage = `Available commands (${config.bridge.prefix}command): `
        this.commandManager.commands.forEach(command => {
            helpMessage += `${command.aliases[0]}, `
        })
        return helpMessage.substring(0, helpMessage.length - 2)
    }
}