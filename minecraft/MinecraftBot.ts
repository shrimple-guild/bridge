import mineflayer from "mineflayer"
import { guildChatPattern, limboRegex as limboPattern, mcJoinLeavePattern } from "../utils/reggies.js"
import AsyncLock from "async-lock"
import TypedEmitter from "typed-emitter"
import { BridgeEvents } from "../events/BridgeEvents.js"
import { bridgeEmitter } from "../bridge.js"
import { sleep } from "../utils/utils.js"
import log4js from "log4js"


const chatDelay = 1000

const logger = log4js.getLogger("minecraft")

export class MinecraftBot  {
  username: string
  bot: mineflayer.Bot

  chatLock: AsyncLock = new AsyncLock({ maxPending: 10 })
  status: ("online" | "offline") = "offline" 
  retries: number = 0

  constructor(username: string) {
    this.username = username
    this.bot = this.connect()

    bridgeEmitter.on("botJoinedLimbo", () => {
      this.retries = 0
      this.status = "online"
    })
  }

  connect(): mineflayer.Bot {
    logger.info(`BOT: Connecting...`)
    return mineflayer.createBot({
      host: "mc.hypixel.net",
      port: 25565,
      username: this.username,
      auth: "microsoft",
      version: "1.17.1",
      checkTimeoutInterval: 10000
    }).once("spawn", () => {
      logger.info(`BOT: Spawned in world.`)
      bridgeEmitter.emit("botJoined")
      this.chat("§")
    }).on("messagestr", chat => {
      logger.info(`BOT: Message received: ${chat}`)
      this.onPatternMatch(chat, guildChatPattern, "guildChat") 
      this.onPatternMatch(chat, mcJoinLeavePattern, "mcJoinLeave")
      this.onPatternTest(chat, limboPattern, "botJoinedLimbo")
    }).on("end", async reason => {
      bridgeEmitter.emit("botLeft", reason)
      this.status = "offline"
      if (reason != "disconnect.quitting") {
        logger.warn(`BOT: Closed for reason ${reason}.`)
        if (this.retries >= 5) {
          logger.error(`BOT: Aborting because bot restarted 5 times.`)
          process.exit(1)
        } else {
          const waitTime = Math.pow(2, this.retries)
          logger.warn(`BOT: Attempting to reconnect: ${this.retries} / 5.`)
          await sleep(waitTime)
          this.connect()
          this.retries++
        }
      }
    })
  }
  
  onPatternTest(chat: string, regex: RegExp, event: keyof BridgeEvents) {
    if (regex.test(chat)) {
      logger.debug(`BOT: ${event} emitted.`)
      bridgeEmitter.emit(event)
    }
  }

  onPatternMatch(chat: string, regex: RegExp, event: keyof BridgeEvents) {
    const matchGroups = chat.match(regex)?.groups
    if (matchGroups) {
      logger.debug(`BOT: ${event} emitted with ${JSON.stringify(matchGroups)})`)
      bridgeEmitter.emit(event, matchGroups as never)
    }
  }

  async chat(chat: string): Promise<boolean> {
    return await this.chatLock.acquire("chat", async () => {
      this.bot.chat(chat)
      await sleep(chatDelay)
      return true
    }).catch(e => {
      logger.warn(`BOT: ${chat} not sent because message queue limit was exceeded.`)
      return false
    })
  }

  disconnect() {
    logger.info(`BOT: Manually disconnected.`)
    this.bot.quit()
  }
}

