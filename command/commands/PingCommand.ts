class PingCommand implements Command {
    aliases = ["ping"]
    
    execute(args: string[]) {
        return "Pong!"
    }
}