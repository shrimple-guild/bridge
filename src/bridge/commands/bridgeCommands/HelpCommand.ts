import { SimpleCommand } from "./Command.js"
import { SimpleCommandManager } from "../SimpleCommandManager"

export class HelpCommand implements SimpleCommand {
    aliases = ["help"]

    constructor(private commandManager: SimpleCommandManager) {}

    async execute(args: string[]) {
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