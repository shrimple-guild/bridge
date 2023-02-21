import { Bridge } from "../../Bridge.js"
import { SimpleCommand } from "./Command.js"

export class PingCommand implements SimpleCommand {
    aliases = ["ping"]
    
    async execute(args: string[]) {
        return "Pong!"
    }
}