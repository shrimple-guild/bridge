//import "./bridge.js"

import { Verification } from "./verify/Verification.js"
import { db } from "./database/database.js"
import { HypixelAPI } from "./api/HypixelAPI.js"
import { createDiscordBot } from "./discord/DiscordBot.js"
import { SlashCommandManager } from "./discord/commands/SlashCommandManager.js"
import config from "./fpfConfig.json" assert { type: "json" }
import { MinecraftBot } from "./minecraft/MinecraftBot.js"
import { Bridge } from "./bridge/Bridge.js"
import { BridgeCommandManager } from "./bridge/commands/BridgeCommandManager.js"
import { Logger } from "./utils/Logger.js"
import readline from "readline"
import exitHook from "async-exit-hook"
import { sleep } from "./utils/Utils.js"

const logger = new Logger()

const hypixelAPI = new HypixelAPI(config.bridge.apiKey)
const slashCommands = new SlashCommandManager()

const discordStaffRoles = config.roles.filter(role => role.isStaff).map(role => role.discord)
const minecraftStaffRoles = config.roles.filter(role => role.isStaff).map(role => role.hypixelTag)

const discord = await createDiscordBot(
  config.discord.token, 
  slashCommands, 
  discordStaffRoles,
  config.discord.channel, 
  logger.category("Discord")
)

const verification = new Verification(
  discord.client, 
  db, 
  config.discord.verificationRoles, 
  hypixelAPI, 
  slashCommands
)

const bridgeCommandManager = new BridgeCommandManager(config.bridge.prefix, config.minecraft.username, hypixelAPI)

const minecraft = new MinecraftBot(config.minecraft.username, config.minecraft.privilegedUsers, minecraftStaffRoles, logger.category("Minecraft"))
const bridge = new Bridge(discord, minecraft, bridgeCommandManager, logger.category("Bridge"))

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.on("line", (input) => {
  if (input != "quit") {
    bridge.chatAsBot(`Console: ${input}`)
  } else {
    bridge.quit()
  }
})

exitHook(async (cb) => {
  bridge.chatAsBot("Process ended.")
  await sleep(1000)
  bridge.quit()
  await sleep(1000)
  cb()
})