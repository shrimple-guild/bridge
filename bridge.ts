import dotenv from "dotenv"
dotenv.config()

import log4js from "log4js"
import { minecraftBot } from "./minecraft/minecraftBot.js"
import { discordBot } from "./discord/discordBot.js"
import readline from "readline"

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
    minecraftBot.disconnect()
  }
})


async function onDiscordChat(author: string, content: string, isStaff: boolean, replyAuthor?: string) {
  const replyString = replyAuthor ? ` replying to ${replyAuthor}` : ""
  const full = `${author}${replyString}: ${content}`
  await minecraftBot.chat(full)
}

function onMinecraftChat(username: string, content: string, hypixelRank?: string, guildRank?: string) {
  discordBot.sendGuildChatEmbed(username, content, hypixelRank, guildRank)
}

function onMinecraftJoinLeave(username: string, action: "joined" | "left") {

}


export const bridge = {
  onDiscordChat,
  onMinecraftChat,
  onMinecraftJoinLeave
}

