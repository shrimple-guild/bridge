import dotenv from "dotenv"
dotenv.config()

import mineflayer from "mineflayer"
import { bridgedMessageRegex, dungeonEnteredRegex, guildChatPattern, limboRegex, mcJoinLeavePattern, partyInviteRegex, privateMessageRegex } from "../utils/RegularExpressions.js"
import AsyncLock from "async-lock"
import { bridge } from "../bridge.js"
import { privilegedUsers, sleep } from "../utils/Utils.js"
import log4js from "log4js"
import { nameIsInDb } from "../utils/SkinUtils.js"

const chatDelay = 1000
const logger = log4js.getLogger("minecraft")
const chatLock = new AsyncLock({ maxPending: 10 })
const username = process.env.MC_USERNAME!

let bot: mineflayer.Bot = connect()
let status: ("online" | "offline") = "offline"
let retries: number = 0

let timeout: NodeJS.Timeout

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
    .on("messagestr", (chat) => onChat(chat, bot))
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
      const waitTime = 1000 * Math.pow(2, retries)
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

function onChat(message: string, bot: mineflayer.Bot) {
  logger.info(`[CHAT] ${message}`)

  onPatternMatch(message, limboRegex, () => {
    retries = 0
    status = "online"
    return
  })

  onPatternMatch(message, guildChatPattern, (groups) => {
    if (bridgedMessageRegex.test(message)) return
    bridge.onMinecraftChat(groups.username, groups.content, groups.hypixelRank, groups.guildRank)
    return
  })

  onPatternMatch(message, mcJoinLeavePattern, (groups) => {
    bridge.onMinecraftJoinLeave(groups.username, groups.action as ("**joined.**" | "**left.**"))
    return
  })

  onPatternMatch(message, partyInviteRegex, (groups) => {
    const fragger = groups.username
    if (!nameIsInDb(fragger)) return
    chat(`/p join ${fragger}`)
    timeout = setTimeout(() => {
      chat("/pc Leaving because 10s passed")
      chat("/p leave")
    }, 10000)
    return
  })

  onPatternMatch(message, dungeonEnteredRegex, () => {
    setTimeout(() => {
      chat("/pc Leaving because dungeon started")
      chat("/p leave")
      clearTimeout(timeout)
    }, 2000)
    return
  })

  onPatternMatch(message, privateMessageRegex, (groups) => {
    if (privilegedUsers.includes(groups.name)) {
      chat(groups.content)
    }
    return
  })
}

function onPatternMatch(chat: string, regex: RegExp, cb: (groups: { [key: string]: string }) => void) {
  const matchGroups = chat.match(regex)?.groups
  if (matchGroups) cb(matchGroups)
}

async function chat(chat: string, onCompletion?: (status: string) => void) {
  return await chatLock.acquire("chat", async () => {
    bot.chat(chat)
    await sleep(chatDelay)
  }).catch(e => {
    logger.warn(`Message not sent because ${e}.`)
    if (onCompletion) onCompletion("failed:lock")
  })
}

async function disconnect(isRestart: boolean): Promise<boolean> {
  bot.quit()
  logger.info("Manually disconnected.")
  if (isRestart) {
    logger.info("Restarting bot.")
    await sleep(2000)
    bot = connect()
  }
  return true
}

export const minecraftBot = { chat, disconnect }
