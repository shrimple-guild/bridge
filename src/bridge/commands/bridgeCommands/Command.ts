import { Bridge } from "../../Bridge"

export interface SimpleCommand {
    usage?: string
    
    aliases: (string | undefined)[]
    execute(args: string[], isStaff?: boolean): Promise<string | void>
}