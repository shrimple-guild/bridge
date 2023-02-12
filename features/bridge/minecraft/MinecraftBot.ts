import AsyncLock from "async-lock"
import mineflayer from "mineflayer"
import { Bridge } from "../Bridge.js"
import { nameIsInDb } from "../../../utils/playerUtils.js"
import { sleep } from "../../../utils/utils.js"
import { PatternManager } from "./PatternManager.js"

export class MinecraftBot {
  bridge?: Bridge

  private bot: mineflayer.Bot
  private status: "online" | "offline" = "offline"
  private retries: number = 0
  private spamProtectionLastSent: number = 0
  private chatLock = new AsyncLock({ maxPending: 10 })
  private chatDelay = 1000
  private fragbotTimeout?: NodeJS.Timeout

  constructor(
    readonly username: string, 
    private privilegedUsers?: string[],
    private staffRanks?: string[]
  ) {
    this.bot = this.connect(username)
  }

  connect(username: string) {
    console.log("Connecting...")
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

  sendToBridge(username: string, content: string, colorAlias?: string, guildRank?: string) {
    this.bridge?.onMinecraftChat(username, content, this.isStaff(guildRank), colorAlias, guildRank)
  }

  isStaff(guildRank?: string) {
    return guildRank ? (this.staffRanks?.includes(guildRank) ?? false) : false
  }

  setOnline() {
    this.status = "online"
    this.retries = 0
    this.bridge?.onBotJoin()
  }

  onSpamProtection() {
    if (Date.now() - this.spamProtectionLastSent < 120000) return
    this.chat("Spam protection moment")
    this.spamProtectionLastSent = Date.now()
  }

  chat(msg: string, onCompletion?: (status: string) => void) {
    const split = msg.match(/.{1,256}/g)
    if (split) {
      for (const chunk of split) {
        this.chatRaw(chunk, onCompletion)
      }
    }
  }
  
  async chatRaw(msg: string, onCompletion?: (status: string) => void) {
    return await this.chatLock.acquire("chat", async () => {
      this.bot?.chat(msg)
      await sleep(this.chatDelay)
    }).catch(e => {
      if (onCompletion) onCompletion("failed:lock")
    })
  }
  
  async onEnd(reason: string) {
    this.status = "offline"
    this.bridge?.onBotLeave(reason)
    if (reason != "disconnect.quitting") {
      if (this.retries >= 4) {
      } else {
        const waitTime = 1000 * Math.pow(2, this.retries)
        await sleep(waitTime)
        this.retries++
        this.connect(this.username)
      }
    } 
  }
  
  onSpawn() {
    this.chat("§")
  }
  
  isPrivileged(username: string) {
    return this.privilegedUsers?.includes(username) ?? false
  }

  onChat(message: string) {
    PatternManager.execute(this, message)
  }

  quit() {
    this.bot.quit()
  }

  fragbot(username: string) {
    if (!nameIsInDb(username)) return
    this.chat(`/p join ${username}`)
    this.fragbotTimeout = setTimeout(() => {
      this.chat("/pc Leaving because 10s passed")
      this.clearFragbot()
    }, 10000)
  }

  clearFragbot() {
    setTimeout(() => {
      this.chat("/p leave")
      clearTimeout(this.fragbotTimeout)
    }, 2000)
  }

}




