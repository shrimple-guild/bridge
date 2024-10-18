import { SimpleCommand } from "./Command.js"

export class PingCommand extends SimpleCommand {
    aliases = ["ping"]
    
    async execute(args: string[]) {
        return "Pong!"
    }
}