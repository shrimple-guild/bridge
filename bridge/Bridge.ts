import { BridgeCommandManager } from "./commands/BridgeCommandManager.js";
import { DiscordBot } from "../discord/DiscordBot.js";
import { MinecraftBot } from "../minecraft/MinecraftBot.js";
import { sleep } from "../utils/utils.js";
import { LoggerCategory } from "../utils/Logger.js";

export class Bridge {
  constructor(
    private discord: DiscordBot,
    private minecraft: MinecraftBot,
    private bridgeCommandManager: BridgeCommandManager,
    private logger: LoggerCategory
  ) {
    minecraft.bridge = this
    discord.bridge = this
  }

  async onMinecraftChat(username: string, content: string, isStaff: boolean, colorAlias?: string, guildRank?: string) {
    await this.discord.sendGuildChatEmbed(username, content, colorAlias, guildRank)
    await this.handleCommand(content, isStaff)
  }

  async onDiscordChat(author: string, content: string, isStaff: boolean, replyAuthor: string | undefined) {
    const replyString = replyAuthor ? ` [to] ${replyAuthor}` : ""
    const message = `${author}${replyString}: ${content}`
    this.minecraft.chat(`/gc ${message}`)
    await this.handleCommand(content, isStaff)
  }

  async handleCommand(content: string, isStaff: boolean) {
    const response = await this.bridgeCommandManager.execute(this, content, isStaff, this.logger)
    if (response) {
      await this.chatAsBot(`/gc > ${response}`)
    }
  }

  async chatAsBot(content: string) {
    this.minecraft.chat(content)
    await this.discord.sendGuildChatEmbed(this.minecraft.username, content, "BOT")
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

  async quit() {
    this.minecraft.quit()
  }

  async reload() {
    this.quit()
    await sleep(2000)
    this.minecraft.connect(this.minecraft.username)
  }
}
