import { Command } from "./Command.js"
import { minecraftBot } from "../../minecraft/MinecraftBot.js"

export class ReloadCommand implements Command {
    aliases = ["reloadbot", "reload", "rlb"]

    execute(args: string[], isStaff: boolean) {
        if (!isStaff) return "No permission"
        minecraftBot.disconnect(true)
    }
}