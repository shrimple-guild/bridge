import { BridgeCommand } from "./Command.js"

export class PingCommand implements BridgeCommand {
    aliases = ["ping"]
    
    execute(args: string[]) {
        return "Pong!"
    }
}