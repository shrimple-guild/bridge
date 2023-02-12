import mineflayer from "mineflayer"
import { dungeonEnteredRegex, guildChatPattern, guildJoinRegex, guildKickRegex, guildLeaveRegex, limboRegex, mcJoinLeavePattern, partyInviteRegex, partyInviteRegex2, privateMessageRegex, spamRegex } from "../../../utils/RegularExpressions.js"
import AsyncLock from "async-lock"
import { bridge } from "../bridge.js"
import log4js from "log4js"
import { nameIsInDb } from "../../../utils/playerUtils.js"
import { discordBot } from "../../../discord/DiscordBot.js"
import { sleep } from "../../../utils/Utils.js"

import config from "../../../config.json" assert { type: "json" }
const { username: botUsername, privilegedUsers } = config.minecraft

const chatDelay = 1000
const logger = log4js.getLogger("minecraft")
const chatLock = new AsyncLock({ maxPending: 10 })

let bot = connect()
let status: ("online" | "offline") = "offline"
let retries: number = 0

let timeout: NodeJS.Timeout

let lastSent = 0

function connect(): mineflayer.Bot {
  logger.info(`Connecting as ${botUsername}`)
  onConnecting()
  return mineflayer.createBot({
    host: "mc.hypixel.net",
    port: 25565,
    username: botUsername,
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
  bridge.onBotLeave(reason)
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

function onChat(message: string) {
  logger.info(`[CHAT] ${message}`)

  onPatternMatchNoGroups(message, limboRegex, async () => {
    retries = 0
    status = "online"
    await bridge.onBotJoin()
    return
  })

  onPatternMatchNoGroups(message, spamRegex, async () => {
    if (Date.now() - lastSent < 120000) return
    chat("Spam protection moment")
    lastSent = Date.now()
    return
  })

  onPatternMatch(message, guildJoinRegex, (groups) => {
    bridge.onMinecraftChat(botUsername, `**${groups.name} joined the guild!**`, "JOINED")
    return
  })

  onPatternMatch(message, guildLeaveRegex, (groups) => {
    bridge.onMinecraftChat(botUsername, `**${groups.name} left the guild!**`, "LEFT")
    return
  })

  onPatternMatch(message, guildKickRegex, (groups) => {
    bridge.onMinecraftChat(botUsername, `**${groups.name} was kicked from the guild by ${groups.name2}!**`, "LEFT")
    return
  })

  onPatternMatch(message, guildChatPattern, (groups) => {
    if (groups.username === botUsername) return
    bridge.onMinecraftChat(groups.username, groups.content, groups.hypixelRank, groups.guildRank)
    return
  })

  onPatternMatch(message, mcJoinLeavePattern, (groups) => {
    bridge.onMinecraftJoinLeave(groups.username, groups.action as ("joined" | "left"))
    return
  })

  onPatternMatch(message, partyInviteRegex, (groups) => {
    fragbot(groups.name)
    return
  })

  onPatternMatch(message, partyInviteRegex2, (groups) => {
    fragbot(groups.name)
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
      discordBot.sendGuildChatEmbed(botUsername, groups.content, "BOT")
    }
    return
  })
}

function fragbot(username: string) {
  if (!nameIsInDb(username)) return
  chat(`/p join ${username}`)
  timeout = setTimeout(() => {
    chat("/pc Leaving because 10s passed")
    chat("/p leave")
  }, 10000)
}

function onPatternMatch(chat: string, regex: RegExp, cb: (groups: { [key: string]: string }) => void) {
  const matchGroups = chat.match(regex)?.groups
  if (matchGroups) cb(matchGroups)
}

function onPatternMatchNoGroups(chat: string, regex: RegExp, cb: () => void) {
  if (regex.test(chat)) cb()
}

async function chat(msg: string, onCompletion?: (status: string) => void) {
  const split = msg.match(/.{1,256}/g)
  if (split) {
    for (const chunk of split) {
      chatRaw(chunk, onCompletion)
    }
  }
}

async function chatRaw(msg: string, onCompletion?: (status: string) => void) {
  return await chatLock.acquire("chat", async () => {
    bot.chat(msg)
    await sleep(chatDelay)
  }).catch(e => {
    logger.warn(`Message not sent because ${e}.`)
    if (onCompletion) onCompletion("failed:lock")
  })
}

async function disconnect(isRestart: boolean): Promise<boolean> {
  bot.quit()
  logger.info("Bot disconnected...")
  if (isRestart) {
    logger.info("Restarting bot.")
    await sleep(2000)
    bot = connect()
  } else {
    bridge.onBotLeave("Leaving...")
  }
  return true
}

export const minecraftBot = { chat, disconnect }
