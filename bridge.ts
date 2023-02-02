import log4js from "log4js"
import { minecraftBot } from "./minecraft/MinecraftBot.js"
import { discordBot } from "./discord/DiscordBot.js"
import readline from "readline"
import { CommandManager } from "./command/CommandManager.js"
import { botPrefix, botUsername, staffRanks } from "./utils/Utils.js"

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

export const commandManager = new CommandManager(botPrefix)

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

export const bridge = {
  onDiscordChat,
  onMinecraftChat,
  onMinecraftJoinLeave
}

