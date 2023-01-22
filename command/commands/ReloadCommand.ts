import { CommandManager } from "../CommandManager"

export class ReloadCommand implements Command {
    aliases = ["reloadbot", "reload", "rlb"]
    
    constructor(private commandManager: CommandManager) {}

    execute(args: string[]) {
        const rank = args.pop()
        if (rank === "Comm" || rank === "GM") {
            this.commandManager.mcController.disconnect()
            return null
        }
        return "No permission"
    }
}