import { SimpleCommandManager } from "./commands/SimpleCommandManager.js";
import { DiscordBot } from "../discord/discordBot.js";
import { MinecraftBot } from "../minecraft/MinecraftBot.js";
import { sleep } from "../utils/utils.js";
import { LoggerCategory } from "../utils/Logger.js";

type GuildRole = {
  name: string,
  sbLevel: number,
  fishingXp: number,
  priority: number
}

export class Bridge {
  constructor(
    private discord: DiscordBot,
    private minecraft: MinecraftBot,
    private commandManager: SimpleCommandManager,
    private logger: LoggerCategory,
    public roles: GuildRole[] | undefined
  ) {
    minecraft.bridge = this
    discord.bridge = this
    commandManager.addBridgeCommands(this)
  }

  async onMinecraftChat(username: string, content: string, isStaff: boolean, colorAlias?: string, guildRank?: string) {
    await this.discord.sendGuildChatEmbed(username, content, colorAlias, guildRank)
    await this.handleCommand(content, isStaff, username)
  }

  async onDiscordChat(author: string, content: string, isStaff: boolean, replyAuthor: string | undefined) {
    const replyString = replyAuthor ? ` [to] ${replyAuthor}` : ""
    const message = `${author}${replyString}: ${content}`
    this.minecraft.chat(`/gc ${message}`)
    await this.handleCommand(content, isStaff)
  }

  async handleCommand(content: string, isStaff: boolean, username?: string) {
    const response = await this.commandManager.execute(content, isStaff, username)
    if (response) {
      await this.chatAsBot(response)
    }
  }

  async chatMinecraftRaw(content: string, priority?: number) {
    this.minecraft.chatRaw(content, priority)
  }

  async chatAsBot(content: string, priority?: number) {
    this.minecraft.chat(content, priority)
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