import { CommandManager } from "./command/CommandManager.js";
import { DiscordBot } from "./discord/Discord.js";
import { MinecraftBot } from "./minecraft/MCBot.js";


export class Bridge {
  constructor(
    private discord: DiscordBot,
    private minecraft: MinecraftBot,
    private bridgeCommandManager: CommandManager,
  ) {}

  async onMinecraftChat(username: string, content: string, isStaff: boolean, colorAlias?: string, guildRank?: string) {
    await this.discord.sendGuildChatEmbed(username, content, colorAlias, guildRank)
    const response = await this.bridgeCommandManager.onChatMessage(content, isStaff)
    if (response) {
      this.minecraft.chat(response)
      await this.discord.sendGuildChatEmbed(this.minecraft.username, response, "BOT")
    }
  }

  async onDiscordChat(author: string, content: string, isStaff: boolean, replyAuthor: string | undefined) {
    const replyString = replyAuthor ? ` [to] ${replyAuthor}` : ""
    const message = `${author}${replyString}: ${content}`
    this.minecraft.chat(message)
    const response = await this.bridgeCommandManager.onChatMessage(content, isStaff)
    if (response) {
      this.minecraft.chat(response)
      await this.discord.sendGuildChatEmbed(this.minecraft.username, response, "BOT")
    }
  }
  
  onMinecraftJoinLeave(username: string, action: "joined" | "left") {
    this.discord.sendGuildChatEmbed(username, `**${action}.**`, action.toUpperCase())
  }
  
  async onBotLeave(reason: string) {
    await this.discord.sendSimpleEmbed(this.minecraft.username, "❌ Bot offline.", reason)
  }
  
  async onBotJoin() {
    await this.discord.sendSimpleEmbed(this.minecraft.username, "✅ Bot online.")
  }
  


}