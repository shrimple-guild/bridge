import { BridgeCommand } from "./Command.js"
import { BridgeCommandManager } from "../BridgeCommandManager"

export class HelpCommand implements BridgeCommand {
    aliases = ["help"]

    constructor(private commandManager: BridgeCommandManager) {}

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