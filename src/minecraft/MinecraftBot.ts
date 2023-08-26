import AsyncLock from "async-lock"
import mineflayer from "mineflayer"
import { Bridge } from "../bridge/Bridge.js"
import { sleep } from "../utils/utils.js"
import { PatternManager } from "./PatternManager.js"
import { LoggerCategory } from "../utils/Logger.js"
import { PriorityLock } from "../utils/PriorityLock.js"

export class MinecraftBot {
  bridge?: Bridge

  private bot: mineflayer.Bot
  private status: "online" | "offline" = "offline"
  private retries: number = 0
  private spamProtectionLastSent: number = 0
  private chatLock = new PriorityLock(10)
  private chatDelay = 1000

  constructor(
    readonly username: string, 
    private privilegedUsers?: string[],
    private staffRanks?: string[],
    private logger?: LoggerCategory
  ) {
    this.bot = this.connect(username)
  }

  connect(username: string) {
    this.logger?.info("Connecting...")
    const bot = mineflayer.createBot({
      host: "mc.hypixel.net",
      port: 25565,
      username: username,
      chatLengthLimit: 256,
      auth: "microsoft",
      version: "1.17.1",
      checkTimeoutInterval: 10000
    })
    bot.on("messagestr", (chat) => this.onChat(chat))
    bot.on("end", (reason) => this.onEnd(reason))
    bot.once("spawn", () => this.onSpawn())
    this.bot = bot
    return bot
  }

  async sendToBridge(username: string, content: string, colorAlias?: string, guildRank?: string) {
    await this.bridge?.onMinecraftChat(username, content, this.isStaff(guildRank), colorAlias, guildRank)
  }

  isStaff(guildRank?: string) {
    return guildRank ? (this.staffRanks?.includes(guildRank) ?? false) : false
  }

  async setOnline() {
    this.logger?.info("Bot online.")
    this.status = "online"
    this.retries = 0
    await this.bridge?.onBotJoin()
  }

  async onSpamProtection() {
    if (Date.now() - this.spamProtectionLastSent < 120000) return
    await this.chat("Spam protection moment")
    this.spamProtectionLastSent = Date.now()
  }

  async chat(msg: string, priority?: number) {
    const split = msg.match(/.{1,256}/g)
    if (split) {
      for (const chunk of split) {
        await this.chatRaw(chunk, priority)
      }
    }
  }
  
  async chatRaw(msg: string, priority?: number) {
    return this.chatLock.acquire(async () => {
      this.bot?.chat(msg)
      await sleep(this.chatDelay)
    }).catch(e => {
      this.logger?.error(e)
    })
  }
  
  async onEnd(reason: string) {
    this.logger?.warn(`Disconnected (reason: ${reason}).`)
    this.status = "offline"
    await this.bridge?.onBotLeave(reason)
    if (reason != "disconnect.quitting") {
      const waitTime = Math.min(1000 * Math.pow(2, this.retries), 60 * 10 * 1000)
      await sleep(waitTime)
      this.connect(this.username)
      this.retries++
    } 
  }
  
  async onSpawn() {
    await this.chat("§")
  }
  
  isPrivileged(username: string) {
    return this.privilegedUsers?.includes(username) ?? false
  }

  onChat(message: string) {
    const matchedPattern = PatternManager.execute(this, message, this.logger)
  }

  quit() {
    this.bot.quit()
  }
}




