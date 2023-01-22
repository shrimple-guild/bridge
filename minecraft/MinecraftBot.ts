import dotenv from "dotenv"
dotenv.config()

import mineflayer from "mineflayer"
import { guildChatPattern, limboRegex as limboPattern, mcJoinLeavePattern } from "../utils/reggies.js"
import AsyncLock from "async-lock"
import { bridge } from "../bridge.js"
import { sleep } from "../utils/utils.js"
import log4js from "log4js"

const chatDelay = 1000
const logger = log4js.getLogger("minecraft")
const chatLock = new AsyncLock({ maxPending: 10 })
const username = process.env.MC_USERNAME!

let bot: mineflayer.Bot = connect()
let status: ("online" | "offline") = "offline"
let retries: number = 0

function connect(): mineflayer.Bot {
  logger.info(`Connecting as ${username}`)
  onConnecting()
  return mineflayer.createBot({
    host: "mc.hypixel.net",
    port: 25565,
    username: username,
    chatLengthLimit: 256,
    auth: "microsoft",
    version: "1.17.1",
    checkTimeoutInterval: 10000
  }).once("spawn", () => onSpawn())
    .on("messagestr", (chat) => onChat(chat))
    .on("end", async (reason) => onEnd(reason))
}

function onConnecting() {
  logger.info(`Attempting to connect`)
}

async function onEnd(reason: string) {
  logger.warn(`Disconnected for reason: ${reason}`)
  status = "offline"
  if (reason != "disconnect.quitting") {
    logger.warn(`Connection ended for reason ${reason}.`)
    if (retries >= 4) {
      logger.error(`Not reconnecting because bot restarted 5 times.`)
    } else {
      const waitTime = Math.pow(2, retries)
      logger.info(`Attempting reconnect: retry ${retries + 1} of 4.`)
      await sleep(waitTime)
      retries++
      bot = connect()
    }
  } else {
    logger.info(`Quitting.`)
  }
}

function onSpawn() {
  chat("§")
}

function onChat(chat: string) {
  logger.info(`[CHAT] ${chat}`)

  if (limboPattern.test(chat)) {
    retries = 0
    status = "online"
  } else {
    onPatternMatch(chat, guildChatPattern, (groups) => {
      if (groups.username == username) return
      bridge.onMinecraftChat(groups.username, groups.content, groups.hypixelRank, groups.guildRank)
    })
    onPatternMatch(chat, mcJoinLeavePattern, (groups) => {
      bridge.onMinecraftJoinLeave(groups.username, groups.action as ("joined" | "left"))
    })
  }
}

function onPatternMatch(chat: string, regex: RegExp, cb: (groups: { [key: string]: string }) => void) {
  const matchGroups = chat.match(regex)?.groups
  if (matchGroups) cb(matchGroups)
}

async function chat(chat: string, onCompletion?: (status: string) => void): Promise<void> {
  return await chatLock.acquire("chat", async () => {
    const sleepPromise = sleep(chatDelay, false)
    bot.chat(chat)
    if (onCompletion) {
      logger.debug("Registering listener for chat message status.")
      await new Promise<void>(async (resolve, reject) => {
        let didComplete = false
        const listener = (message: string) => {
          logger.debug(`Chat message status listener received: "${message}"`)
          const escapedChat = chat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          const pattern = RegExp(`^Guild > (?:\\[[\\w+]+\\] )?${username}(?: \\[[\\w+]+\\])?: ${escapedChat}$`)
          if (pattern.test(message)) {
            logger.debug(`Listener detected success."`)
            onCompletion("success")
            didComplete = true
            bot.off("messagestr", listener)
            resolve()
          }
        }
        bot.on("messagestr", listener)
        await sleepPromise
        if (!didComplete) {
          bot.off("messagestr", listener)
          logger.debug("Listener timed out.")
          onCompletion("failed:timeout")
        }
        resolve()
      })
    }
    await sleepPromise
    return
  }).catch(e => {
    logger.warn(`Message not sent because ${e}.`)
    if (onCompletion) onCompletion("failed:lock")
  })
}

async function disconnect(): Promise<boolean> {
  logger.info(`Manually disconnected.`)
  bot.quit()
  return true
}

export const minecraftBot = { chat, disconnect }
