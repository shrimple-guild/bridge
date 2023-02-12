import log4js from "log4js"
import { minecraftBot } from "./minecraft/MinecraftBot.js"
import { discordBot } from "../../discord/DiscordBot.js"
import readline from "readline"
import { BridgeCommandManager } from "./commands/BridgeCommandManager.js"
import { sleep } from "../../utils/Utils.js"
import exitHook from "async-exit-hook"
import { HypixelAPI } from "../../api/HypixelAPI.js"

import config from "../../config.json" assert { type: "json" }
const { apiKey, prefix } = config.bridge
const botUsername = config.minecraft.username
const staffRanks = config.roles.filter(role => role.isStaff).map(role => role.hypixelTag)

log4js.configure({
  appenders: {
    out: { type: "stdout" },
  },
  categories: {
    bridge: { appenders: ["out"], level: "debug" },
    minecraft: { appenders: ["out"], level: "debug" },
    discord: { appenders: ["out"], level: "debug" },
    default: { appenders: ["out"], level: "debug" }
  },
})

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.on("line", (input) => {
  if (input != "quit") {
    minecraftBot.chat(input)
    discordBot.sendGuildChatEmbed(botUsername, `Console: ${input}`, "BOT")
  } else {
    minecraftBot.disconnect(false)
  }
})

export const hypixelAPI = new HypixelAPI(apiKey)
export const commandManager = new BridgeCommandManager(prefix, botUsername, hypixelAPI)

async function onDiscordChat(author: string, content: string, isStaff: boolean, replyAuthor: string | undefined, onCompletion?: (status: string) => void) {
  const replyString = replyAuthor ? ` [to] ${replyAuthor}` : ""
  const full = `${author}${replyString}: ${content}`
  await minecraftBot.chat(full, onCompletion)
  const response = await commandManager.onChatMessage(content, isStaff)
  if (response) {
    await minecraftBot.chat(response)
    await discordBot.sendGuildChatEmbed(botUsername, response, "BOT")
  }
}

async function onMinecraftChat(username: string, content: string, colorAlias?: string, guildRank?: string) {
  await discordBot.sendGuildChatEmbed(username, content, colorAlias, guildRank)
  let isStaff = staffRanks.includes(guildRank ?? "")
  const response = await commandManager.onChatMessage(content, isStaff)
  if (response) {
    await minecraftBot.chat(response)
    await discordBot.sendGuildChatEmbed(botUsername, response, "BOT")
  }
}

function onMinecraftJoinLeave(username: string, action: "joined" | "left") {
  discordBot.sendGuildChatEmbed(username, `**${action}.**`, action.toUpperCase())
}

async function onBotLeave(reason: string) {
  await discordBot.sendSimpleEmbed(botUsername, "❌ Bot offline.", reason)
}

async function onBotJoin() {
  await discordBot.sendSimpleEmbed(botUsername, "✅ Bot online.")
}

export const bridge = {
  onDiscordChat,
  onMinecraftChat,
  onMinecraftJoinLeave,
  onBotLeave,
  onBotJoin
}

exitHook((cb) => {
  minecraftBot.disconnect(false)
  sleep(1000).then(() => cb())
})