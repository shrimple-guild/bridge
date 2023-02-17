import { Bridge } from "../../Bridge.js"
import { BridgeCommand } from "./Command.js"

export class PingCommand implements BridgeCommand {
    aliases = ["ping"]
    
    execute(bridge: Bridge, args: string[]) {
        return "Pong!"
    }
}