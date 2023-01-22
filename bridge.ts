import dotenv from "dotenv"
dotenv.config()

import log4js from "log4js"
import { minecraftBot } from "./minecraft/MinecraftBot.js"
import { discordBot } from "./discord/DiscordBot.js"
import readline from "readline"
import { CommandManager } from "./command/CommandManager.js"

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
  } else {
    minecraftBot.disconnect(false)
  }
})

export const commandManager = new CommandManager(process.env.PREFIX!)

async function onDiscordChat(author: string, content: string, isStaff: boolean, replyAuthor: string | undefined, onCompletion?: (status: string) => void) {
  const replyString = replyAuthor ? ` replying to ${replyAuthor}` : ""
  const full = `${author}${replyString}: ${content}`
  await minecraftBot.chat(full, onCompletion)
  const response = await commandManager.onChatMessage(content, isStaff)
  if (response) await minecraftBot.chat(response)
}

async function onMinecraftChat(username: string, content: string, hypixelRank?: string, guildRank?: string) {
  await discordBot.sendGuildChatEmbed(username, content, hypixelRank, guildRank)
  let isStaff = guildRank === "GM" || guildRank === "Comm" || guildRank === "Bot"
  const response = await commandManager.onChatMessage(content, isStaff)
  if (response) await minecraftBot.chat(response)
}

function onMinecraftJoinLeave(username: string, action: "**joined.**" | "**left.**") {
  discordBot.sendGuildChatEmbed(username, action)
}

export const bridge = {
  onDiscordChat,
  onMinecraftChat,
  onMinecraftJoinLeave
}

