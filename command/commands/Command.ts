interface Command {
    usage?: string
    
    aliases: (string | undefined)[]
    execute(args: string[]): any
}