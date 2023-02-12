import { Bridge } from "../../Bridge"

export interface BridgeCommand {
    usage?: string
    
    aliases: (string | undefined)[]
    execute(bridge: Bridge, args: string[], isStaff?: boolean): any
}