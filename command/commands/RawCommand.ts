import { Command } from "./Command.js"
import { minecraftBot } from "../../minecraft/MinecraftBot.js"
import { discordBot } from "../../discord/DiscordBot.js"
import { botUsername } from "../../utils/Utils.js"

export class RawCommand implements Command {
    aliases = ["raw"]
    usage = "<data>"

    async execute(args: string[], isStaff?: boolean) {
        if (args.length === 0) return "You need to give me some data to parse."
        if (!isStaff) return "No permission"
        const message = args.join(" ")
        minecraftBot.chat(message)
        discordBot.sendGuildChatEmbed(botUsername, message, "BOT")
    }
} 