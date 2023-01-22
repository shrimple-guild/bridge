import { Command } from "./Command.js"
import { CommandManager } from "../CommandManager"

export class HelpCommand implements Command {
    aliases = ["help"]

    constructor(private commandManager: CommandManager) {}

    execute(args: string[]) {
        let helpMessage = "Available commands: "
        this.commandManager.commands.forEach(command => {
            helpMessage += `${this.commandManager.prefix}`
            if (command.aliases.length == 1) {
                helpMessage += `${command.aliases[0]} `
            } else {
                helpMessage += `${command.aliases.join("|")}`
            }
            const usage = command.usage
            helpMessage += usage ? ` ${usage}, ` : ", "
        })
        return helpMessage = helpMessage.substring(0, helpMessage.length - 2)
    }
}